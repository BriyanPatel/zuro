import path from "path";
import fs from "fs-extra";
import prompts from "prompts";
import chalk from "chalk";
import { appendImport } from "../utils/code-inject";
import type { DatabaseModuleName } from "./database.handler";

/**
 * Checks if the auth module is installed by looking for lib/auth.ts.
 */
export async function isAuthModuleInstalled(projectRoot: string, srcDir: string): Promise<boolean> {
    return await fs.pathExists(path.join(projectRoot, srcDir, "lib", "auth.ts"));
}

/**
 * Modifies app.ts to include auth routes (better-auth handler + user routes).
 */
export async function injectAuthRoutes(projectRoot: string, srcDir: string): Promise<boolean> {
    const appPath = path.join(projectRoot, srcDir, "app.ts");
    if (!await fs.pathExists(appPath)) {
        return false;
    }

    let appContent = await fs.readFile(appPath, "utf-8");
    const authHandlerImport = `import { toNodeHandler } from "better-auth/node";`;
    const authImport = `import { auth } from "./lib/auth";`;
    const routeIndexUserImport = `import userRoutes from "./user.routes";`;
    const appUserImport = `import userRoutes from "./routes/user.routes";`;

    let appModified = false;

    for (const importLine of [authHandlerImport, authImport]) {
        const next = appendImport(appContent, importLine);
        if (!next.inserted) {
            return false;
        }

        if (next.source !== appContent) {
            appContent = next.source;
            appModified = true;
        }
    }

    const hasAuthMount = /toNodeHandler\(\s*auth\s*\)/.test(appContent)
        && /\/api\/auth/.test(appContent);
    if (!hasAuthMount) {
        const authMountLine = "app.all(/^\\/api\\/auth(?:\\/.*)?$/, toNodeHandler(auth));\n";
        const jsonIndex = appContent.search(/^\s*app\.use\(\s*express\.json\(\)\s*\);\s*$/m);

        let insertionIndex = jsonIndex;
        if (insertionIndex < 0) {
            const healthIndex = appContent.search(/^\s*app\.get\(\s*["']\/health["']\s*,/m);
            insertionIndex = healthIndex;
        }

        if (insertionIndex < 0) {
            const exportMatch = appContent.match(/export default app;?\s*$/m);
            insertionIndex = exportMatch?.index ?? -1;
        }

        if (insertionIndex < 0) {
            return false;
        }

        appContent = appContent.slice(0, insertionIndex) + authMountLine + appContent.slice(insertionIndex);
        appModified = true;
    }

    const routeIndexPath = path.join(projectRoot, srcDir, "routes", "index.ts");
    if (await fs.pathExists(routeIndexPath)) {
        let routeContent = await fs.readFile(routeIndexPath, "utf-8");
        let routeModified = false;

        const userImportResult = appendImport(routeContent, routeIndexUserImport);
        if (!userImportResult.inserted) {
            return false;
        }

        if (userImportResult.source !== routeContent) {
            routeContent = userImportResult.source;
            routeModified = true;
        }

        const hasUserRoute = /rootRouter\.use\(\s*["']\/users["']\s*,\s*userRoutes\s*\)/.test(routeContent);
        if (!hasUserRoute) {
            const routeSetup = `\n// User routes\nrootRouter.use("/users", userRoutes);\n`;
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
    } else {
        const hasUserRoute = /app\.use\(\s*["']\/api\/users["']\s*,\s*userRoutes\s*\)/.test(appContent);
        if (!hasUserRoute) {
            const exportMatch = appContent.match(/export default app;?\s*$/m);
            if (!exportMatch || exportMatch.index === undefined) {
                return false;
            }

            const routeSetup = `\n// User routes\napp.use("/api/users", userRoutes);\n`;
            appContent = appContent.slice(0, exportMatch.index) + routeSetup + "\n" + appContent.slice(exportMatch.index);
            appModified = true;
        }

        const userImportResult = appendImport(appContent, appUserImport);
        if (!userImportResult.inserted) {
            return false;
        }

        if (userImportResult.source !== appContent) {
            appContent = userImportResult.source;
            appModified = true;
        }
    }

    if (appModified) {
        await fs.writeFile(appPath, appContent);
    }

    return true;
}

/**
 * Injects auth endpoint documentation into the OpenAPI spec file.
 */
export async function injectAuthDocs(projectRoot: string, srcDir: string): Promise<boolean> {
    const openApiPath = path.join(projectRoot, srcDir, "lib", "openapi.ts");
    if (!await fs.pathExists(openApiPath)) {
        return false;
    }

    const authMarker = "// ZURO_AUTH_DOCS";
    let content = await fs.readFile(openApiPath, "utf-8");
    if (content.includes(authMarker)) {
        return true;
    }

    const moduleDocsEndMarker = "// ZURO_DOCS_MODULES_END";
    if (!content.includes(moduleDocsEndMarker)) {
        return false;
    }

    const authBlock = `\nconst authSignUpSchema = z.object({
    email: z.string().email().openapi({ example: "dev@company.com" }),
    password: z.string().min(8).openapi({ example: "strong-password" }),
    name: z.string().min(1).optional().openapi({ example: "Dev User" }),
});

const authSignInSchema = z.object({
    email: z.string().email().openapi({ example: "dev@company.com" }),
    password: z.string().min(8).openapi({ example: "strong-password" }),
});

const authUserSchema = z.object({
    id: z.string().openapi({ example: "user_123" }),
    email: z.string().email().openapi({ example: "dev@company.com" }),
    name: z.string().nullable().openapi({ example: "Dev User" }),
});

${authMarker}
registry.registerPath({
    method: "post",
    path: "/api/auth/sign-up/email",
    tags: ["Auth"],
    summary: "Register using email and password",
    request: {
        body: {
            content: {
                "application/json": {
                    schema: authSignUpSchema,
                },
            },
        },
    },
    responses: {
        200: { description: "Registration successful" },
    },
});

registry.registerPath({
    method: "post",
    path: "/api/auth/sign-in/email",
    tags: ["Auth"],
    summary: "Sign in using email and password",
    request: {
        body: {
            content: {
                "application/json": {
                    schema: authSignInSchema,
                },
            },
        },
    },
    responses: {
        200: { description: "Sign in successful" },
        401: { description: "Invalid credentials" },
    },
});

registry.registerPath({
    method: "post",
    path: "/api/auth/sign-out",
    tags: ["Auth"],
    summary: "Sign out current user",
    responses: {
        200: { description: "Sign out successful" },
    },
});

registry.registerPath({
    method: "get",
    path: "/api/users/me",
    tags: ["Auth"],
    summary: "Get current authenticated user",
    security: [{ bearerAuth: [] }],
    responses: {
        200: {
            description: "Current user",
            content: {
                "application/json": {
                    schema: z.object({ user: authUserSchema }),
                },
            },
        },
        401: { description: "Not authenticated" },
    },
});
`;

    content = content.replace(moduleDocsEndMarker, `${authBlock}\n${moduleDocsEndMarker}`);
    await fs.writeFile(openApiPath, content);

    return true;
}

export interface AuthPromptResult {
    shouldInstallDocsForAuth: boolean;
    authDatabaseDialect: DatabaseModuleName | null;
}

/**
 * Runs auth-specific prompts (docs co-install).
 * Returns null if the user cancels.
 */
export async function promptAuthConfig(
    projectRoot: string,
    srcDir: string,
    options: { yes?: boolean },
): Promise<AuthPromptResult | null> {
    const { isDocsModuleInstalled } = await import("./docs.handler");
    const docsInstalled = await isDocsModuleInstalled(projectRoot, srcDir);
    let shouldInstallDocsForAuth = false;

    if (!docsInstalled) {
        if (options.yes) {
            shouldInstallDocsForAuth = true;
        } else {
            const docsResponse = await prompts({
                type: "confirm",
                name: "installDocs",
                message: "Install API docs module (Scalar + OpenAPI) too?",
                initial: true,
            });

            if (docsResponse.installDocs === undefined) {
                console.log(chalk.yellow("Operation cancelled."));
                return null;
            }

            shouldInstallDocsForAuth = docsResponse.installDocs;
        }
    }

    const { detectInstalledDatabaseDialect } = await import("./database.handler");
    const authDatabaseDialect = await detectInstalledDatabaseDialect(projectRoot, srcDir);

    return { shouldInstallDocsForAuth, authDatabaseDialect };
}

/**
 * Prints post-install hints for the auth module.
 */
export function printAuthHints(generatedAuthSecret: boolean) {
    if (generatedAuthSecret) {
        console.log(chalk.yellow("ℹ BETTER_AUTH_SECRET was generated automatically."));
    } else {
        console.log(chalk.yellow("ℹ Review BETTER_AUTH_SECRET and BETTER_AUTH_URL in .env."));
    }

    console.log(chalk.yellow("ℹ Run migrations: npx drizzle-kit generate && npx drizzle-kit migrate"));
}
