import ora from "ora";
import path from "path";
import fs from "fs-extra";
import { randomBytes } from "node:crypto";
import { fetchRegistry, fetchFile } from "../utils/registry";
import { installDependencies, ensurePackageManagerAvailable } from "../utils/pm";
import { resolveDependencies } from "../utils/dependency";
import { updateEnvFile, updateEnvSchema, ENV_CONFIGS } from "../utils/env-manager";
import { resolveSafeTargetPath } from "../utils/paths";
import { escapeRegex } from "../utils/code-inject";
import chalk from "chalk";
import { readZuroConfig } from "../utils/config";
import { showNonZuroProjectMessage, showInitFirstMessage } from "../utils/project-guard";

import {
    parseDatabaseDialect,
    isDatabaseModule,
    ensureSchemaExport,
    printDatabaseHints,
    promptDatabaseConfig,
    type DatabaseModuleName,
} from "../handlers/database.handler";
import {
    injectAuthRoutes,
    injectAuthDocs,
    promptAuthConfig,
    printAuthHints,
} from "../handlers/auth.handler";
import {
    promptMailerConfig,
    printMailerHints,
} from "../handlers/mailer.handler";
import {
    isDocsModuleInstalled,
    injectDocsRoutes,
    printDocsHints,
} from "../handlers/docs.handler";
import {
    injectErrorHandler,
} from "../handlers/error-handler.handler";
import {
    injectRateLimiter,
} from "../handlers/rate-limiter.handler";
import {
    isAuthModuleInstalled,
} from "../handlers/auth.handler";

export interface AddCommandOptions {
    dialect?: string;
    dbUrl?: string;
    yes?: boolean;
}

function resolvePackageManager(projectRoot: string) {
    if (fs.existsSync(path.join(projectRoot, "pnpm-lock.yaml"))) {
        return "pnpm";
    }

    if (fs.existsSync(path.join(projectRoot, "bun.lockb")) || fs.existsSync(path.join(projectRoot, "bun.lock"))) {
        return "bun";
    }

    if (fs.existsSync(path.join(projectRoot, "yarn.lock"))) {
        return "yarn";
    }

    return "npm";
}

function getModuleDocsPath(moduleName: string) {
    if (isDatabaseModule(moduleName)) {
        return "database";
    }

    return moduleName;
}

async function hasEnvVariable(projectRoot: string, key: string): Promise<boolean> {
    const envPath = path.join(projectRoot, ".env");
    if (!await fs.pathExists(envPath)) {
        return false;
    }

    const content = await fs.readFile(envPath, "utf-8");
    const pattern = new RegExp(`^${escapeRegex(key)}=`, "m");
    return pattern.test(content);
}

async function isLikelyEmptyDirectory(cwd: string): Promise<boolean> {
    const entries = await fs.readdir(cwd);
    const ignored = new Set([".ds_store", "thumbs.db"]);

    return entries.filter((entry) => !ignored.has(entry.toLowerCase())).length === 0;
}

// ─── Main Orchestrator ─────────────────────────────────────────────

