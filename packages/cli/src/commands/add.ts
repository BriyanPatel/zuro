import prompts from "prompts";
import ora from "ora";
import path from "path";
import fs from "fs-extra";
import { randomBytes } from "node:crypto";
import { fetchRegistry, fetchFile, RegistryFile } from "../utils/registry";
import { installDependencies, ensurePackageManagerAvailable } from "../utils/pm";
import { resolveDependencies } from "../utils/dependency";
import { updateEnvFile, updateEnvSchema, ENV_CONFIGS } from "../utils/env-manager";
import chalk from "chalk";
import { readZuroConfig } from "../utils/config";
import { showNonZuroProjectMessage, showInitFirstMessage } from "../utils/project-guard";

type DatabaseModuleName = "database-pg" | "database-mysql";

export interface AddCommandOptions {
    dialect?: string;
    dbUrl?: string;
    yes?: boolean;
}

const DEFAULT_DATABASE_URLS: Record<DatabaseModuleName, string> = {
    "database-pg": "postgresql://postgres@localhost:5432/mydb",
    "database-mysql": "mysql://root@localhost:3306/mydb",
};

function resolveSafeTargetPath(projectRoot: string, srcDir: string, file: RegistryFile) {
    const targetPath = path.resolve(projectRoot, srcDir, file.target);
    const normalizedRoot = path.resolve(projectRoot);

    if (targetPath !== normalizedRoot && !targetPath.startsWith(`${normalizedRoot}${path.sep}`)) {
        throw new Error(`Refusing to write outside project directory: ${file.target}`);
    }

    return targetPath;
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

function parseDatabaseDialect(value?: string): DatabaseModuleName | null {
    const normalized = value?.trim().toLowerCase();
    if (!normalized) {
        return null;
    }

    if (normalized === "pg" || normalized === "postgres" || normalized === "postgresql" || normalized === "database-pg") {
        return "database-pg";
    }

    if (normalized === "mysql" || normalized === "database-mysql") {
        return "database-mysql";
    }

    return null;
}

function isDatabaseModule(moduleName: string): moduleName is DatabaseModuleName {
    return moduleName === "database-pg" || moduleName === "database-mysql";
}

function validateDatabaseUrl(rawUrl: string, moduleName: DatabaseModuleName) {
    const dbUrl = rawUrl.trim();
    if (!dbUrl) {
        throw new Error("Database URL cannot be empty.");
    }

    let parsed: URL;
    try {
        parsed = new URL(dbUrl);
    } catch {
        throw new Error(`Invalid database URL: '${dbUrl}'.`);
    }

    const protocol = parsed.protocol.toLowerCase();
    if (moduleName === "database-pg" && protocol !== "postgresql:" && protocol !== "postgres:") {
        throw new Error("PostgreSQL URL must start with postgres:// or postgresql://");
    }

    if (moduleName === "database-mysql" && protocol !== "mysql:") {
        throw new Error("MySQL URL must start with mysql://");
    }

    return dbUrl;
}

async function detectInstalledDatabaseDialect(projectRoot: string, srcDir: string): Promise<DatabaseModuleName | null> {
    const dbIndexPath = path.join(projectRoot, srcDir, "db", "index.ts");
    if (!fs.existsSync(dbIndexPath)) {
        return null;
    }

    const content = await fs.readFile(dbIndexPath, "utf-8");
    if (content.includes("drizzle-orm/node-postgres") || content.includes(`from "pg"`)) {
        return "database-pg";
    }

    if (content.includes("drizzle-orm/mysql2") || content.includes(`from "mysql2`)) {
        return "database-mysql";
    }

    return null;
}

async function backupDatabaseFiles(projectRoot: string, srcDir: string): Promise<string | null> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupRoot = path.join(projectRoot, ".zuro", "backups", `database-${timestamp}`);
    const candidates = [
        path.join(projectRoot, srcDir, "db", "index.ts"),
        path.join(projectRoot, "drizzle.config.ts"),
    ];

    let copied = false;
    for (const filePath of candidates) {
        if (!fs.existsSync(filePath)) {
            continue;
        }

        const relativePath = path.relative(projectRoot, filePath);
        const backupPath = path.join(backupRoot, relativePath);
        await fs.ensureDir(path.dirname(backupPath));
        await fs.copyFile(filePath, backupPath);
        copied = true;
    }

    return copied ? backupRoot : null;
}

