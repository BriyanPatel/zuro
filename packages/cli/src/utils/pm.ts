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
                "dev": "ts-node src/server.ts"
            }
        }, { spaces: 2 });
    }
}

export async function installDependencies(pm: string, deps: string[], cwd: string) {
    if (deps.length === 0) return;

    const installCmd = pm === "npm" ? "install" : "add";
    // For devDependencies in this context, we might want to just install them as regular deps for simplicity 
    // or differentiate. The prompt asked to install dependencies.
    // Assuming these are runtime deps or dev deps based on the registry definition.
    // The registry definition has "devDependencies".

    // Let's just install them.
    await execa(pm, [installCmd, ...deps], { cwd });
}
