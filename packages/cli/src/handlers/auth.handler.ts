import path from "path";
import fs from "fs-extra";
import prompts from "prompts";
import chalk from "chalk";
import { appendImport } from "../utils/code-inject";
import type { DatabaseModuleName } from "./database.handler";

export type AuthProvider = "better-auth" | "jwt";

/**
 * Checks if the auth module is installed by looking for lib/auth.ts.
 */
export async function isAuthModuleInstalled(projectRoot: string, srcDir: string): Promise<boolean> {
    return await fs.pathExists(path.join(projectRoot, srcDir, "lib", "auth.ts"));
}

/**
 * Detects installed auth provider from src/lib/auth.ts content.
 */
export async function detectInstalledAuthProvider(
    projectRoot: string,
    srcDir: string
): Promise<AuthProvider | null> {
    const authPath = path.join(projectRoot, srcDir, "lib", "auth.ts");
    if (!await fs.pathExists(authPath)) {
        return null;
    }

    const authContent = await fs.readFile(authPath, "utf-8");
    if (authContent.includes("better-auth")) {
        return "better-auth";
    }

    if (authContent.includes("jsonwebtoken") || authContent.includes("JWT_ACCESS_SECRET")) {
        return "jwt";
    }

    return null;
}

/**
 * Modifies app/routes wiring to include auth endpoints.
 */
