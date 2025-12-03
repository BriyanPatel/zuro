import prompts from "prompts";
import ora from "ora";
import path from "path";
import fs from "fs-extra";
import { fetchRegistry, fetchFile } from "../utils/registry";
import { installDependencies } from "../utils/pm";
import chalk from "chalk";

export const add = async (moduleName: string) => {
    // 1. Intercept "database" to ask for variant
    // (We do this BEFORE starting any spinner so it doesn't look glitchy)
    if (moduleName === "database") {
        const response = await prompts({
            type: "select",
            name: "variant",
            message: "Which database dialect?",
            choices: [
                { title: "PostgreSQL", value: "database-pg" },
                { title: "MySQL", value: "database-mysql" },
            ],
        });
        if (!response.variant) process.exit(0);
        moduleName = response.variant;
    }

    // --- STEP 1: CHECK REGISTRY ---
    const spinner = ora(`Checking registry for ${moduleName}...`).start();

    try {
        const registry = await fetchRegistry();
        const module = registry.modules[moduleName];

        if (!module) {
            spinner.fail(`Module '${moduleName}' not found.`);
            return;
        }

        // ✅ Complete Step 1
        spinner.succeed(`Found module: ${chalk.cyan(moduleName)}`);

        // --- STEP 2: INSTALL DEPENDENCIES ---
        // 🔄 Start Step 2
        spinner.start("Installing dependencies...");

        let pm = "npm";
        if (fs.existsSync("pnpm-lock.yaml")) pm = "pnpm";
        if (fs.existsSync("bun.lockb")) pm = "bun";

        await installDependencies(pm, module.devDependencies, process.cwd());

        // ✅ Complete Step 2
        spinner.succeed("Dependencies installed");

        // --- STEP 3: SCAFFOLD FILES ---
        // 🔄 Start Step 3
        spinner.start("Scaffolding files...");

        for (const file of module.files) {
            const content = await fetchFile(file.path);
            const targetPath = path.join(process.cwd(), file.target);
            await fs.ensureDir(path.dirname(targetPath));
            await fs.writeFile(targetPath, content);
        }

        // ✅ Complete Step 3
        spinner.succeed("Files generated");

        // --- FINAL SUCCESS MESSAGE ---
        console.log(chalk.green(`\n✔ ${moduleName} added successfully!`));

        if (moduleName.includes("database")) {
            console.log(chalk.yellow("Action Required: Update DATABASE_URL in your .env file!"));
        }

    } catch (error) {
        // If any step fails, the current spinner turns red
        spinner.fail(`Failed to add module: ${(error as Error).message}`);
    }
};