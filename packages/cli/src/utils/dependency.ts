import { add } from "../commands/add";
import fs from "fs-extra";
import path from "path";
import chalk from "chalk";

// Signature files to check if a Zuro module is installed
const BLOCK_SIGNATURES: Record<string, string> = {
    "core": "env.ts",
    "database-pg": "db/index.ts",
    "database-mysql": "db/index.ts",
    "validator": "middleware/validate.ts",
    "error-handler": "lib/errors.ts",
    "logger": "lib/logger.ts",
    "auth": "lib/auth.ts"
};

/**
 * Resolves Zuro module dependencies (NOT npm packages).
 * Only handles module dependencies like "core", "database", "validator", "auth".
 */
export const resolveDependencies = async (moduleDependencies: string[] | undefined, cwd: string) => {
    if (!moduleDependencies || moduleDependencies.length === 0) return;

    const configPath = path.join(cwd, "zuro.json");
    let srcDir = "src";
    if (fs.existsSync(configPath)) {
        const config = await fs.readJson(configPath);
        srcDir = config.srcDir || "src";
    }

    for (const dep of moduleDependencies) {
        // Special handling for "database" - could be pg or mysql
        if (dep === "database") {
            const pgExists = fs.existsSync(path.join(cwd, srcDir, BLOCK_SIGNATURES["database-pg"]));
            const mysqlExists = fs.existsSync(path.join(cwd, srcDir, BLOCK_SIGNATURES["database-mysql"]));

            if (pgExists || mysqlExists) continue; // Database already exists

            console.log(chalk.blue(`ℹ Dependency '${dep}' is missing. Triggering install...`));
            await add("database"); // This triggers the Postgres/MySQL prompt
            continue;
        }

        // Check if this is a known Zuro module
        const signature = BLOCK_SIGNATURES[dep];
        if (!signature) {
            // Not a known Zuro module - skip (it's probably an npm package)
            continue;
        }

        // Check if already installed
        if (fs.existsSync(path.join(cwd, srcDir, signature))) {
            continue; // Already installed
        }

        console.log(chalk.blue(`ℹ Installing missing dependency: ${dep}...`));
        await add(dep);
    }
};
