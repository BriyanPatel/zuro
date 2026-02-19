import ora from "ora";
import chalk from "chalk";
import fs from "fs-extra";
import path from "path";
import prompts from "prompts";
import { fetchRegistry, fetchFile, RegistryFile } from "../utils/registry";
import { initPackageJson, installDependencies } from "../utils/pm";
import { createInitialEnv } from "../utils/env-manager";
import { readZuroConfig, writeZuroConfig } from "../utils/config";
import { showNonZuroProjectMessage } from "../utils/project-guard";
import type { ZuroConfig } from "../utils/config";

function resolveSafeTargetPath(projectRoot: string, srcDir: string, file: RegistryFile) {
    const relativeTargetPath = path.join(srcDir, file.target);
    const targetPath = path.resolve(projectRoot, relativeTargetPath);
    const normalizedRoot = path.resolve(projectRoot);

    if (targetPath !== normalizedRoot && !targetPath.startsWith(`${normalizedRoot}${path.sep}`)) {
        throw new Error(`Refusing to write outside project directory: ${file.target}`);
    }

    return {
        relativeTargetPath,
        targetPath,
    };
}

export async function init() {
    const cwd = process.cwd();
    const isExistingProject = await fs.pathExists(path.join(cwd, "package.json"));
    const existingZuroConfig = await readZuroConfig(cwd);

    if (isExistingProject && !existingZuroConfig) {
        showNonZuroProjectMessage();
        return;
    }

    let targetDir = cwd;
    let pm = "npm";
    let srcDir = "src";
    let projectName = path.basename(cwd);

    if (isExistingProject) {
        console.log(chalk.blue("ℹ Existing project detected."));

        projectName = path.basename(cwd);

        if (await fs.pathExists(path.join(cwd, "pnpm-lock.yaml"))) {
            pm = "pnpm";
        } else if (await fs.pathExists(path.join(cwd, "bun.lockb"))) {
            pm = "bun";
        } else if (await fs.pathExists(path.join(cwd, "yarn.lock"))) {
            pm = "yarn";
        }

        const response = await prompts({
            type: "text",
            name: "srcDir",
            message: "Where is your source code located?",
            initial: "src",
        });

        srcDir = response.srcDir || "src";
    } else {
        console.log(chalk.dim(`  Tip: Leave blank to use current folder (${path.basename(cwd)})\n`));

        const response = await prompts([
            {
                type: "text",
                name: "path",
                message: "Project name (blank for current folder)",
                initial: "",
            },
            {
                type: "select",
                name: "pm",
                message: "Package Manager?",
                choices: [
                    { title: "npm", value: "npm" },
                    { title: "pnpm", value: "pnpm" },
                    { title: "bun", value: "bun" },
                ],
                initial: 0,
            },
        ]);

        if (response.pm === undefined) {
            console.log(chalk.red("Operation cancelled."));
            return;
        }

        pm = response.pm;
        srcDir = "src";

        if (!response.path || response.path.trim() === "") {
            projectName = path.basename(cwd);
            targetDir = cwd;
            console.log(chalk.blue(`ℹ Using current folder: ${projectName}`));
        } else {
            projectName = response.path.trim();
            targetDir = path.resolve(cwd, projectName);
            await fs.ensureDir(targetDir);
        }
    }

    const existingConfig = targetDir === cwd ? existingZuroConfig : await readZuroConfig(targetDir);

    const zuroConfig: ZuroConfig = {
        name: projectName,
        pm,
        srcDir: srcDir || existingConfig?.srcDir || "src",
    };

    await writeZuroConfig(targetDir, zuroConfig);

    const spinner = ora("Connecting to Zuro Registry...").start();

    try {
        const registryContext = await fetchRegistry();

        const coreModule = registryContext.manifest.modules.core;

        if (!coreModule) {
            spinner.fail("Core module not found in registry.");
            return;
        }

        spinner.text = "Initializing project...";

        const hasPackageJson = await fs.pathExists(path.join(targetDir, "package.json"));
        if (!hasPackageJson) {
            await initPackageJson(targetDir, true);
        }

        spinner.text = `Installing dependencies using ${pm}...`;

        let runtimeDeps: string[] = [];
        let devDeps: string[] = [];

        if (isExistingProject) {
            const safeDeps = ["zod", "dotenv"];
            const coreDeps = coreModule.dependencies || [];
            runtimeDeps = coreDeps.filter((dependency) => safeDeps.includes(dependency));
            devDeps = coreModule.devDependencies || [];
        } else {
            runtimeDeps = coreModule.dependencies || [];
            devDeps = coreModule.devDependencies || [];
        }

        await installDependencies(pm, runtimeDeps, targetDir);
        await installDependencies(pm, devDeps, targetDir, { dev: true });

        spinner.text = "Fetching core module files...";

        for (const file of coreModule.files) {
            const { relativeTargetPath, targetPath } = resolveSafeTargetPath(targetDir, srcDir, file);
            const fileName = path.basename(targetPath);

            if (isExistingProject) {
                if (fileName === "app.ts" || fileName === "server.ts") {
                    continue;
                }

                const relativeParts = relativeTargetPath.split(path.sep);
                const isSafe = fileName === "env.ts" || relativeParts.includes("lib");
                if (!isSafe) {
                    continue;
                }
            }

            const content = await fetchFile(file.path, {
                baseUrl: registryContext.fileBaseUrl,
                expectedSha256: file.sha256,
                expectedSize: file.size,
            });

            await fs.ensureDir(path.dirname(targetPath));
            await fs.writeFile(targetPath, content);
        }

        await createInitialEnv(targetDir);

        spinner.succeed(chalk.green("Project initialized successfully!"));

        console.log(`\n${chalk.bold("Next steps:")}`);
        if (targetDir !== cwd) {
            console.log(chalk.cyan(`  cd ${projectName}`));
        }
        console.log(chalk.cyan(`  ${pm} run dev`));
        console.log(`\n${chalk.dim("Add modules: zuro-cli add database, zuro-cli add auth")}`);
    } catch (error) {
        spinner.fail(chalk.red("Failed to initialize project."));
        console.error(error);
    }
}