export const add = async (moduleName: string, options: AddCommandOptions = {}) => {
    const projectRoot = process.cwd();
    const projectConfig = await readZuroConfig(projectRoot);
    if (!projectConfig) {
        if (await isLikelyEmptyDirectory(projectRoot)) {
            showInitFirstMessage();
            return;
        }

        showNonZuroProjectMessage();
        return;
    }
    const srcDir = projectConfig.srcDir || "src";
    let resolvedModuleName = moduleName;
    const parsedDialect = parseDatabaseDialect(moduleName);
    if (parsedDialect) {
        resolvedModuleName = parsedDialect;
    }

    // ── Module-specific prompts ─────────────────────────────────────

    let customDbUrl: string | undefined;
    let usedDefaultDbUrl = false;
    let databaseBackupPath: string | null = null;
    let generatedAuthSecret = false;
    let authDatabaseDialect: DatabaseModuleName | null = null;
    let customSmtpVars: Record<string, string> | undefined;
    let usedDefaultSmtp = false;
    let mailerProvider: "smtp" | "resend" = "smtp";
    let shouldInstallDocsForAuth = false;

    if (resolvedModuleName === "database" || isDatabaseModule(resolvedModuleName)) {
        const result = await promptDatabaseConfig(resolvedModuleName, projectRoot, srcDir);
        if (!result) return;

        resolvedModuleName = result.resolvedModuleName;
        customDbUrl = result.customDbUrl;
        usedDefaultDbUrl = result.usedDefaultDbUrl;
        databaseBackupPath = result.databaseBackupPath;
    }

    if (resolvedModuleName === "mailer") {
        const result = await promptMailerConfig();
        if (!result) return;

        mailerProvider = result.mailerProvider;
        customSmtpVars = result.customSmtpVars;
        usedDefaultSmtp = result.usedDefaultSmtp;
    }

    if (resolvedModuleName === "auth") {
        const result = await promptAuthConfig(projectRoot, srcDir, options);
        if (!result) return;

        shouldInstallDocsForAuth = result.shouldInstallDocsForAuth;
        authDatabaseDialect = result.authDatabaseDialect;
    }

    // ── Registry fetch & install ────────────────────────────────────

    const pm = resolvePackageManager(projectRoot);
    const spinner = ora(`Checking registry for ${resolvedModuleName}...`).start();
    let currentStep = "package manager preflight";

    try {
        spinner.text = `Checking ${pm} availability...`;
        await ensurePackageManagerAvailable(pm);

        currentStep = "registry fetch";
        spinner.text = `Checking registry for ${resolvedModuleName}...`;
        const registryContext = await fetchRegistry();
        const module = registryContext.manifest.modules[resolvedModuleName];

        if (!module) {
            spinner.fail(`Module '${resolvedModuleName}' not found.`);
            return;
        }

        spinner.succeed(`Found module: ${chalk.cyan(resolvedModuleName)}`);

        const moduleDeps = module.moduleDependencies || [];
        currentStep = "module dependency resolution";
        await resolveDependencies(moduleDeps, projectRoot);

        currentStep = "dependency installation";
        spinner.start("Installing dependencies...");

        let runtimeDeps = module.dependencies || [];
        let devDeps = module.devDependencies || [];

        if (resolvedModuleName === "mailer") {
            if (mailerProvider === "resend") {
                runtimeDeps = ["resend"];
                devDeps = [];
            } else {
                runtimeDeps = ["nodemailer"];
                devDeps = ["@types/nodemailer"];
            }
        }

        await installDependencies(pm, runtimeDeps, projectRoot);
        await installDependencies(pm, devDeps, projectRoot, { dev: true });

        spinner.succeed("Dependencies installed");

        // ── Scaffold files ──────────────────────────────────────────

        currentStep = "module scaffolding";
        spinner.start("Scaffolding files...");

        for (const file of module.files) {
            let fetchPath = file.path;
            let expectedSha256 = file.sha256;
            let expectedSize = file.size;

            if (
                resolvedModuleName === "auth"
                && file.target === "db/schema/auth.ts"
                && authDatabaseDialect === "database-mysql"
            ) {
                fetchPath = "express/db/schema/auth.mysql.ts";
                expectedSha256 = undefined;
                expectedSize = undefined;
            }

            if (
                resolvedModuleName === "mailer"
                && file.target === "lib/mailer.ts"
                && mailerProvider === "resend"
            ) {
                fetchPath = "express/lib/mailer.resend.ts";
                expectedSha256 = undefined;
                expectedSize = undefined;
            }

            let content = await fetchFile(fetchPath, {
                baseUrl: registryContext.fileBaseUrl,
                expectedSha256,
                expectedSize,
            });

            if (isDatabaseModule(resolvedModuleName) && file.target === "../drizzle.config.ts") {
                const normalizedSrcDir = srcDir.replace(/\\/g, "/");
                content = content.replace(
                    /schema:\s*["'][^"']+["']/,
                    `schema: "./${normalizedSrcDir}/db/schema/*"`
                );
            }

            const targetPath = resolveSafeTargetPath(projectRoot, srcDir, file);

            await fs.ensureDir(path.dirname(targetPath));
            await fs.writeFile(targetPath, content);
        }

        const schemaExports = module.files
            .map((file) => file.target.replace(/\\/g, "/"))
            .filter((target) => /^db\/schema\/[^/]+\.ts$/.test(target))
            .map((target) => path.posix.basename(target, ".ts"))
            .filter((name) => name !== "index");

        for (const schemaFileName of schemaExports) {
            await ensureSchemaExport(projectRoot, srcDir, schemaFileName);
        }

        spinner.succeed("Files generated");

        // ── Post-install hooks ──────────────────────────────────────

        if (resolvedModuleName === "auth") {
            spinner.start("Configuring routes...");
            const injected = await injectAuthRoutes(projectRoot, srcDir);
            if (injected) {
                spinner.succeed("Routes configured");
            } else {
                spinner.warn("Could not configure routes automatically");
            }

            const docsInstalled = await isDocsModuleInstalled(projectRoot, srcDir);
            if (docsInstalled) {
                spinner.start("Adding auth endpoints to API docs...");
                const authDocsInjected = await injectAuthDocs(projectRoot, srcDir);
                if (authDocsInjected) {
                    spinner.succeed("Auth endpoints added to API docs");
                } else {
                    spinner.warn("Could not update API docs automatically");
                }
            }
        }

        if (resolvedModuleName === "error-handler") {
            spinner.start("Configuring error handler in app.ts...");
            const injected = await injectErrorHandler(projectRoot, srcDir);
            if (injected) {
                spinner.succeed("Error handler configured in app.ts");
            } else {
                spinner.warn("Could not find app.ts - error handler needs manual setup");
            }
        }

        if (resolvedModuleName === "rate-limiter") {
            spinner.start("Configuring rate limiter in app.ts...");
            const injected = await injectRateLimiter(projectRoot, srcDir);
            if (injected) {
                spinner.succeed("Rate limiter configured in app.ts");
            } else {
                spinner.warn("Could not find app.ts - rate limiter needs manual setup");
            }
        }

        if (resolvedModuleName === "docs") {
            spinner.start("Configuring docs routes...");
            const injected = await injectDocsRoutes(projectRoot, srcDir);
            if (injected) {
                spinner.succeed("Docs routes configured");
            } else {
                spinner.warn("Could not configure docs routes automatically");
            }

            const authInstalled = await isAuthModuleInstalled(projectRoot, srcDir);
            if (authInstalled) {
                spinner.start("Adding auth endpoints to API docs...");
                const authDocsInjected = await injectAuthDocs(projectRoot, srcDir);
                if (authDocsInjected) {
                    spinner.succeed("Auth endpoints added to API docs");
                } else {
                    spinner.warn("Could not update API docs automatically");
                }
            }
        }

        // ── Environment configuration ───────────────────────────────

        let envConfigKey = resolvedModuleName;
        if (resolvedModuleName === "mailer" && mailerProvider === "resend") {
            envConfigKey = "mailer-resend";
        }

        const envConfig = ENV_CONFIGS[envConfigKey as keyof typeof ENV_CONFIGS];
        if (envConfig) {
            currentStep = "environment configuration";
            spinner.start("Updating environment configuration...");

            const envVars: Record<string, string> = { ...envConfig.envVars };
            if (customDbUrl && isDatabaseModule(resolvedModuleName)) {
                envVars.DATABASE_URL = customDbUrl;
            }

            if (resolvedModuleName === "mailer" && customSmtpVars) {
                Object.assign(envVars, customSmtpVars);
            }

            if (resolvedModuleName === "auth") {
                const hasExistingSecret = await hasEnvVariable(projectRoot, "BETTER_AUTH_SECRET");
                if (!hasExistingSecret) {
                    envVars.BETTER_AUTH_SECRET = randomBytes(32).toString("hex");
                    generatedAuthSecret = true;
                }
            }

            await updateEnvFile(projectRoot, envVars, true, {
                overwriteExisting: isDatabaseModule(resolvedModuleName),
            });
            await updateEnvSchema(projectRoot, srcDir, envConfig.schemaFields);

            spinner.succeed("Environment configured");
        }

        // ── Success output & hints ──────────────────────────────────

        console.log(chalk.green(`\n✔ ${resolvedModuleName} added successfully!\n`));

        const docsPath = getModuleDocsPath(resolvedModuleName);
        const docsUrl = `https://zuro-cli.devbybriyan.com/docs/${docsPath}`;
        console.log(chalk.blue(`ℹ Docs: ${docsUrl}`));

        if (isDatabaseModule(resolvedModuleName)) {
            printDatabaseHints(resolvedModuleName, customDbUrl, usedDefaultDbUrl, databaseBackupPath);
        }

        if (resolvedModuleName === "auth") {
            printAuthHints(generatedAuthSecret);
        }

        if (resolvedModuleName === "mailer") {
            printMailerHints(usedDefaultSmtp);
        }

        if (resolvedModuleName === "docs") {
            printDocsHints();
        }

        if (resolvedModuleName === "auth" && shouldInstallDocsForAuth) {
            console.log(chalk.blue("\nℹ Installing API docs module..."));
            await add("docs", { yes: true });
        }
    } catch (error) {
        spinner.fail(chalk.red(`Failed during ${currentStep}.`));
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(chalk.red(errorMessage));
        console.log(`\n${chalk.bold("Retry:")}`);
        console.log(chalk.cyan(`  npx zuro-cli add ${resolvedModuleName}`));
    }
};
