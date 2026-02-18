import fs from "fs-extra";
import path from "path";
import os from "os";

/**
 * Creates or updates .env file with new variables
 */
export const updateEnvFile = async (
    cwd: string,
    variables: Record<string, string>,
    createIfMissing = true
) => {
    const envPath = path.join(cwd, ".env");

    let content = "";
    if (fs.existsSync(envPath)) {
        content = await fs.readFile(envPath, "utf-8");
    } else if (!createIfMissing) {
        return;
    }

    let modified = false;

    for (const [key, value] of Object.entries(variables)) {
        // Check if key already exists
        const regex = new RegExp(`^${key}=`, "m");
        if (!regex.test(content)) {
            // Add newline if content doesn't end with one
            if (content && !content.endsWith("\n")) {
                content += os.EOL;
            }
            content += `${key}=${value}${os.EOL}`;
            modified = true;
        }
    }

    if (modified || !fs.existsSync(envPath)) {
        await fs.writeFile(envPath, content);
    }
};

/**
 * Updates env.ts to add new schema fields
 */
export const updateEnvSchema = async (
    cwd: string,
    srcDir: string,
    fields: Array<{ name: string; schema: string }>
) => {
    const envPath = path.join(cwd, srcDir, "env.ts");

    if (!fs.existsSync(envPath)) {
        return false;
    }

    let content = await fs.readFile(envPath, "utf-8");
    let modified = false;

    for (const field of fields) {
        // Check if field already exists in schema
        if (content.includes(`${field.name}:`)) {
            continue;
        }

        // Find the closing of envSchema z.object({ ... })
        // Insert before the closing });
        const schemaEndRegex = /(\n\s*)(}\);?\s*\n\s*export const env)/;
        const match = content.match(schemaEndRegex);

        if (match) {
            const indent = "    "; // 4 spaces
            const newField = `${indent}${field.name}: ${field.schema},\n`;
            content = content.replace(
                schemaEndRegex,
                `\n${newField}$1$2`
            );
            modified = true;
        }
    }

    if (modified) {
        await fs.writeFile(envPath, content);
    }

    return modified;
};

/**
 * Creates initial .env file for new projects
 */
export const createInitialEnv = async (cwd: string) => {
    const envPath = path.join(cwd, ".env");

    if (fs.existsSync(envPath)) {
        return; // Don't overwrite existing
    }

    const content = `# Environment Variables
PORT=3000
NODE_ENV=development
`;

    await fs.writeFile(envPath, content);
};

/**
 * Module-specific env configurations
 */
export const ENV_CONFIGS = {
    "database-pg": {
        envVars: {
            DATABASE_URL: "postgresql://postgres@localhost:5432/mydb",
        },
        schemaFields: [
            { name: "DATABASE_URL", schema: "z.string().url()" },
        ],
    },
    "database-mysql": {
        envVars: {
            DATABASE_URL: "mysql://root@localhost:3306/mydb",
        },
        schemaFields: [
            { name: "DATABASE_URL", schema: "z.string().url()" },
        ],
    },
    auth: {
        envVars: {
            BETTER_AUTH_SECRET: "your-secret-key-at-least-32-characters-long",
            BETTER_AUTH_URL: "http://localhost:3000",
        },
        schemaFields: [
            { name: "BETTER_AUTH_SECRET", schema: "z.string().min(32)" },
            { name: "BETTER_AUTH_URL", schema: "z.string().url()" },
        ],
    },
};
