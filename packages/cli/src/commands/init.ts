import ora from "ora";
import chalk from "chalk";
import fs from "fs-extra";
import path from "path";
import prompts from "prompts";
import { fetchRegistry, fetchFile } from "../utils/registry";
import { initPackageJson, installDependencies } from "../utils/pm";

export async function init() {
    const cwd = process.cwd();
    const isExistingProject = await fs.pathExists(path.join(cwd, "package.json"));

    let targetDir = cwd;
    let pm = "npm";
    let srcDir = "src";
    let projectName = "my-api";

    if (isExistingProject) {
        console.log(chalk.blue("ℹ Existing project detected."));

        projectName = path.basename(cwd);

        // Auto-detect PM
        if (await fs.pathExists(path.join(cwd, "pnpm-lock.yaml"))) pm = "pnpm";
        else if (await fs.pathExists(path.join(cwd, "bun.lockb"))) pm = "bun";
        else if (await fs.pathExists(path.join(cwd, "yarn.lock"))) pm = "yarn";
        else pm = "npm";

        const response = await prompts({
            type: 'text',
            name: 'srcDir',
            message: 'Where is your source code located?',
            initial: 'src'
        });
        srcDir = response.srcDir || "src";

    } else {
        const response = await prompts([
            {
                type: 'text',
                name: 'path',
                message: 'Project Name?',
                initial: 'my-api',
            },
            {
                type: 'select',
                name: 'pm',
                message: 'Package Manager?',
                choices: [
                    { title: 'npm', value: 'npm' },
                    { title: 'pnpm', value: 'pnpm' },
                    { title: 'bun', value: 'bun' }
                ],
                initial: 0
            }
        ]);

        if (!response.path || !response.pm) {
            console.log(chalk.red("Operation cancelled."));
            return;
        }

        projectName = response.path;
        pm = response.pm;
        srcDir = "src"; // Default for new projects
        targetDir = path.resolve(cwd, projectName);

        await fs.ensureDir(targetDir);
    }

    // Generate zuro.json
    const zuroConfig = {
        name: projectName,
        pm,
        src: srcDir
    };
    await fs.writeJson(path.join(targetDir, "zuro.json"), zuroConfig, { spaces: 2 });

    const spinner = ora("Connecting to Zuro Registry...").start();

    try {
        const registry = await fetchRegistry();
        const coreModule = registry.modules.core;

        if (!coreModule) {
            spinner.fail("Core module not found in registry.");
            return;
        }

        spinner.text = "Initializing project...";

        if (!isExistingProject) {
            await initPackageJson(targetDir, true);
        }

        spinner.text = `Installing dependencies using ${pm}...`;

        let depsToInstall: string[] = [];
        if (isExistingProject) {
            // Only install devDependencies for existing projects
            // AND crucial dependencies for utility files (zod, dotenv)
            const safeDeps = ['zod', 'dotenv'];
            const coreDeps = coreModule.dependencies || [];
            const deps = coreDeps.filter((d: string) => safeDeps.includes(d));

            depsToInstall = [...deps, ...(coreModule.devDependencies || [])];
        } else {
            depsToInstall = [...(coreModule.dependencies || []), ...(coreModule.devDependencies || [])];
        }

        await installDependencies(pm, depsToInstall, targetDir);

        spinner.text = "Fetching core module files...";

        for (const file of coreModule.files) {
            // Adjust target path based on srcDir
            // Registry now has path-agnostic targets (e.g. "app.ts", "../drizzle.config.ts")
            const relativeTargetPath = path.join(srcDir, file.target);
            const targetPath = path.join(targetDir, relativeTargetPath);
            const fileName = path.basename(targetPath);

            if (isExistingProject) {
                // Safety check: DO NOT overwrite app.ts or server.ts
                if (fileName === 'app.ts' || fileName === 'server.ts') {
                    continue;
                }

                // Only write utility files
                const isSafe = fileName === 'env.ts' || relativeTargetPath.includes('lib/');
                if (!isSafe) continue;
            }

            const content = await fetchFile(file.path);
            await fs.ensureDir(path.dirname(targetPath));
            await fs.writeFile(targetPath, content);
        }

        spinner.succeed(chalk.green(`✔ Project initialized in ${targetDir} using ${pm}!`));
    } catch (error) {
        spinner.fail(chalk.red("Failed to initialize project."));
        console.error(error);
    }
}
