import fs from "fs-extra";
import path from "path";
import { execa } from "execa";

export async function initPackageJson(cwd: string, force: boolean = false) {
    const pkgPath = path.join(cwd, "package.json");
    if (force || !await fs.pathExists(pkgPath)) {
        await fs.writeJson(pkgPath, {
            name: "zuro-app",
            version: "0.0.1",
            private: true,
            scripts: {
                "dev": "tsx watch src/server.ts",
                "build": "tsc",
                "start": "node dist/server.js"
            }
        }, { spaces: 2 });
    }
}

interface InstallOptions {
    dev?: boolean;
}

export async function installDependencies(
    pm: string,
    deps: string[],
    cwd: string,
    options: InstallOptions = {}
) {
    const uniqueDeps = [...new Set(deps)].filter(Boolean);

    if (uniqueDeps.length === 0) {
        return;
    }

    const isDev = options.dev ?? false;

    if (pm === "npm") {
        const args = ["install", ...(isDev ? ["--save-dev"] : []), ...uniqueDeps];
        await execa("npm", args, { cwd });
        return;
    }

    if (pm === "pnpm") {
        const args = ["add", ...(isDev ? ["-D"] : []), ...uniqueDeps];
        await execa("pnpm", args, { cwd });
        return;
    }

    if (pm === "yarn") {
        const args = ["add", ...(isDev ? ["-D"] : []), ...uniqueDeps];
        await execa("yarn", args, { cwd });
        return;
    }

    if (pm === "bun") {
        const args = ["add", ...(isDev ? ["-d"] : []), ...uniqueDeps];
        await execa("bun", args, { cwd });
        return;
    }

    throw new Error(`Unsupported package manager: ${pm}`);
}
