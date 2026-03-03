import path from "path";
import fs from "fs-extra";

/**
 * Modifies app.ts to include rate limiter middleware.
 * Inserts `app.use(rateLimiter)` after `express.json()` and before route mounting.
 */
export async function injectRateLimiter(projectRoot: string, srcDir: string): Promise<boolean> {
    const appPath = path.join(projectRoot, srcDir, "app.ts");

    if (!fs.existsSync(appPath)) {
        return false;
    }

    let content = await fs.readFile(appPath, "utf-8");

    const rateLimiterImport = `import { rateLimiter } from "./middleware/rate-limiter";`;
    const hasImport = content.includes(rateLimiterImport);
    const hasUse = /app\.use\(\s*rateLimiter\s*\)/.test(content);

    if (hasImport && hasUse) {
        return true; // already configured
    }

    let modified = false;

    // Insert import
    if (!hasImport) {
        const importRegex = /^import .+ from .+;?\s*$/gm;
        let lastImportIndex = 0;
        let match;

        while ((match = importRegex.exec(content)) !== null) {
            lastImportIndex = match.index + match[0].length;
        }

        if (lastImportIndex > 0) {
            content = content.slice(0, lastImportIndex) + `\n${rateLimiterImport}` + content.slice(lastImportIndex);
            modified = true;
        }
    }

    // Insert app.use(rateLimiter) after express.json()
    if (!hasUse) {
        const jsonMiddleware = /^(\s*app\.use\(\s*express\.json\(\)\s*\);?\s*)$/m;
        const jsonMatch = content.match(jsonMiddleware);

        if (jsonMatch && jsonMatch.index !== undefined) {
            const insertAt = jsonMatch.index + jsonMatch[0].length;
            content = content.slice(0, insertAt) + `\napp.use(rateLimiter);` + content.slice(insertAt);
            modified = true;
        } else {
            // Fallback: insert before route mounting
            const routeMount = /^\s*app\.use\(\s*["']\/api["']/m;
            const routeMatch = content.match(routeMount);

            if (routeMatch && routeMatch.index !== undefined) {
                content = content.slice(0, routeMatch.index) + `app.use(rateLimiter);\n` + content.slice(routeMatch.index);
                modified = true;
            }
        }
    }

    if (modified) {
        await fs.writeFile(appPath, content);
    }

    return true;
}
