import path from "path";
import fs from "fs-extra";

/**
 * Modifies app.ts to include error handler middleware
 * (notFoundHandler + errorHandler, must be registered last).
 */
export async function injectErrorHandler(projectRoot: string, srcDir: string): Promise<boolean> {
    const appPath = path.join(projectRoot, srcDir, "app.ts");

    if (!fs.existsSync(appPath)) {
        return false;
    }

    let content = await fs.readFile(appPath, "utf-8");

    const errorImport = `import { errorHandler, notFoundHandler } from "./middleware/error-handler";`;
    const hasErrorImport = content.includes(errorImport);
    const hasNotFoundUse = /app\.use\(\s*notFoundHandler\s*\)/.test(content);
    const hasErrorUse = /app\.use\(\s*errorHandler\s*\)/.test(content);
    let modified = false;
    let importInserted = hasErrorImport;

    if (!hasErrorImport) {
        const importRegex = /^import .+ from .+;?\s*$/gm;
        let lastImportIndex = 0;
        let match;

        while ((match = importRegex.exec(content)) !== null) {
            lastImportIndex = match.index + match[0].length;
        }

        if (lastImportIndex > 0) {
            content = content.slice(0, lastImportIndex) + `\n${errorImport}` + content.slice(lastImportIndex);
            modified = true;
            importInserted = true;
        }
    }

    let setupInserted = hasNotFoundUse && hasErrorUse;
    if (!setupInserted) {
        const setupLines: string[] = [];
        if (!hasNotFoundUse) {
            setupLines.push("app.use(notFoundHandler);");
        }

        if (!hasErrorUse) {
            setupLines.push("app.use(errorHandler);");
        }

        const errorSetup = `\n// Error handling (must be last)\n${setupLines.join("\n")}\n`;
        const exportMatch = content.match(/export default app;?\s*$/m);

        if (exportMatch && exportMatch.index !== undefined) {
            content = content.slice(0, exportMatch.index) + errorSetup + "\n" + content.slice(exportMatch.index);
            modified = true;
            setupInserted = true;
        }
    }

    if (modified) {
        await fs.writeFile(appPath, content);
    }

    return importInserted && setupInserted;
}
