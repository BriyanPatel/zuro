import prompts from "prompts";
import ora from "ora";
import path from "path";
import fs from "fs-extra";
import { fetchRegistry, fetchFile } from "../utils/registry";
import { installDependencies } from "../utils/pm";
import { resolveDependencies } from "../utils/dependency";
import { updateEnvFile, updateEnvSchema, ENV_CONFIGS } from "../utils/env-manager";
import chalk from "chalk";

/**
 * Modifies app.ts to include error handler middleware
 */
async function injectErrorHandler(projectRoot: string, srcDir: string): Promise<boolean> {
    const appPath = path.join(projectRoot, srcDir, "app.ts");

    if (!fs.existsSync(appPath)) {
        return false;
    }

    let content = await fs.readFile(appPath, "utf-8");

    // Check if already injected
    if (content.includes('errorHandler')) {
        return true;
    }

    const errorImport = `import { errorHandler, notFoundHandler } from "./middleware/error-handler";`;

    // Find the last import statement and add after it
    const importRegex = /^import .+ from .+;?\s*$/gm;
    let lastImportIndex = 0;
    let match;

    while ((match = importRegex.exec(content)) !== null) {
        lastImportIndex = match.index + match[0].length;
    }

    if (lastImportIndex > 0) {
        content = content.slice(0, lastImportIndex) + `\n${errorImport}` + content.slice(lastImportIndex);
    }

    // Add error handlers before "export default app"
    const errorSetup = `\n// Error handling (must be last)\napp.use(notFoundHandler);\napp.use(errorHandler);\n`;
    const exportMatch = content.match(/export default app;?\s*$/m);
    if (exportMatch && exportMatch.index !== undefined) {
        content = content.slice(0, exportMatch.index) + errorSetup + "\n" + content.slice(exportMatch.index);
    }

    await fs.writeFile(appPath, content);
    return true;
}

/**
 * Modifies app.ts to include auth routes
 */
async function injectAuthRoutes(projectRoot: string, srcDir: string): Promise<boolean> {
    const appPath = path.join(projectRoot, srcDir, "app.ts");

    if (!fs.existsSync(appPath)) {
        return false;
    }

    let content = await fs.readFile(appPath, "utf-8");

    // Check if already injected
    if (content.includes('routes/auth.routes')) {
        return true;
    }

    const authImport = `import authRoutes from "./routes/auth.routes";`;
    const userImport = `import userRoutes from "./routes/user.routes";`;
    const routeSetup = `\n// Auth routes\napp.use(authRoutes);\napp.use("/api/users", userRoutes);\n`;

    // Find the last import statement and add after it
    const importRegex = /^import .+ from .+;?\s*$/gm;
    let lastImportIndex = 0;
    let match;

    while ((match = importRegex.exec(content)) !== null) {
        lastImportIndex = match.index + match[0].length;
    }

    if (lastImportIndex > 0) {
        content = content.slice(0, lastImportIndex) + `\n${authImport}\n${userImport}` + content.slice(lastImportIndex);
    }

    // Add route setup before "export default app"
    const exportMatch = content.match(/export default app;?\s*$/m);
    if (exportMatch && exportMatch.index !== undefined) {
        content = content.slice(0, exportMatch.index) + routeSetup + "\n" + content.slice(exportMatch.index);
    }

    await fs.writeFile(appPath, content);
    return true;
}