function databaseLabel(moduleName: DatabaseModuleName) {
    return moduleName === "database-pg" ? "PostgreSQL" : "MySQL";
}

function getDatabaseSetupHint(moduleName: DatabaseModuleName, dbUrl: string) {
    try {
        const parsed = new URL(dbUrl);
        const dbName = parsed.pathname.replace(/^\/+/, "") || "mydb";

        if (moduleName === "database-pg") {
            return `createdb ${dbName}`;
        }

        return `mysql -e "CREATE DATABASE IF NOT EXISTS ${dbName};"`;
    } catch {
        return moduleName === "database-pg"
            ? "createdb <database_name>"
            : `mysql -e "CREATE DATABASE IF NOT EXISTS <database_name>;"`;
    }
}

function getModuleDocsPath(moduleName: string) {
    if (isDatabaseModule(moduleName)) {
        return "database";
    }

    return moduleName;
}

function escapeRegex(value: string) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function appendImport(source: string, line: string) {
    if (source.includes(line)) {
        return { source, inserted: true };
    }

    const importRegex = /^import .+ from .+;?\s*$/gm;
    let lastImportIndex = 0;
    let match;

    while ((match = importRegex.exec(source)) !== null) {
        lastImportIndex = match.index + match[0].length;
    }

    if (lastImportIndex <= 0) {
        return { source, inserted: false };
    }

    return {
        source: source.slice(0, lastImportIndex) + `\n${line}` + source.slice(lastImportIndex),
        inserted: true,
    };
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

async function ensureSchemaExport(projectRoot: string, srcDir: string, schemaFileName: string) {
    const schemaIndexPath = path.join(projectRoot, srcDir, "db", "schema", "index.ts");
    if (!await fs.pathExists(schemaIndexPath)) {
        return;
    }

    const exportLine = `export * from "./${schemaFileName}";`;
    const content = await fs.readFile(schemaIndexPath, "utf-8");
    const normalized = content.replace(/\r\n/g, "\n");
    const exportPattern = new RegExp(
        `^\\s*export\\s*\\*\\s*from\\s*["']\\./${escapeRegex(schemaFileName)}["'];?\\s*$`,
        "m"
    );

    if (exportPattern.test(normalized)) {
        return;
    }

    let next = normalized
        .replace(/^\s*export\s*\{\s*\};?\s*$/m, "")
        .trimEnd();

    if (next.length > 0) {
        next += "\n\n";
    }

    next += `${exportLine}\n`;
    await fs.writeFile(schemaIndexPath, next);
}

async function isDocsModuleInstalled(projectRoot: string, srcDir: string): Promise<boolean> {
    return await fs.pathExists(path.join(projectRoot, srcDir, "lib", "openapi.ts"));
}

async function isAuthModuleInstalled(projectRoot: string, srcDir: string): Promise<boolean> {
    return await fs.pathExists(path.join(projectRoot, srcDir, "lib", "auth.ts"));
}

/**
 * Modifies app.ts to include error handler middleware
 */
async function injectErrorHandler(projectRoot: string, srcDir: string): Promise<boolean> {
    const appPath = path.join(projectRoot, srcDir, "app.ts");

    if (!fs.existsSync(appPath)) {
        return false;
    }

    let content = await fs.readFile(appPath, "utf-8");

    const errorImport = `import { errorHandler, notFoundHandler } from "./middleware/error-handler";`;
    const hasErrorImport = content.includes(errorImport);
    const hasNotFoundUse = /app\.use\(\s*notFoundHandler\s*\)/.test(content);
    const hasErrorUse = /app\.use\(\s*errorHandler\s*\)/.test(content);
    let modified = false;
    let importInserted = hasErrorImport;

    if (!hasErrorImport) {
        const importRegex = /^import .+ from .+;?\s*$/gm;
        let lastImportIndex = 0;
        let match;

        while ((match = importRegex.exec(content)) !== null) {
            lastImportIndex = match.index + match[0].length;
        }

        if (lastImportIndex > 0) {
            content = content.slice(0, lastImportIndex) + `\n${errorImport}` + content.slice(lastImportIndex);
            modified = true;
            importInserted = true;
        }
    }

    let setupInserted = hasNotFoundUse && hasErrorUse;
    if (!setupInserted) {
        const setupLines: string[] = [];
        if (!hasNotFoundUse) {
            setupLines.push("app.use(notFoundHandler);");
        }

        if (!hasErrorUse) {
            setupLines.push("app.use(errorHandler);");
        }

        const errorSetup = `\n// Error handling (must be last)\n${setupLines.join("\n")}\n`;
        const exportMatch = content.match(/export default app;?\s*$/m);
        if (exportMatch && exportMatch.index !== undefined) {
            content = content.slice(0, exportMatch.index) + errorSetup + "\n" + content.slice(exportMatch.index);
            modified = true;
            setupInserted = true;
        }
    }

    if (modified) {
        await fs.writeFile(appPath, content);
    }

    return importInserted && setupInserted;
}

/**
 * Modifies app.ts to include auth routes
 */
async function injectAuthRoutes(projectRoot: string, srcDir: string): Promise<boolean> {
    const appPath = path.join(projectRoot, srcDir, "app.ts");
    if (!await fs.pathExists(appPath)) {
        return false;
    }

    let appContent = await fs.readFile(appPath, "utf-8");
    const authHandlerImport = `import { toNodeHandler } from "better-auth/node";`;
    const authImport = `import { auth } from "./lib/auth";`;
    const routeIndexUserImport = `import userRoutes from "./user.routes";`;
    const appUserImport = `import userRoutes from "./routes/user.routes";`;

    let appModified = false;

    for (const importLine of [authHandlerImport, authImport]) {
        const next = appendImport(appContent, importLine);
        if (!next.inserted) {
            return false;
        }

        if (next.source !== appContent) {
            appContent = next.source;
            appModified = true;
        }
    }

    const hasAuthMount = /toNodeHandler\(\s*auth\s*\)/.test(appContent)
        && /\/api\/auth/.test(appContent);
    if (!hasAuthMount) {
        const authMountLine = "app.all(/^\\/api\\/auth(?:\\/.*)?$/, toNodeHandler(auth));\n";
        const jsonIndex = appContent.search(/^\s*app\.use\(\s*express\.json\(\)\s*\);\s*$/m);

        let insertionIndex = jsonIndex;
        if (insertionIndex < 0) {
            const healthIndex = appContent.search(/^\s*app\.get\(\s*["']\/health["']\s*,/m);
            insertionIndex = healthIndex;
        }

        if (insertionIndex < 0) {
            const exportMatch = appContent.match(/export default app;?\s*$/m);
            insertionIndex = exportMatch?.index ?? -1;
        }

        if (insertionIndex < 0) {
            return false;
        }

        appContent = appContent.slice(0, insertionIndex) + authMountLine + appContent.slice(insertionIndex);
        appModified = true;
    }

    const routeIndexPath = path.join(projectRoot, srcDir, "routes", "index.ts");
    if (await fs.pathExists(routeIndexPath)) {
        let routeContent = await fs.readFile(routeIndexPath, "utf-8");
        let routeModified = false;

        const userImportResult = appendImport(routeContent, routeIndexUserImport);
        if (!userImportResult.inserted) {
            return false;
        }

        if (userImportResult.source !== routeContent) {
            routeContent = userImportResult.source;
            routeModified = true;
        }

        const hasUserRoute = /rootRouter\.use\(\s*["']\/users["']\s*,\s*userRoutes\s*\)/.test(routeContent);
        if (!hasUserRoute) {
            const routeSetup = `\n// User routes\nrootRouter.use("/users", userRoutes);\n`;
            const exportMatch = routeContent.match(/export default rootRouter;?\s*$/m);

            if (!exportMatch || exportMatch.index === undefined) {
                return false;
            }

            routeContent = routeContent.slice(0, exportMatch.index) + routeSetup + "\n" + routeContent.slice(exportMatch.index);
            routeModified = true;
        }

        if (routeModified) {
            await fs.writeFile(routeIndexPath, routeContent);
        }
    } else {
        const hasUserRoute = /app\.use\(\s*["']\/api\/users["']\s*,\s*userRoutes\s*\)/.test(appContent);
        if (!hasUserRoute) {
            const exportMatch = appContent.match(/export default app;?\s*$/m);
            if (!exportMatch || exportMatch.index === undefined) {
                return false;
            }

            const routeSetup = `\n// User routes\napp.use("/api/users", userRoutes);\n`;
            appContent = appContent.slice(0, exportMatch.index) + routeSetup + "\n" + appContent.slice(exportMatch.index);
            appModified = true;
        }

        const userImportResult = appendImport(appContent, appUserImport);
        if (!userImportResult.inserted) {
            return false;
        }

        if (userImportResult.source !== appContent) {
            appContent = userImportResult.source;
            appModified = true;
        }
    }

    if (appModified) {
        await fs.writeFile(appPath, appContent);
    }

    return true;
}

async function injectDocsRoutes(projectRoot: string, srcDir: string): Promise<boolean> {
    const routeIndexPath = path.join(projectRoot, srcDir, "routes", "index.ts");
    const routeImport = `import docsRoutes from "./docs.routes";`;
    const routeMountPattern = /rootRouter\.use\(\s*["']\/docs["']\s*,\s*docsRoutes\s*\)/;

    if (await fs.pathExists(routeIndexPath)) {
        let routeContent = await fs.readFile(routeIndexPath, "utf-8");
        let routeModified = false;

        const importResult = appendImport(routeContent, routeImport);
        if (!importResult.inserted) {
            return false;
        }

        if (importResult.source !== routeContent) {
            routeContent = importResult.source;
            routeModified = true;
        }

        if (!routeMountPattern.test(routeContent)) {
            const routeSetup = `\n// API docs\nrootRouter.use("/docs", docsRoutes);\n`;
            const exportMatch = routeContent.match(/export default rootRouter;?\s*$/m);
            if (!exportMatch || exportMatch.index === undefined) {
                return false;
            }

            routeContent = routeContent.slice(0, exportMatch.index) + routeSetup + "\n" + routeContent.slice(exportMatch.index);
            routeModified = true;
        }

        if (routeModified) {
            await fs.writeFile(routeIndexPath, routeContent);
        }

        return true;
    }

    const appPath = path.join(projectRoot, srcDir, "app.ts");
    if (!await fs.pathExists(appPath)) {
        return false;
    }

    let appContent = await fs.readFile(appPath, "utf-8");
    let appModified = false;

    const appImportResult = appendImport(appContent, `import docsRoutes from "./routes/docs.routes";`);
    if (!appImportResult.inserted) {
        return false;
    }

    if (appImportResult.source !== appContent) {
        appContent = appImportResult.source;
        appModified = true;
    }

    const hasMount = /app\.use\(\s*["']\/api\/docs["']\s*,\s*docsRoutes\s*\)/.test(appContent);
    if (!hasMount) {
        const setup = `\n// API docs\napp.use("/api/docs", docsRoutes);\n`;
        const exportMatch = appContent.match(/export default app;?\s*$/m);
        if (!exportMatch || exportMatch.index === undefined) {
            return false;
        }

        appContent = appContent.slice(0, exportMatch.index) + setup + "\n" + appContent.slice(exportMatch.index);
        appModified = true;
    }

    if (appModified) {
        await fs.writeFile(appPath, appContent);
    }

    return true;
}

async function injectAuthDocs(projectRoot: string, srcDir: string): Promise<boolean> {
    const openApiPath = path.join(projectRoot, srcDir, "lib", "openapi.ts");
    if (!await fs.pathExists(openApiPath)) {
        return false;
    }

    const authMarker = "// ZURO_AUTH_DOCS";
    let content = await fs.readFile(openApiPath, "utf-8");
    if (content.includes(authMarker)) {
        return true;
    }

    const moduleDocsEndMarker = "// ZURO_DOCS_MODULES_END";
    if (!content.includes(moduleDocsEndMarker)) {
        return false;
    }

    const authBlock = `\nconst authSignUpSchema = z.object({
    email: z.string().email().openapi({ example: "dev@company.com" }),
    password: z.string().min(8).openapi({ example: "strong-password" }),
    name: z.string().min(1).optional().openapi({ example: "Dev User" }),
});

const authSignInSchema = z.object({
    email: z.string().email().openapi({ example: "dev@company.com" }),
    password: z.string().min(8).openapi({ example: "strong-password" }),
});

const authUserSchema = z.object({
    id: z.string().openapi({ example: "user_123" }),
    email: z.string().email().openapi({ example: "dev@company.com" }),
    name: z.string().nullable().openapi({ example: "Dev User" }),
});

${authMarker}
registry.registerPath({
    method: "post",
    path: "/api/auth/sign-up/email",
    tags: ["Auth"],
    summary: "Register using email and password",
    request: {
        body: {
            content: {
                "application/json": {
                    schema: authSignUpSchema,
                },
            },
        },
    },
    responses: {
        200: { description: "Registration successful" },
    },
});

registry.registerPath({
    method: "post",
    path: "/api/auth/sign-in/email",
    tags: ["Auth"],
    summary: "Sign in using email and password",
    request: {
        body: {
            content: {
                "application/json": {
                    schema: authSignInSchema,
                },
            },
        },
    },
    responses: {
        200: { description: "Sign in successful" },
        401: { description: "Invalid credentials" },
    },
});

registry.registerPath({
    method: "post",
    path: "/api/auth/sign-out",
    tags: ["Auth"],
    summary: "Sign out current user",
    responses: {
        200: { description: "Sign out successful" },
    },
});

registry.registerPath({
    method: "get",
    path: "/api/users/me",
    tags: ["Auth"],
    summary: "Get current authenticated user",
    security: [{ bearerAuth: [] }],
    responses: {
        200: {
            description: "Current user",
            content: {
                "application/json": {
                    schema: z.object({ user: authUserSchema }),
                },
            },
        },
        401: { description: "Not authenticated" },
    },
});
`;

    content = content.replace(moduleDocsEndMarker, `${authBlock}\n${moduleDocsEndMarker}`);
    await fs.writeFile(openApiPath, content);

    return true;
}

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

    let customDbUrl: string | undefined;
    let usedDefaultDbUrl = false;
    let databaseBackupPath: string | null = null;
    let generatedAuthSecret = false;
    let authDatabaseDialect: DatabaseModuleName | null = null;
    let customSmtpVars: Record<string, string> | undefined;
    let usedDefaultSmtp = false;
    let mailerProvider: "smtp" | "resend" = "smtp";
    let shouldInstallDocsForAuth = false;

    if (resolvedModuleName === "database") {
        const variantResponse = await prompts({
            type: "select",
            name: "variant",
            message: "Which database dialect?",
            choices: [
                { title: "PostgreSQL", value: "database-pg" },
                { title: "MySQL", value: "database-mysql" },
            ],
        });

        if (!variantResponse.variant) {
            console.log(chalk.yellow("Operation cancelled."));
            return;
        }

        resolvedModuleName = variantResponse.variant;
    }

    if (isDatabaseModule(resolvedModuleName)) {
        const installedDialect = await detectInstalledDatabaseDialect(projectRoot, srcDir);

        if (installedDialect && installedDialect !== resolvedModuleName) {
            console.log(
                chalk.yellow(
                    `\n⚠ Existing database setup detected: ${databaseLabel(installedDialect)}.`
                )
            );
            console.log(
                chalk.yellow(
                    `  Switching to ${databaseLabel(resolvedModuleName)} will overwrite db files and drizzle config.\n`
                )
            );

            const switchResponse = await prompts({
                type: "confirm",
                name: "proceed",
                message: "Continue and switch database dialect?",
                initial: false,
            });

            if (!switchResponse.proceed) {
                console.log(chalk.yellow("Operation cancelled."));
                return;
            }

            databaseBackupPath = await backupDatabaseFiles(projectRoot, srcDir);
        }

        const defaultUrl = DEFAULT_DATABASE_URLS[resolvedModuleName];
        console.log(chalk.dim(`  Tip: Leave blank to use ${defaultUrl}\n`));

        const response = await prompts({
            type: "text",
            name: "dbUrl",
            message: "Database URL",
            initial: "",
        });

        if (response.dbUrl === undefined) {
            console.log(chalk.yellow("Operation cancelled."));
            return;
        }

        const enteredUrl = response.dbUrl?.trim() || "";
        usedDefaultDbUrl = enteredUrl.length === 0;
        customDbUrl = validateDatabaseUrl(enteredUrl || defaultUrl, resolvedModuleName);
    }

    if (resolvedModuleName === "mailer") {
        const providerResponse = await prompts({
            type: "select",
            name: "provider",
            message: "Which email provider?",
            choices: [
                { title: "SMTP (Nodemailer)", description: "Gmail, Mailtrap, any SMTP server", value: "smtp" },
                { title: "Resend", description: "API-based, easiest setup", value: "resend" },
            ],
        });

        if (providerResponse.provider === undefined) {
            console.log(chalk.yellow("Operation cancelled."));
            return;
        }

        mailerProvider = providerResponse.provider;

        console.log(chalk.dim("  Tip: Leave fields blank to use placeholder values and configure later\n"));

        if (mailerProvider === "smtp") {
            const smtpResponse = await prompts([
                {
                    type: "text",
                    name: "host",
                    message: "SMTP Host",
                    initial: "",
                },
                {
                    type: "text",
                    name: "port",
                    message: "SMTP Port",
                    initial: "587",
                },
                {
                    type: "text",
                    name: "user",
                    message: "SMTP User",
                    initial: "",
                },
                {
                    type: "password",
                    name: "pass",
                    message: "SMTP Password",
                },
                {
                    type: "text",
                    name: "from",
                    message: "Mail From address",
                    initial: "",
                },
            ]);

            if (smtpResponse.host === undefined) {
                console.log(chalk.yellow("Operation cancelled."));
                return;
            }

            const host = smtpResponse.host?.trim() || "";
            const user = smtpResponse.user?.trim() || "";
            const pass = smtpResponse.pass?.trim() || "";
            const from = smtpResponse.from?.trim() || "";
            const port = smtpResponse.port?.trim() || "587";

            usedDefaultSmtp = !host && !user;

            if (!usedDefaultSmtp) {
                customSmtpVars = {
                    SMTP_HOST: host || "smtp.example.com",
                    SMTP_PORT: port,
                    SMTP_USER: user || "your-email@example.com",
                    SMTP_PASS: pass || "your-password",
                    MAIL_FROM: from || "noreply@example.com",
                };
            }
        } else {
            const resendResponse = await prompts([
                {
                    type: "text",
                    name: "apiKey",
                    message: "Resend API Key",
                    initial: "",
                },
                {
                    type: "text",
                    name: "from",
                    message: "Mail From address",
                    initial: "",
                },
            ]);

            if (resendResponse.apiKey === undefined) {
                console.log(chalk.yellow("Operation cancelled."));
                return;
            }

            const apiKey = resendResponse.apiKey?.trim() || "";
            const from = resendResponse.from?.trim() || "";

            usedDefaultSmtp = !apiKey;

            if (!usedDefaultSmtp) {
                customSmtpVars = {
                    RESEND_API_KEY: apiKey || "re_your_api_key",
                    MAIL_FROM: from || "onboarding@resend.dev",
                };
            }
        }
    }

    if (resolvedModuleName === "auth") {
        const docsInstalled = await isDocsModuleInstalled(projectRoot, srcDir);
        if (!docsInstalled) {
            if (options.yes) {
                shouldInstallDocsForAuth = true;
            } else {
                const docsResponse = await prompts({
                    type: "confirm",
                    name: "installDocs",
                    message: "Install API docs module (Scalar + OpenAPI) too?",
                    initial: true,
                });

                if (docsResponse.installDocs === undefined) {
                    console.log(chalk.yellow("Operation cancelled."));
                    return;
                }

                shouldInstallDocsForAuth = docsResponse.installDocs;
            }
        }
    }

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

        currentStep = "module scaffolding";
        spinner.start("Scaffolding files...");

        if (resolvedModuleName === "auth") {
            authDatabaseDialect = await detectInstalledDatabaseDialect(projectRoot, srcDir);
        }

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

        console.log(chalk.green(`\n✔ ${resolvedModuleName} added successfully!\n`));

        if (databaseBackupPath) {
            console.log(chalk.blue(`ℹ Backup created at: ${databaseBackupPath}\n`));
        }

        const docsPath = getModuleDocsPath(resolvedModuleName);
        const docsUrl = `https://zuro-cli.devbybriyan.com/docs/${docsPath}`;
        console.log(chalk.blue(`ℹ Docs: ${docsUrl}`));

        if (isDatabaseModule(resolvedModuleName)) {
            if (usedDefaultDbUrl) {
                console.log(chalk.yellow("ℹ Review DATABASE_URL in .env if your local DB config differs."));
            }

            const setupHint = getDatabaseSetupHint(
                resolvedModuleName,
                customDbUrl || DEFAULT_DATABASE_URLS[resolvedModuleName]
            );
            console.log(chalk.yellow(`ℹ Ensure DB exists: ${setupHint}`));
            console.log(chalk.yellow("ℹ Run migrations: npx drizzle-kit generate && npx drizzle-kit migrate"));
        }

        if (resolvedModuleName === "auth") {
            if (generatedAuthSecret) {
                console.log(chalk.yellow("ℹ BETTER_AUTH_SECRET was generated automatically."));
            } else {
                console.log(chalk.yellow("ℹ Review BETTER_AUTH_SECRET and BETTER_AUTH_URL in .env."));
            }

            console.log(chalk.yellow("ℹ Run migrations: npx drizzle-kit generate && npx drizzle-kit migrate"));
        }

        if (resolvedModuleName === "mailer") {
            if (usedDefaultSmtp) {
                console.log(chalk.yellow("ℹ Placeholder SMTP values added to .env — update them before sending emails."));
            } else {
                console.log(chalk.yellow("ℹ Review SMTP configuration in .env to ensure values are correct."));
            }
        }

        if (resolvedModuleName === "docs") {
            console.log(chalk.yellow("ℹ API docs available at: /api/docs"));
            console.log(chalk.yellow("ℹ OpenAPI spec available at: /api/docs/openapi.json"));
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