export async function injectAuthRoutes(
    projectRoot: string,
    srcDir: string,
    provider: AuthProvider
): Promise<boolean> {
    const appPath = path.join(projectRoot, srcDir, "app.ts");
    if (!await fs.pathExists(appPath)) {
        return false;
    }

    let appContent = await fs.readFile(appPath, "utf-8");
    const routeIndexUserImport = `import userRoutes from "./user.routes";`;
    const routeIndexAuthImport = `import authRoutes from "./auth.routes";`;
    const appUserImport = `import userRoutes from "./routes/user.routes";`;
    const appAuthImport = `import authRoutes from "./routes/auth.routes";`;

    let appModified = false;

    if (provider === "better-auth") {
        const authHandlerImport = `import { toNodeHandler } from "better-auth/node";`;
        const authImport = `import { auth } from "./lib/auth";`;

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
    }

    const routeIndexPath = path.join(projectRoot, srcDir, "routes", "index.ts");
    if (await fs.pathExists(routeIndexPath)) {
        let routeContent = await fs.readFile(routeIndexPath, "utf-8");
        let routeModified = false;

        const routeImports = provider === "jwt"
            ? [routeIndexAuthImport, routeIndexUserImport]
            : [routeIndexUserImport];

        for (const importLine of routeImports) {
            const next = appendImport(routeContent, importLine);
            if (!next.inserted) {
                return false;
            }

            if (next.source !== routeContent) {
                routeContent = next.source;
                routeModified = true;
            }
        }

        if (provider === "jwt") {
            const hasAuthRoute = /rootRouter\.use\(\s*["']\/auth["']\s*,\s*authRoutes\s*\)/.test(routeContent);
            if (!hasAuthRoute) {
                const routeSetup = `\n// Auth routes\nrootRouter.use("/auth", authRoutes);\n`;
                const exportMatch = routeContent.match(/export default rootRouter;?\s*$/m);

                if (!exportMatch || exportMatch.index === undefined) {
                    return false;
                }

                routeContent = routeContent.slice(0, exportMatch.index) + routeSetup + "\n" + routeContent.slice(exportMatch.index);
                routeModified = true;
            }
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
        if (provider === "jwt") {
            const authImportResult = appendImport(appContent, appAuthImport);
            if (!authImportResult.inserted) {
                return false;
            }

            if (authImportResult.source !== appContent) {
                appContent = authImportResult.source;
                appModified = true;
            }

            const hasAuthRoute = /app\.use\(\s*["']\/api\/auth["']\s*,\s*authRoutes\s*\)/.test(appContent);
            if (!hasAuthRoute) {
                const exportMatch = appContent.match(/export default app;?\s*$/m);
                if (!exportMatch || exportMatch.index === undefined) {
                    return false;
                }

                const routeSetup = `\n// Auth routes\napp.use("/api/auth", authRoutes);\n`;
                appContent = appContent.slice(0, exportMatch.index) + routeSetup + "\n" + appContent.slice(exportMatch.index);
                appModified = true;
            }
        }

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
export async function injectAuthDocs(
    projectRoot: string,
    srcDir: string,
    provider: AuthProvider
): Promise<boolean> {
    const openApiPath = path.join(projectRoot, srcDir, "lib", "openapi.ts");
    if (!await fs.pathExists(openApiPath)) {
        return false;
    }

    const betterAuthMarker = "// ZURO_AUTH_DOCS_BETTER_AUTH";
    const jwtMarker = "// ZURO_AUTH_DOCS_JWT";
    const legacyMarker = "// ZURO_AUTH_DOCS";
    let content = await fs.readFile(openApiPath, "utf-8");
    if (content.includes(betterAuthMarker) || content.includes(jwtMarker) || content.includes(legacyMarker)) {
        return true;
    }

    const moduleDocsEndMarker = "// ZURO_DOCS_MODULES_END";
    if (!content.includes(moduleDocsEndMarker)) {
        return false;
    }

    const authBlock = provider === "jwt"
        ? `\nconst authSignUpSchema = z.object({
    email: z.string().email().openapi({ example: "dev@company.com" }),
    password: z.string().min(8).openapi({ example: "strong-password" }),
    name: z.string().min(1).optional().openapi({ example: "Dev User" }),
});

const authSignInSchema = z.object({
    email: z.string().email().openapi({ example: "dev@company.com" }),
    password: z.string().min(8).openapi({ example: "strong-password" }),
});

const authRefreshSchema = z.object({
    refreshToken: z.string().openapi({ example: "eyJhbGciOi..." }),
});

const authTokenSchema = z.object({
    accessToken: z.string().openapi({ example: "eyJhbGciOi..." }),
    refreshToken: z.string().openapi({ example: "eyJhbGciOi..." }),
    tokenType: z.literal("Bearer").openapi({ example: "Bearer" }),
});

const authUserSchema = z.object({
    id: z.string().openapi({ example: "user_123" }),
    email: z.string().email().openapi({ example: "dev@company.com" }),
    name: z.string().nullable().openapi({ example: "Dev User" }),
});

${jwtMarker}
registry.registerPath({
    method: "post",
    path: "/api/auth/sign-up/email",
    tags: ["Auth"],
    summary: "Register user and issue JWT tokens",
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
        200: {
            description: "Registration successful",
            content: {
                "application/json": {
                    schema: z.object({ user: authUserSchema, ...authTokenSchema.shape }),
                },
            },
        },
        409: { description: "Email already registered" },
    },
});

registry.registerPath({
    method: "post",
    path: "/api/auth/sign-in/email",
    tags: ["Auth"],
    summary: "Sign in and issue JWT tokens",
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
        200: {
            description: "Sign in successful",
            content: {
                "application/json": {
                    schema: authTokenSchema,
                },
            },
        },
        401: { description: "Invalid credentials" },
    },
});

registry.registerPath({
    method: "post",
    path: "/api/auth/refresh",
    tags: ["Auth"],
    summary: "Exchange refresh token for new JWT tokens",
    request: {
        body: {
            content: {
                "application/json": {
                    schema: authRefreshSchema,
                },
            },
        },
    },
    responses: {
        200: {
            description: "Tokens refreshed",
            content: {
                "application/json": {
                    schema: authTokenSchema,
                },
            },
        },
        401: { description: "Invalid refresh token" },
    },
});

registry.registerPath({
    method: "post",
    path: "/api/auth/sign-out",
    tags: ["Auth"],
    summary: "Client-side sign out for JWT auth",
    responses: {
        200: { description: "Sign out successful" },
    },
});

registry.registerPath({
    method: "get",
    path: "/api/auth/get-session",
    tags: ["Auth"],
    summary: "Get current JWT session user",
    security: [{ bearerAuth: [] }],
    responses: {
        200: {
            description: "Current session",
            content: {
                "application/json": {
                    schema: z.object({ user: authUserSchema.nullable() }),
                },
            },
        },
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
`
        : `\nconst authSignUpSchema = z.object({
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

${betterAuthMarker}
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
    authProvider: AuthProvider;
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
    options: { yes?: boolean; authProvider?: AuthProvider },
): Promise<AuthPromptResult | null> {
    const { isDocsModuleInstalled } = await import("./docs.handler");
    const docsInstalled = await isDocsModuleInstalled(projectRoot, srcDir);
    let authProvider: AuthProvider = "better-auth";
    let shouldInstallDocsForAuth = false;

    if (options.authProvider) {
        authProvider = options.authProvider;
    } else if (!options.yes) {
        const providerResponse = await prompts({
            type: "select",
            name: "provider",
            message: "Choose auth provider:",
            choices: [
                { title: "Better Auth (session + plugin ecosystem)", value: "better-auth" },
                { title: "JWT (access/refresh tokens)", value: "jwt" },
            ],
            initial: 0,
        });

        if (!providerResponse.provider) {
            console.log(chalk.yellow("Operation cancelled."));
            return null;
        }

        authProvider = providerResponse.provider as AuthProvider;
    }

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

    return { authProvider, shouldInstallDocsForAuth, authDatabaseDialect };
}

/**
 * Prints post-install hints for the auth module.
 */
export function printAuthHints(generatedAuthSecret: boolean, provider: AuthProvider) {
    if (provider === "better-auth") {
        if (generatedAuthSecret) {
            console.log(chalk.yellow("ℹ BETTER_AUTH_SECRET was generated automatically."));
        } else {
            console.log(chalk.yellow("ℹ Review BETTER_AUTH_SECRET and BETTER_AUTH_URL in .env."));
        }
    } else if (generatedAuthSecret) {
        console.log(chalk.yellow("ℹ JWT_ACCESS_SECRET and JWT_REFRESH_SECRET were generated automatically."));
    } else {
        console.log(chalk.yellow("ℹ Review JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, and token TTLs in .env."));
    }

    console.log(chalk.yellow("ℹ Run migrations: npx drizzle-kit generate && npx drizzle-kit migrate"));
}
