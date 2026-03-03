import path from "path";
import fs from "fs-extra";
import prompts from "prompts";
import chalk from "chalk";
import { escapeRegex } from "../utils/code-inject";

export type DatabaseOrm = "drizzle" | "prisma";
export type DatabaseDialect = "postgresql" | "mysql";
export type DatabaseModuleName =
    | "database-pg"
    | "database-mysql"
    | "database-prisma-pg"
    | "database-prisma-mysql";

const DATABASE_MODULE_MAP: Record<DatabaseOrm, Record<DatabaseDialect, DatabaseModuleName>> = {
    drizzle: {
        postgresql: "database-pg",
        mysql: "database-mysql",
    },
    prisma: {
        postgresql: "database-prisma-pg",
        mysql: "database-prisma-mysql",
    },
};

export const DEFAULT_DATABASE_URLS: Record<DatabaseModuleName, string> = {
    "database-pg": "postgresql://postgres@localhost:5432/mydb",
    "database-mysql": "mysql://root@localhost:3306/mydb",
    "database-prisma-pg": "postgresql://postgres@localhost:5432/mydb",
    "database-prisma-mysql": "mysql://root@localhost:3306/mydb",
};

export function parseDatabaseDialect(value?: string): DatabaseModuleName | null {
    const normalized = value?.trim().toLowerCase();
    if (!normalized) {
        return null;
    }

    if (
        normalized === "pg"
        || normalized === "postgres"
        || normalized === "postgresql"
        || normalized === "database-pg"
        || normalized === "drizzle-pg"
        || normalized === "drizzle-postgres"
        || normalized === "database-drizzle-pg"
    ) {
        return "database-pg";
    }

    if (
        normalized === "mysql"
        || normalized === "database-mysql"
        || normalized === "drizzle-mysql"
        || normalized === "database-drizzle-mysql"
    ) {
        return "database-mysql";
    }

    if (
        normalized === "database-prisma-pg"
        || normalized === "prisma-pg"
        || normalized === "prisma-postgres"
        || normalized === "prisma-postgresql"
        || normalized === "database-prisma"
    ) {
        return "database-prisma-pg";
    }

    if (normalized === "database-prisma-mysql" || normalized === "prisma-mysql") {
        return "database-prisma-mysql";
    }

    return null;
}

export function isDatabaseModule(moduleName: string): moduleName is DatabaseModuleName {
    return (
        moduleName === "database-pg"
        || moduleName === "database-mysql"
        || moduleName === "database-prisma-pg"
        || moduleName === "database-prisma-mysql"
    );
}

export function isDrizzleDatabaseModule(moduleName: string): moduleName is "database-pg" | "database-mysql" {
    return moduleName === "database-pg" || moduleName === "database-mysql";
}

export function getDatabaseSelection(moduleName: DatabaseModuleName): { orm: DatabaseOrm; dialect: DatabaseDialect } {
    if (moduleName === "database-pg") {
        return { orm: "drizzle", dialect: "postgresql" };
    }

    if (moduleName === "database-mysql") {
        return { orm: "drizzle", dialect: "mysql" };
    }

    if (moduleName === "database-prisma-pg") {
        return { orm: "prisma", dialect: "postgresql" };
    }

    return { orm: "prisma", dialect: "mysql" };
}

function getDatabaseModule(orm: DatabaseOrm, dialect: DatabaseDialect): DatabaseModuleName {
    return DATABASE_MODULE_MAP[orm][dialect];
}

function parsePrismaProvider(schemaContent: string): DatabaseDialect | null {
    const match = schemaContent.match(/provider\s*=\s*"([^"]+)"/);
    if (!match) {
        return null;
    }

    const provider = match[1]?.trim().toLowerCase();
    if (provider === "mysql") {
        return "mysql";
    }

    if (provider === "postgresql" || provider === "postgres") {
        return "postgresql";
    }

    return null;
}

export function validateDatabaseUrl(rawUrl: string, moduleName: DatabaseModuleName) {
    const { dialect } = getDatabaseSelection(moduleName);
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
    if (dialect === "postgresql" && protocol !== "postgresql:" && protocol !== "postgres:") {
        throw new Error("PostgreSQL URL must start with postgres:// or postgresql://");
    }

    if (dialect === "mysql" && protocol !== "mysql:") {
        throw new Error("MySQL URL must start with mysql://");
    }

    return dbUrl;
}

export async function detectInstalledDatabaseDialect(projectRoot: string, srcDir: string): Promise<DatabaseModuleName | null> {
    const dbIndexPath = path.join(projectRoot, srcDir, "db", "index.ts");
    const prismaSchemaPath = path.join(projectRoot, "prisma", "schema.prisma");

    if (fs.existsSync(dbIndexPath)) {
        const content = await fs.readFile(dbIndexPath, "utf-8");
        if (content.includes("drizzle-orm/node-postgres") || content.includes(`from "pg"`)) {
            return "database-pg";
        }

        if (content.includes("drizzle-orm/mysql2") || content.includes(`from "mysql2`)) {
            return "database-mysql";
        }

        if (content.includes(`from "@prisma/client"`)) {
            if (fs.existsSync(prismaSchemaPath)) {
                const schemaContent = await fs.readFile(prismaSchemaPath, "utf-8");
                const dialect = parsePrismaProvider(schemaContent);
                if (dialect === "mysql") {
                    return "database-prisma-mysql";
                }
            }

            return "database-prisma-pg";
        }
    }

    if (fs.existsSync(prismaSchemaPath)) {
        const schemaContent = await fs.readFile(prismaSchemaPath, "utf-8");
        const dialect = parsePrismaProvider(schemaContent);
        if (dialect === "mysql") {
            return "database-prisma-mysql";
        }

        return "database-prisma-pg";
    }

    return null;
}