export const add = async (moduleName: string) => {
    // 1. READ ZURO CONFIG
    const configPath = path.join(process.cwd(), "zuro.json");
    let srcDir = "src";

    if (fs.existsSync(configPath)) {
        const config = await fs.readJson(configPath);
        srcDir = config.srcDir || "src";
    }

    // 2. Intercept "database" to ask for variant and connection URL
    let customDbUrl: string | undefined;

    // Default localhost URLs (root user, no password)
    const DEFAULT_URLS = {
        "database-pg": "postgresql://root@localhost:5432/mydb",
        "database-mysql": "mysql://root@localhost:3306/mydb",
    };

    if (moduleName === "database") {
        const variantResponse = await prompts({
            type: "select",
            name: "variant",
            message: "Which database dialect?",
            choices: [
                { title: "PostgreSQL", value: "database-pg" },
                { title: "MySQL", value: "database-mysql" },
            ],
        });
        if (!variantResponse.variant) process.exit(0);
        moduleName = variantResponse.variant;

        const defaultUrl = DEFAULT_URLS[moduleName as keyof typeof DEFAULT_URLS];
        console.log(chalk.dim(`  Tip: Leave blank to use ${defaultUrl}\n`));

        const urlResponse = await prompts({
            type: "text",
            name: "dbUrl",
            message: "Database URL",
            initial: "",
        });
        customDbUrl = urlResponse.dbUrl?.trim() || defaultUrl;
    }

    // Also ask for DB URL if adding database-pg or database-mysql directly
    if ((moduleName === "database-pg" || moduleName === "database-mysql") && customDbUrl === undefined) {
        const defaultUrl = DEFAULT_URLS[moduleName as keyof typeof DEFAULT_URLS];
        console.log(chalk.dim(`  Tip: Leave blank to use ${defaultUrl}\n`));

        const response = await prompts({
            type: "text",
            name: "dbUrl",
            message: "Database URL",
            initial: "",
        });
        customDbUrl = response.dbUrl?.trim() || defaultUrl;
    }

    const spinner = ora(`Checking registry for ${moduleName}...`).start();

    try {
        const registry = await fetchRegistry();
        const module = registry.modules[moduleName];

        if (!module) {
            spinner.fail(`Module '${moduleName}' not found.`);
            return;
        }

        spinner.succeed(`Found module: ${chalk.cyan(moduleName)}`);

        // 3. RESOLVE ZURO MODULE DEPENDENCIES RECURSIVELY
        const moduleDeps = module.moduleDependencies || [];
        await resolveDependencies(moduleDeps, process.cwd());

        // 4. INSTALL NPM DEPENDENCIES
        spinner.start("Installing dependencies...");

        let pm = "npm";
        if (fs.existsSync("pnpm-lock.yaml")) pm = "pnpm";
        if (fs.existsSync("bun.lockb")) pm = "bun";

        const allDeps = [
            ...(module.dependencies || []),
            ...(module.devDependencies || [])
        ];

        if (allDeps.length > 0) {
            await installDependencies(pm, allDeps, process.cwd());
        }
        spinner.succeed("Dependencies installed");

        // 5. SCAFFOLD FILES
        spinner.start("Scaffolding files...");

        for (const file of module.files) {
            const content = await fetchFile(file.path);
            const targetPath = path.join(process.cwd(), srcDir, file.target);

            await fs.ensureDir(path.dirname(targetPath));
            await fs.writeFile(targetPath, content);
        }

        spinner.succeed("Files generated");

        // 5.5. INJECT INTO APP.TS (if adding auth or error-handler)
        if (moduleName === "auth") {
            spinner.start("Configuring routes in app.ts...");
            const injected = await injectAuthRoutes(process.cwd(), srcDir);
            if (injected) {
                spinner.succeed("Routes configured in app.ts");
            } else {
                spinner.warn("Could not find app.ts - routes need manual setup");
            }
        }

        if (moduleName === "error-handler") {
            spinner.start("Configuring error handler in app.ts...");
            const injected = await injectErrorHandler(process.cwd(), srcDir);
            if (injected) {
                spinner.succeed("Error handler configured in app.ts");
            } else {
                spinner.warn("Could not find app.ts - error handler needs manual setup");
            }
        }

        // 6. UPDATE ENV FILES
        const envConfig = ENV_CONFIGS[moduleName as keyof typeof ENV_CONFIGS];
        if (envConfig) {
            spinner.start("Updating environment configuration...");

            // Use custom DB URL if provided
            const envVars: Record<string, string> = { ...envConfig.envVars };
            if (customDbUrl && (moduleName === "database-pg" || moduleName === "database-mysql")) {
                envVars.DATABASE_URL = customDbUrl;
            }

            // Update .env file
            await updateEnvFile(process.cwd(), envVars);

            // Update env.ts schema
            await updateEnvSchema(process.cwd(), srcDir, envConfig.schemaFields);

            spinner.succeed("Environment configured");
        }

        // 7. SHOW SUCCESS AND NEXT STEPS
        console.log(chalk.green(`\n✔ ${moduleName} added successfully!\n`));

        if (moduleName === "auth") {
            console.log(chalk.bold("📋 Next Steps:\n"));

            // Environment note
            console.log(chalk.yellow("1. Update your .env file:"));
            console.log(chalk.dim("   We added placeholder values. Update BETTER_AUTH_SECRET with a secure key.\n"));

            // Database migrations
            console.log(chalk.yellow("2. Run database migrations:"));
            console.log(chalk.cyan(`   npx drizzle-kit generate`));
            console.log(chalk.cyan(`   npx drizzle-kit migrate\n`));

            // Available endpoints
            console.log(chalk.yellow("3. Available endpoints:"));
            console.log(chalk.dim("   POST /auth/sign-up/email  - Register"));
            console.log(chalk.dim("   POST /auth/sign-in/email  - Login"));
            console.log(chalk.dim("   POST /auth/sign-out       - Logout"));
            console.log(chalk.dim("   GET  /api/users/me        - Current user\n"));

        } else if (moduleName === "error-handler") {
            console.log(chalk.bold("📋 Usage:\n"));

            console.log(chalk.yellow("Throw errors in your controllers:"));
            console.log(chalk.dim("   ─────────────────────────────────────"));
            console.log(chalk.white(`   import { UnauthorizedError, NotFoundError } from "./lib/errors";`));
            console.log("");
            console.log(chalk.white(`   throw new UnauthorizedError("Invalid credentials");`));
            console.log(chalk.white(`   throw new NotFoundError("User not found");`));
            console.log(chalk.dim("   ─────────────────────────────────────\n"));

            console.log(chalk.yellow("Available error classes:"));
            console.log(chalk.dim("   BadRequestError     (400)"));
            console.log(chalk.dim("   UnauthorizedError   (401)"));
            console.log(chalk.dim("   ForbiddenError      (403)"));
            console.log(chalk.dim("   NotFoundError       (404)"));
            console.log(chalk.dim("   ConflictError       (409)"));
            console.log(chalk.dim("   ValidationError     (422)"));
            console.log(chalk.dim("   InternalServerError (500)\n"));

            console.log(chalk.yellow("Wrap async handlers:"));
            console.log(chalk.dim("   ─────────────────────────────────────"));
            console.log(chalk.white(`   import { asyncHandler } from "./middleware/error-handler";`));
            console.log("");
            console.log(chalk.white(`   router.get("/users", asyncHandler(async (req, res) => {`));
            console.log(chalk.white(`       // errors auto-caught`));
            console.log(chalk.white(`   }));`));
            console.log(chalk.dim("   ─────────────────────────────────────\n"));

        } else if (moduleName.includes("database")) {
            console.log(chalk.bold("📋 Next Steps:\n"));

            let stepNum = 1;

            if (!customDbUrl) {
                console.log(chalk.yellow(`${stepNum}. Update DATABASE_URL in .env:`));
                console.log(chalk.dim("   We added a placeholder. Update with your actual database credentials.\n"));
                stepNum++;
            }

            console.log(chalk.yellow(`${stepNum}. Create schemas in src/db/schema/:`));
            console.log(chalk.dim("   Add table files and export from index.ts\n"));
            stepNum++;

            console.log(chalk.yellow(`${stepNum}. Run migrations:`));
            console.log(chalk.cyan("   npx drizzle-kit generate"));
            console.log(chalk.cyan("   npx drizzle-kit migrate\n"));
        }

    } catch (error) {
        spinner.fail(`Failed to add module: ${(error as Error).message}`);
    }
};
