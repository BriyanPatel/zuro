import path from "path";
import fs from "fs-extra";
import { appendImport } from "../utils/code-inject";

/**
 * Checks if the docs module is installed by looking for lib/openapi.ts.
 */
export async function isDocsModuleInstalled(projectRoot: string, srcDir: string): Promise<boolean> {
    return await fs.pathExists(path.join(projectRoot, srcDir, "lib", "openapi.ts"));
}

/**
 * Injects docs routes into routes/index.ts or app.ts.
 */
export async function injectDocsRoutes(projectRoot: string, srcDir: string): Promise<boolean> {
    const routeIndexPath = path.join(projectRoot, srcDir, "routes", "index.ts");
    const routeImport = `import docsRoutes from "./docs.routes";`;
    const routeMountPattern = /rootRouter\.use\(\s*["']\/docs["']\s*,\s*docsRoutes\s*\)/;

    if (await fs.pathExists(routeIndexPath)) {
        let routeContent = await fs.readFile(routeIndexPath, "utf-8");
        let routeModified = false;

        const importResult = appendImport(routeContent, routeImport);
        if (!importResult.inserted) {
            return false;
        }

        if (importResult.source !== routeContent) {
            routeContent = importResult.source;
            routeModified = true;
        }

        if (!routeMountPattern.test(routeContent)) {
            const routeSetup = `\n// API docs\nrootRouter.use("/docs", docsRoutes);\n`;
            const exportMatch = routeContent.match(/export default rootRouter;?\s*$/m);
            if (!exportMatch || exportMatch.index === undefined) {
                return false;
            }

            routeContent = routeContent.slice(0, exportMatch.index) + routeSetup + "\n" + routeContent.slice(exportMatch.index);
            routeModified = true;
        }

        if (routeModified) {
            await fs.writeFile(routeIndexPath, routeContent);
        }

        return true;
    }

    const appPath = path.join(projectRoot, srcDir, "app.ts");
    if (!await fs.pathExists(appPath)) {
        return false;
    }

    let appContent = await fs.readFile(appPath, "utf-8");
    let appModified = false;

    const appImportResult = appendImport(appContent, `import docsRoutes from "./routes/docs.routes";`);
    if (!appImportResult.inserted) {
        return false;
    }

    if (appImportResult.source !== appContent) {
        appContent = appImportResult.source;
        appModified = true;
    }

    const hasMount = /app\.use\(\s*["']\/api\/docs["']\s*,\s*docsRoutes\s*\)/.test(appContent);
    if (!hasMount) {
        const setup = `\n// API docs\napp.use("/api/docs", docsRoutes);\n`;
        const exportMatch = appContent.match(/export default app;?\s*$/m);
        if (!exportMatch || exportMatch.index === undefined) {
            return false;
        }

        appContent = appContent.slice(0, exportMatch.index) + setup + "\n" + appContent.slice(exportMatch.index);
        appModified = true;
    }

    if (appModified) {
        await fs.writeFile(appPath, appContent);
    }

    return true;
}

/**
 * Prints post-install hints for the docs module.
 */
export function printDocsHints() {
    const chalk = require("chalk");
    console.log(chalk.yellow("ℹ API docs available at: /api/docs"));
    console.log(chalk.yellow("ℹ OpenAPI spec available at: /api/docs/openapi.json"));
}
