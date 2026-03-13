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
import { readZuroConfig, writeZuroConfig } from "../utils/config";
import { showNonZuroProjectMessage, showInitFirstMessage } from "../utils/project-guard";

import {
    parseDatabaseDialect,
    isDatabaseModule,
    isDrizzleDatabaseModule,
    ensureSchemaExport,
    printDatabaseHints,
    promptDatabaseConfig,
    detectInstalledDatabaseDialect,
    type DatabaseModuleName,
    type DatabaseOrm,
    type DatabaseDialect,
    getDatabaseSelection,
} from "../handlers/database.handler";
import {
    injectAuthRoutes,
    injectAuthDocs,
    promptAuthConfig,
    printAuthHints,
    detectInstalledAuthProvider,
    type AuthProvider,
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
import {
    detectInstalledUploadsMode,
    getUploadEnvSchemaFields,
    injectUploadsDocs,
    injectUploadsRoutes,
    isUploadsModuleInstalled,
    printUploadHints,
    promptUploadsConfig,
    type UploadPromptResult,
} from "../handlers/uploads.handler";

export interface AddCommandOptions {
    dialect?: string;
    dbUrl?: string;
    yes?: boolean;
    authProvider?: AuthProvider;
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
    let selectedDatabaseOrm: DatabaseOrm | null = null;
    let selectedDatabaseDialect: DatabaseDialect | null = null;
    let generatedAuthSecret = false;
    let authDatabaseDialect: DatabaseModuleName | null = null;
    let authProvider: AuthProvider = options.authProvider || "better-auth";
    let uploadAuthProvider: AuthProvider | null = null;
    let customSmtpVars: Record<string, string> | undefined;
    let usedDefaultSmtp = false;
    let mailerProvider: "smtp" | "resend" = "smtp";
    let shouldInstallDocsForAuth = false;
    let uploadConfig: UploadPromptResult | null = null;
    let uploadDatabaseDialect: DatabaseModuleName | null = null;

    if (resolvedModuleName === "database" || isDatabaseModule(resolvedModuleName)) {
        const result = await promptDatabaseConfig(resolvedModuleName, projectRoot, srcDir);
        if (!result) return;

        resolvedModuleName = result.resolvedModuleName;
        selectedDatabaseOrm = result.selectedOrm;
        selectedDatabaseDialect = result.selectedDialect;
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

        authProvider = result.authProvider;
        shouldInstallDocsForAuth = result.shouldInstallDocsForAuth;
        authDatabaseDialect = result.authDatabaseDialect;
    }

    if (resolvedModuleName === "uploads") {
        uploadConfig = await promptUploadsConfig(projectRoot, srcDir);
        if (!uploadConfig) return;
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

        if (resolvedModuleName === "uploads" && uploadConfig) {
            const errorHandlerInstalled = fs.existsSync(path.join(projectRoot, srcDir, "lib", "errors.ts"));
            if (!errorHandlerInstalled) {
                console.log(chalk.blue("\nℹ Uploads needs the error-handler module. Installing error-handler..."));
                await add("error-handler");
            }

            if (uploadConfig.shouldInstallDatabase) {
                console.log(chalk.blue("\nℹ Upload metadata needs a Drizzle database. Installing database module..."));
                await add("database");
            }

            if (uploadConfig.shouldInstallAuth) {
                console.log(chalk.blue("\nℹ Upload auth needs the auth module. Installing auth module..."));
                await add("auth", { yes: true });
            }

            uploadDatabaseDialect = await detectInstalledDatabaseDialect(projectRoot, srcDir);
            uploadAuthProvider = await detectInstalledAuthProvider(projectRoot, srcDir);
            if (uploadConfig.useDatabaseMetadata) {
                if (uploadDatabaseDialect === "database-prisma-pg" || uploadDatabaseDialect === "database-prisma-mysql") {
                    spinner.fail("Uploads metadata currently supports Drizzle-based database setup only.");
                    console.log(chalk.yellow("ℹ Install a Drizzle database, or rerun uploads without metadata."));
                    return;
                }

                if (!uploadDatabaseDialect) {
                    spinner.fail("Could not detect a database setup for uploads metadata.");
                    console.log(chalk.yellow("ℹ Install the database module first, then rerun uploads."));
                    return;
                }
            }
        }

        if (resolvedModuleName === "auth") {
            authDatabaseDialect = await detectInstalledDatabaseDialect(projectRoot, srcDir);
            if (authDatabaseDialect === "database-prisma-pg" || authDatabaseDialect === "database-prisma-mysql") {
                spinner.fail("Auth module currently supports Drizzle-based database setup only.");
                console.log(chalk.yellow("ℹ Install auth after switching database ORM to Drizzle."));
                return;
            }
        }

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

        if (resolvedModuleName === "auth") {
            if (authProvider === "jwt") {
                runtimeDeps = ["jsonwebtoken", "bcryptjs"];
                devDeps = ["@types/jsonwebtoken", "@types/bcryptjs"];
            } else {
                runtimeDeps = ["better-auth"];
                devDeps = [];
            }
        }

        if (resolvedModuleName === "uploads" && uploadConfig) {
            runtimeDeps = ["multer"];
            devDeps = ["@types/multer"];

            if (uploadConfig.provider === "cloudinary") {
                runtimeDeps.push("cloudinary");
            } else {
                runtimeDeps.push("@aws-sdk/client-s3", "@aws-sdk/s3-request-presigner");
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
                && authProvider === "better-auth"
                && (file.target === "routes/auth.routes.ts" || file.target === "controllers/auth.controller.ts")
            ) {
                continue;
            }

            if (
                resolvedModuleName === "auth"
                && file.target === "db/schema/auth.ts"
                && authDatabaseDialect === "database-mysql"
            ) {
                fetchPath = "express/db/schema/auth.mysql.ts";
                expectedSha256 = undefined;
                expectedSize = undefined;
            }

            if (resolvedModuleName === "auth" && authProvider === "jwt") {
                if (file.target === "lib/auth.ts") {
                    fetchPath = "express/lib/auth.jwt.ts";
                    expectedSha256 = undefined;
                    expectedSize = undefined;
                }

                if (file.target === "controllers/user.controller.ts") {
                    fetchPath = "express/controllers/user.controller.jwt.ts";
                    expectedSha256 = undefined;
                    expectedSize = undefined;
                }

                if (file.target === "routes/user.routes.ts") {
                    fetchPath = "express/routes/user.routes.jwt.ts";
                    expectedSha256 = undefined;
                    expectedSize = undefined;
                }

                if (file.target === "controllers/auth.controller.ts") {
                    fetchPath = "express/controllers/auth.controller.jwt.ts";
                    expectedSha256 = undefined;
                    expectedSize = undefined;
                }

                if (file.target === "routes/auth.routes.ts") {
                    fetchPath = "express/routes/auth.routes.jwt.ts";
                    expectedSha256 = undefined;
                    expectedSize = undefined;
                }

                if (file.target === "db/schema/auth.ts") {
                    fetchPath = authDatabaseDialect === "database-mysql"
                        ? "express/db/schema/auth.mysql.jwt.ts"
                        : "express/db/schema/auth.jwt.ts";
                    expectedSha256 = undefined;
                    expectedSize = undefined;
                }
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

            if (resolvedModuleName === "uploads" && uploadConfig) {
                if (file.target === "lib/uploads/provider.ts") {
                    fetchPath = uploadConfig.provider === "cloudinary"
                        ? "express/lib/uploads/provider.cloudinary.ts"
                        : "express/lib/uploads/provider.s3.ts";
                    expectedSha256 = undefined;
                    expectedSize = undefined;
                }

                if (file.target === "lib/uploads/metadata.ts") {
                    fetchPath = uploadConfig.useDatabaseMetadata
                        ? "express/lib/uploads/metadata.db.ts"
                        : "express/lib/uploads/metadata.noop.ts";
                    expectedSha256 = undefined;
                    expectedSize = undefined;
                }

                if (file.target === "middleware/upload-auth.ts") {
                    if (uploadConfig.authMode === "none") {
                        fetchPath = "express/middleware/upload-auth.none.ts";
                    } else {
                        const providerSuffix = uploadAuthProvider === "jwt" ? "jwt" : "better-auth";
                        fetchPath = `express/middleware/upload-auth.required.${providerSuffix}.ts`;
                    }
                    expectedSha256 = undefined;
                    expectedSize = undefined;
                }

                if (file.target === "db/schema/uploads.ts") {
                    if (!uploadConfig.useDatabaseMetadata) {
                        continue;
                    }

                    fetchPath = uploadDatabaseDialect === "database-mysql"
                        ? "express/db/schema/uploads.mysql.ts"
                        : "express/db/schema/uploads.ts";
                    expectedSha256 = undefined;
                    expectedSize = undefined;
                }
            }

            let content = await fetchFile(fetchPath, {
                baseUrl: registryContext.fileBaseUrl,
                expectedSha256,
                expectedSize,
            });

            if (isDrizzleDatabaseModule(resolvedModuleName) && file.target === "../drizzle.config.ts") {
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
            const injected = await injectAuthRoutes(projectRoot, srcDir, authProvider);
            if (injected) {
                spinner.succeed("Routes configured");
            } else {
                spinner.warn("Could not configure routes automatically");
            }

            const docsInstalled = await isDocsModuleInstalled(projectRoot, srcDir);
            if (docsInstalled) {
                spinner.start("Adding auth endpoints to API docs...");
                const authDocsInjected = await injectAuthDocs(projectRoot, srcDir, authProvider);
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
                const installedAuthProvider = await detectInstalledAuthProvider(projectRoot, srcDir) || "better-auth";
                spinner.start("Adding auth endpoints to API docs...");
                const authDocsInjected = await injectAuthDocs(projectRoot, srcDir, installedAuthProvider);
                if (authDocsInjected) {
                    spinner.succeed("Auth endpoints added to API docs");
                } else {
                    spinner.warn("Could not update API docs automatically");
                }
            }

            const uploadsInstalled = await isUploadsModuleInstalled(projectRoot, srcDir);
            if (uploadsInstalled) {
                const uploadMode = await detectInstalledUploadsMode(projectRoot);
                if (uploadMode) {
                    spinner.start("Adding uploads endpoints to API docs...");
                    const uploadsDocsInjected = await injectUploadsDocs(projectRoot, srcDir, uploadMode);
                    if (uploadsDocsInjected) {
                        spinner.succeed("Uploads endpoints added to API docs");
                    } else {
                        spinner.warn("Could not update API docs automatically");
                    }
                }
            }
        }

        if (resolvedModuleName === "uploads" && uploadConfig) {
            spinner.start("Configuring upload routes...");
            const injected = await injectUploadsRoutes(projectRoot, srcDir);
            if (injected) {
                spinner.succeed("Upload routes configured");
            } else {
                spinner.warn("Could not configure upload routes automatically");
            }

            const docsInstalled = await isDocsModuleInstalled(projectRoot, srcDir);
            if (docsInstalled) {
                spinner.start("Adding uploads endpoints to API docs...");
                const docsInjected = await injectUploadsDocs(projectRoot, srcDir, uploadConfig.mode);
                if (docsInjected) {
                    spinner.succeed("Uploads endpoints added to API docs");
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
        if (resolvedModuleName === "auth" && authProvider === "jwt") {
            envConfigKey = "auth-jwt";
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
                if (authProvider === "better-auth") {
                    const hasExistingSecret = await hasEnvVariable(projectRoot, "BETTER_AUTH_SECRET");
                    if (!hasExistingSecret) {
                        envVars.BETTER_AUTH_SECRET = randomBytes(32).toString("hex");
                        generatedAuthSecret = true;
                    }
                } else {
                    const hasAccessSecret = await hasEnvVariable(projectRoot, "JWT_ACCESS_SECRET");
                    if (!hasAccessSecret) {
                        envVars.JWT_ACCESS_SECRET = randomBytes(32).toString("hex");
                        generatedAuthSecret = true;
                    }

                    const hasRefreshSecret = await hasEnvVariable(projectRoot, "JWT_REFRESH_SECRET");
                    if (!hasRefreshSecret) {
                        envVars.JWT_REFRESH_SECRET = randomBytes(32).toString("hex");
                        generatedAuthSecret = true;
                    }
                }
            }

            await updateEnvFile(projectRoot, envVars, true, {
                overwriteExisting: isDatabaseModule(resolvedModuleName),
            });
            await updateEnvSchema(projectRoot, srcDir, envConfig.schemaFields);

            spinner.succeed("Environment configured");
        }

        if (resolvedModuleName === "uploads" && uploadConfig) {
            currentStep = "environment configuration";
            spinner.start("Updating environment configuration...");
            await updateEnvFile(projectRoot, uploadConfig.envVars, true);
            await updateEnvSchema(projectRoot, srcDir, getUploadEnvSchemaFields(uploadConfig.provider));
            spinner.succeed("Environment configured");
        }

        if (isDatabaseModule(resolvedModuleName)) {
            const selected = getDatabaseSelection(resolvedModuleName);
            const orm = selectedDatabaseOrm ?? selected.orm;
            const dialect = selectedDatabaseDialect ?? selected.dialect;

            const latestConfig = await readZuroConfig(projectRoot);
            if (latestConfig) {
                await writeZuroConfig(projectRoot, {
                    ...latestConfig,
                    database: {
                        orm,
                        dialect,
                    },
                });
            }
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
            printAuthHints(generatedAuthSecret, authProvider);
        }

        if (resolvedModuleName === "mailer") {
            printMailerHints(usedDefaultSmtp);
        }

        if (resolvedModuleName === "docs") {
            printDocsHints();
        }

        if (resolvedModuleName === "uploads" && uploadConfig) {
            printUploadHints(uploadConfig);
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
