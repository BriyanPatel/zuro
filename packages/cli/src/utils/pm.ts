import fs from "fs-extra";
import path from "path";
import { execa } from "execa";

function normalizePackageName(name: string) {
    const normalized = name
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9._-]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^[._-]+|[._-]+$/g, "");

    return normalized || "zuro-app";
}

export async function ensurePackageManagerAvailable(pm: string) {
    try {
        await execa(pm, ["--version"], { stdio: "ignore" });
    } catch {
        throw new Error(
            `Package manager '${pm}' is not installed or not available in PATH. Install it or choose npm.`
        );
    }
}

export async function initPackageJson(
    cwd: string,
    force: boolean = false,
    packageName = "zuro-app",
    srcDir = "src"
) {
    const pkgPath = path.join(cwd, "package.json");
    if (force || !await fs.pathExists(pkgPath)) {
        await fs.writeJson(pkgPath, {
            name: normalizePackageName(packageName),
            version: "0.0.1",
            private: true,
            scripts: {
                "dev": `tsx watch ${srcDir}/server.ts`,
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
