import { add } from "../commands/add";
import { readZuroConfig } from "./config";
import fs from "fs-extra";
import path from "path";
import chalk from "chalk";

// Signature files to check if a Zuro module is installed
const BLOCK_SIGNATURES: Record<string, string> = {
    core: "env.ts",
    "database-pg": "db/index.ts",
    "database-mysql": "db/index.ts",
    validator: "middleware/validate.ts",
    "error-handler": "lib/errors.ts",
    logger: "lib/logger.ts",
    auth: "lib/auth.ts",
};

/**
 * Resolves Zuro module dependencies (NOT npm packages).
 * Only handles module dependencies like "core", "database", "validator", "auth".
 */
export const resolveDependencies = async (
    moduleDependencies: string[] | undefined,
    cwd: string
) => {
    if (!moduleDependencies || moduleDependencies.length === 0) {
        return;
    }

    const config = await readZuroConfig(cwd);
    const srcDir = config?.srcDir || "src";

    for (const dep of moduleDependencies) {
        if (dep === "database") {
            const pgExists = fs.existsSync(path.join(cwd, srcDir, BLOCK_SIGNATURES["database-pg"]));
            const mysqlExists = fs.existsSync(path.join(cwd, srcDir, BLOCK_SIGNATURES["database-mysql"]));

            if (pgExists || mysqlExists) {
                continue;
            }

            console.log(chalk.blue(`ℹ Dependency '${dep}' is missing. Triggering install...`));
            await add("database");
            continue;
        }

        const signature = BLOCK_SIGNATURES[dep];
        if (!signature) {
            continue;
        }

        if (fs.existsSync(path.join(cwd, srcDir, signature))) {
            continue;
        }

        console.log(chalk.blue(`ℹ Installing missing dependency: ${dep}...`));
        await add(dep);
    }
};