export async function backupDatabaseFiles(projectRoot: string, srcDir: string): Promise<string | null> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupRoot = path.join(projectRoot, ".zuro", "backups", `database-${timestamp}`);
    const candidates = [
        path.join(projectRoot, srcDir, "db", "index.ts"),
        path.join(projectRoot, "drizzle.config.ts"),
        path.join(projectRoot, "prisma", "schema.prisma"),
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

export function databaseLabel(moduleName: DatabaseModuleName) {
    const selection = getDatabaseSelection(moduleName);
    const ormLabel = selection.orm === "drizzle" ? "Drizzle" : "Prisma";
    const dialectLabel = selection.dialect === "postgresql" ? "PostgreSQL" : "MySQL";
    return `${ormLabel} (${dialectLabel})`;
}

export function getDatabaseSetupHint(moduleName: DatabaseModuleName, dbUrl: string) {
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

export async function ensureSchemaExport(projectRoot: string, srcDir: string, schemaFileName: string) {
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

export interface DatabasePromptResult {
    resolvedModuleName: DatabaseModuleName;
    selectedOrm: DatabaseOrm;
    selectedDialect: DatabaseDialect;
    customDbUrl: string | undefined;
    usedDefaultDbUrl: boolean;
    databaseBackupPath: string | null;
}

/**
 * Runs all database-specific interactive prompts and validation.
 * Returns null if the user cancels.
 */
export async function promptDatabaseConfig(
    initialModuleName: string,
    projectRoot: string,
    srcDir: string,
): Promise<DatabasePromptResult | null> {
    let resolvedModuleName: DatabaseModuleName;

    if (initialModuleName === "database") {
        const ormResponse = await prompts({
            type: "select",
            name: "orm",
            message: "Which ORM?",
            choices: [
                { title: "Drizzle", value: "drizzle" },
                { title: "Prisma", value: "prisma" },
            ],
            initial: 0,
        });

        if (!ormResponse.orm) {
            console.log(chalk.yellow("Operation cancelled."));
            return null;
        }

        const variantResponse = await prompts({
            type: "select",
            name: "dialect",
            message: "Which database dialect?",
            choices: [
                { title: "PostgreSQL", value: "postgresql" },
                { title: "MySQL", value: "mysql" },
            ],
        });

        if (!variantResponse.dialect) {
            console.log(chalk.yellow("Operation cancelled."));
            return null;
        }

        resolvedModuleName = getDatabaseModule(ormResponse.orm as DatabaseOrm, variantResponse.dialect as DatabaseDialect);
    } else {
        const parsed = parseDatabaseDialect(initialModuleName);
        if (!parsed) {
            throw new Error(`Unsupported database module '${initialModuleName}'.`);
        }

        resolvedModuleName = parsed;
    }

    const { orm: selectedOrm, dialect: selectedDialect } = getDatabaseSelection(resolvedModuleName);

    // Check for dialect switch
    let databaseBackupPath: string | null = null;
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
            return null;
        }

        databaseBackupPath = await backupDatabaseFiles(projectRoot, srcDir);
    }

    // Prompt for database URL
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
        return null;
    }

    const enteredUrl = response.dbUrl?.trim() || "";
    const usedDefaultDbUrl = enteredUrl.length === 0;
    const customDbUrl = validateDatabaseUrl(enteredUrl || defaultUrl, resolvedModuleName);

    return {
        resolvedModuleName,
        selectedOrm,
        selectedDialect,
        customDbUrl,
        usedDefaultDbUrl,
        databaseBackupPath,
    };
}

/**
 * Prints post-install hints for database modules.
 */
export function printDatabaseHints(
    moduleName: DatabaseModuleName,
    customDbUrl: string | undefined,
    usedDefaultDbUrl: boolean,
    databaseBackupPath: string | null,
) {
    if (databaseBackupPath) {
        console.log(chalk.blue(`ℹ Backup created at: ${databaseBackupPath}\n`));
    }

    if (usedDefaultDbUrl) {
        console.log(chalk.yellow("ℹ Review DATABASE_URL in .env if your local DB config differs."));
    }

    const setupHint = getDatabaseSetupHint(
        moduleName,
        customDbUrl || DEFAULT_DATABASE_URLS[moduleName]
    );
    console.log(chalk.yellow(`ℹ Ensure DB exists: ${setupHint}`));
    if (isDrizzleDatabaseModule(moduleName)) {
        console.log(chalk.yellow("ℹ Run migrations: npx drizzle-kit generate && npx drizzle-kit migrate"));
        return;
    }

    console.log(chalk.yellow("ℹ Run migrations: npx prisma migrate dev --name init"));
    console.log(chalk.yellow("ℹ Generate client: npx prisma generate"));
}
