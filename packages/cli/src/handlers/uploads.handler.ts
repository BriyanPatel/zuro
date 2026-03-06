import path from "path";
import fs from "fs-extra";
import prompts from "prompts";
import chalk from "chalk";
import { appendImport } from "../utils/code-inject";
import { readZuroConfig } from "../utils/config";

export type UploadProvider = "s3" | "r2" | "cloudinary";
export type UploadMode = "proxy" | "direct" | "large";
export type UploadAuthMode = "required" | "none";
export type UploadAccess = "private" | "public";
export type UploadPreset = "image" | "document" | "video";

interface UploadPresetConfig {
    mimeTypes: string[];
    maxFileSize: number;
    maxFiles: number;
}

const UPLOAD_PRESETS: Record<UploadPreset, UploadPresetConfig> = {
    image: {
        mimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
        maxFileSize: 5 * 1024 * 1024,
        maxFiles: 1,
    },
    document: {
        mimeTypes: [
            "application/pdf",
            "text/plain",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ],
        maxFileSize: 10 * 1024 * 1024,
        maxFiles: 3,
    },
    video: {
        mimeTypes: ["video/mp4", "video/quicktime", "video/webm"],
        maxFileSize: 100 * 1024 * 1024,
        maxFiles: 1,
    },
};

export interface UploadPromptResult {
    provider: UploadProvider;
    mode: UploadMode;
    authMode: UploadAuthMode;
    access: UploadAccess;
    preset: UploadPreset;
    useDatabaseMetadata: boolean;
    shouldInstallAuth: boolean;
    shouldInstallDatabase: boolean;
    envVars: Record<string, string>;
}

export function getUploadEnvSchemaFields(provider: UploadProvider) {
    const shared = [
        { name: "UPLOAD_PROVIDER", schema: `z.enum(["s3", "r2", "cloudinary"])` },
        { name: "UPLOAD_MODE", schema: `z.enum(["proxy", "direct", "large"])` },
        { name: "UPLOAD_AUTH_MODE", schema: `z.enum(["required", "none"])` },
        { name: "UPLOAD_FILE_ACCESS", schema: `z.enum(["private", "public"])` },
        { name: "UPLOAD_FILE_PRESET", schema: `z.enum(["image", "document", "video"])` },
        { name: "UPLOAD_KEY_PREFIX", schema: "z.string().min(1)" },
        { name: "UPLOAD_ALLOWED_MIME", schema: "z.string().min(1)" },
        { name: "UPLOAD_MAX_FILE_SIZE", schema: "z.coerce.number().positive()" },
        { name: "UPLOAD_MAX_FILES", schema: "z.coerce.number().int().positive()" },
        { name: "UPLOAD_DIRECT_URL_TTL_SECONDS", schema: "z.coerce.number().int().positive().default(900)" },
        { name: "UPLOAD_ACCESS_URL_TTL_SECONDS", schema: "z.coerce.number().int().positive().default(300)" },
        { name: "UPLOAD_MULTIPART_PART_SIZE", schema: "z.coerce.number().int().positive().default(5242880)" },
    ];

    if (provider === "cloudinary") {
        return [
            ...shared,
            { name: "CLOUDINARY_CLOUD_NAME", schema: "z.string().min(1)" },
            { name: "CLOUDINARY_API_KEY", schema: "z.string().min(1)" },
            { name: "CLOUDINARY_API_SECRET", schema: "z.string().min(1)" },
            { name: "CLOUDINARY_FOLDER", schema: "z.string().min(1).default(\"uploads\")" },
            { name: "CLOUDINARY_UPLOAD_PRESET", schema: "z.string().default(\"\")" },
        ];
    }

    return [
        ...shared,
        { name: "UPLOAD_BUCKET", schema: "z.string().min(1)" },
        { name: "UPLOAD_REGION", schema: "z.string().min(1)" },
        { name: "UPLOAD_ENDPOINT", schema: "z.string().default(\"\")" },
        { name: "UPLOAD_ACCESS_KEY_ID", schema: "z.string().min(1)" },
        { name: "UPLOAD_SECRET_ACCESS_KEY", schema: "z.string().min(1)" },
        { name: "UPLOAD_PUBLIC_BASE_URL", schema: "z.string().default(\"\")" },
    ];
}

async function isAuthInstalled(projectRoot: string, srcDir: string) {
    return fs.pathExists(path.join(projectRoot, srcDir, "lib", "auth.ts"));
}

function hasDrizzleDatabase(config: Awaited<ReturnType<typeof readZuroConfig>> | null) {
    return config?.database?.orm === "drizzle";
}

function getProviderEnvDefaults(provider: UploadProvider): Record<string, string> {
    if (provider === "cloudinary") {
        return {
            CLOUDINARY_CLOUD_NAME: "your-cloud-name",
            CLOUDINARY_API_KEY: "your-api-key",
            CLOUDINARY_API_SECRET: "your-api-secret",
            CLOUDINARY_FOLDER: "uploads",
            CLOUDINARY_UPLOAD_PRESET: "",
        };
    }

    return {
        UPLOAD_BUCKET: `your-${provider}-bucket`,
        UPLOAD_REGION: provider === "r2" ? "auto" : "us-east-1",
        UPLOAD_ENDPOINT: provider === "r2" ? "https://<account-id>.r2.cloudflarestorage.com" : "",
        UPLOAD_ACCESS_KEY_ID: "your-access-key-id",
        UPLOAD_SECRET_ACCESS_KEY: "your-secret-access-key",
        UPLOAD_PUBLIC_BASE_URL: "",
    };
}

function buildSharedEnvVars(
    provider: UploadProvider,
    mode: UploadMode,
    authMode: UploadAuthMode,
    access: UploadAccess,
    preset: UploadPreset,
    maxFileSize: number,
    maxFiles: number
) {
    return {
        UPLOAD_PROVIDER: provider,
        UPLOAD_MODE: mode,
        UPLOAD_AUTH_MODE: authMode,
        UPLOAD_FILE_ACCESS: access,
        UPLOAD_FILE_PRESET: preset,
        UPLOAD_KEY_PREFIX: "uploads",
        UPLOAD_ALLOWED_MIME: UPLOAD_PRESETS[preset].mimeTypes.join(","),
        UPLOAD_MAX_FILE_SIZE: String(maxFileSize),
        UPLOAD_MAX_FILES: String(maxFiles),
        UPLOAD_DIRECT_URL_TTL_SECONDS: "900",
        UPLOAD_ACCESS_URL_TTL_SECONDS: "300",
        UPLOAD_MULTIPART_PART_SIZE: "5242880",
    };
}

export async function promptUploadsConfig(
    projectRoot: string,
    srcDir: string
): Promise<UploadPromptResult | null> {
    const projectConfig = await readZuroConfig(projectRoot);
    const authInstalled = await isAuthInstalled(projectRoot, srcDir);
    const drizzleInstalled = hasDrizzleDatabase(projectConfig);

    const initial = await prompts([
        {
            type: "select",
            name: "provider",
            message: "Which upload provider?",
            choices: [
                { title: "S3", value: "s3" },
                { title: "R2", value: "r2" },
                { title: "Cloudinary", value: "cloudinary" },
            ],
            initial: 0,
        },
        {
            type: "select",
            name: "mode",
            message: "Which upload mode?",
            choices: [
                { title: "Proxy", description: "API server receives the file and uploads it", value: "proxy" },
                { title: "Direct", description: "Client uploads directly with signed params/URLs", value: "direct" },
                { title: "Large", description: "Multipart upload flow for large files", value: "large" },
            ],
            initial: 1,
        },
        {
            type: "select",
            name: "authMode",
            message: "Who can upload?",
            choices: [
                { title: "Authenticated only", value: "required" },
                { title: "Public", value: "none" },
            ],
            initial: authInstalled ? 0 : 1,
        },
        {
            type: "select",
            name: "access",
            message: "How should uploaded files be accessed?",
            choices: [
                { title: "Private", value: "private" },
                { title: "Public", value: "public" },
            ],
            initial: 0,
        },
        {
            type: "select",
            name: "preset",
            message: "Which file preset?",
            choices: [
                { title: "Image", value: "image" },
                { title: "Document", value: "document" },
                { title: "Video", value: "video" },
            ],
            initial: 0,
        },
    ]);

    if (initial.provider === undefined) {
        console.log(chalk.yellow("Operation cancelled."));
        return null;
    }

    const provider = initial.provider as UploadProvider;
    const mode = initial.mode as UploadMode;
    const authMode = initial.authMode as UploadAuthMode;
    const access = initial.access as UploadAccess;
    const preset = initial.preset as UploadPreset;

    if (provider === "cloudinary" && mode === "large") {
        console.log(chalk.yellow("\nCloudinary large multipart scaffolding is not available in this module yet."));
        console.log(chalk.yellow("Use S3 or R2 for large uploads, or pick Proxy/Direct for Cloudinary.\n"));
        return null;
    }

    if (provider === "cloudinary" && preset === "document") {
        const warning = await prompts({
            type: "confirm",
            name: "continue",
            message: "Cloudinary is media-first. Continue with Cloudinary for non-media/general files?",
            initial: false,
        });

        if (!warning.continue) {
            console.log(chalk.yellow("Operation cancelled."));
            return null;
        }
    }

    const presetDefaults = UPLOAD_PRESETS[preset];

    let useDatabaseMetadata = false;
    let shouldInstallDatabase = false;

    const metadataPrompt = await prompts({
        type: "confirm",
        name: "metadata",
        message: drizzleInstalled
            ? "Store upload metadata in your database?"
            : "Install database and store upload metadata?",
        initial: true,
    });

    if (metadataPrompt.metadata === undefined) {
        console.log(chalk.yellow("Operation cancelled."));
        return null;
    }

    if (metadataPrompt.metadata === true) {
        useDatabaseMetadata = true;

        if (!projectConfig?.database) {
            shouldInstallDatabase = true;
        } else if (!drizzleInstalled) {
            console.log(chalk.yellow("\nUploads metadata currently supports Drizzle-based database setups only."));
            console.log(chalk.yellow("Install or switch to a Drizzle database, or continue without metadata.\n"));
            return null;
        }
    }

    if (access === "private" && !useDatabaseMetadata) {
        const warning = await prompts({
            type: "confirm",
            name: "continue",
            message: "Private uploads work best with metadata. Continue without database tracking?",
            initial: false,
        });

        if (!warning.continue) {
            console.log(chalk.yellow("Operation cancelled."));
            return null;
        }
    }

    let shouldInstallAuth = false;
    if (authMode !== "none" && !authInstalled) {
        const authPrompt = await prompts({
            type: "confirm",
            name: "installAuth",
            message: "Uploads auth requires the auth module. Install auth now?",
            initial: true,
        });

        if (!authPrompt.installAuth) {
            console.log(chalk.yellow("Operation cancelled."));
            return null;
        }

        shouldInstallAuth = true;
    }

    return {
        provider,
        mode,
        authMode,
        access,
        preset,
        useDatabaseMetadata,
        shouldInstallAuth,
        shouldInstallDatabase,
        envVars: {
            ...buildSharedEnvVars(provider, mode, authMode, access, preset, presetDefaults.maxFileSize, presetDefaults.maxFiles),
            ...getProviderEnvDefaults(provider),
        },
    };
}

export async function injectUploadsRoutes(projectRoot: string, srcDir: string): Promise<boolean> {
    const routeIndexPath = path.join(projectRoot, srcDir, "routes", "index.ts");
    const routeImport = `import uploadsRoutes from "./uploads.routes";`;
    const routeMountPattern = /rootRouter\.use\(\s*["']\/uploads["']\s*,\s*uploadsRoutes\s*\)/;

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
            const routeSetup = `\n// Upload routes\nrootRouter.use("/uploads", uploadsRoutes);\n`;
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

    const appImportResult = appendImport(appContent, `import uploadsRoutes from "./routes/uploads.routes";`);
    if (!appImportResult.inserted) {
        return false;
    }

    if (appImportResult.source !== appContent) {
        appContent = appImportResult.source;
        appModified = true;
    }

    const hasMount = /app\.use\(\s*["']\/api\/uploads["']\s*,\s*uploadsRoutes\s*\)/.test(appContent);
    if (!hasMount) {
        const setup = `\n// Upload routes\napp.use("/api/uploads", uploadsRoutes);\n`;
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

export async function isUploadsModuleInstalled(projectRoot: string, srcDir: string): Promise<boolean> {
    return fs.pathExists(path.join(projectRoot, srcDir, "routes", "uploads.routes.ts"));
}

export async function detectInstalledUploadsMode(projectRoot: string): Promise<UploadMode | null> {
    const envPath = path.join(projectRoot, ".env");
    if (!await fs.pathExists(envPath)) {
        return null;
    }

    const content = await fs.readFile(envPath, "utf-8");
    const match = content.match(/^UPLOAD_MODE=(proxy|direct|large)$/m);

    if (!match) {
        return null;
    }

    return match[1] as UploadMode;
}

export async function injectUploadsDocs(
    projectRoot: string,
    srcDir: string,
    mode: UploadMode
): Promise<boolean> {
    const openApiPath = path.join(projectRoot, srcDir, "lib", "openapi.ts");
    if (!await fs.pathExists(openApiPath)) {
        return false;
    }

    const marker = "// ZURO_UPLOADS_DOCS";
    let content = await fs.readFile(openApiPath, "utf-8");
    if (content.includes(marker)) {
        return true;
    }

    const moduleDocsEndMarker = "// ZURO_DOCS_MODULES_END";
    if (!content.includes(moduleDocsEndMarker)) {
        return false;
    }

    const commonBlock = `\nconst uploadAccessSchema = z.object({
    key: z.string().openapi({ example: "uploads/users/user_123/2026/03/06/example.png" }),
    resourceType: z.string().optional().openapi({ example: "image" }),
    providerAssetId: z.string().optional().openapi({ example: "uploads/users/user_123/example" }),
});
\n`;

    const directBlock = mode === "direct"
        ? `registry.registerPath({
    method: "post",
    path: "/api/uploads/presign",
    tags: ["Uploads"],
    summary: "Create a signed direct upload request",
    request: {
        body: {
            content: {
                "application/json": {
                    schema: z.object({
                        originalName: z.string().min(1),
                        mimeType: z.string().min(1),
                        bytes: z.number().positive(),
                    }),
                },
            },
        },
    },
    responses: {
        200: { description: "Signed upload created" },
    },
});
\nregistry.registerPath({
    method: "post",
    path: "/api/uploads/complete",
    tags: ["Uploads"],
    summary: "Finalize a direct upload and persist metadata",
    responses: {
        201: { description: "Upload finalized" },
    },
});
`
        : "";

    const proxyBlock = mode === "proxy"
        ? `registry.registerPath({
    method: "post",
    path: "/api/uploads",
    tags: ["Uploads"],
    summary: "Upload a file through the API server",
    responses: {
        201: { description: "File uploaded" },
    },
});
`
        : "";

    const largeBlock = mode === "large"
        ? `registry.registerPath({
    method: "post",
    path: "/api/uploads/multipart/init",
    tags: ["Uploads"],
    summary: "Start a multipart upload session",
    responses: {
        200: { description: "Multipart upload initialized" },
    },
});
\nregistry.registerPath({
    method: "post",
    path: "/api/uploads/multipart/complete",
    tags: ["Uploads"],
    summary: "Complete a multipart upload",
    responses: {
        201: { description: "Multipart upload completed" },
    },
});
\nregistry.registerPath({
    method: "post",
    path: "/api/uploads/multipart/abort",
    tags: ["Uploads"],
    summary: "Abort a multipart upload",
    responses: {
        204: { description: "Multipart upload aborted" },
    },
});
`
        : "";

    const sharedOps = `registry.registerPath({
    method: "post",
    path: "/api/uploads/access-url",
    tags: ["Uploads"],
    summary: "Create an access URL for an uploaded file",
    request: {
        body: {
            content: {
                "application/json": {
                    schema: uploadAccessSchema,
                },
            },
        },
    },
    responses: {
        200: { description: "Access URL generated" },
    },
});
\nregistry.registerPath({
    method: "delete",
    path: "/api/uploads",
    tags: ["Uploads"],
    summary: "Delete an uploaded file",
    request: {
        body: {
            content: {
                "application/json": {
                    schema: uploadAccessSchema,
                },
            },
        },
    },
    responses: {
        204: { description: "Upload deleted" },
    },
});
`;

    const block = `\n${commonBlock}${marker}\n${proxyBlock}${directBlock}${largeBlock}${sharedOps}`;
    content = content.replace(moduleDocsEndMarker, `${block}\n${moduleDocsEndMarker}`);

    const tagInsert = /(\{\s*name:\s*"Auth".+\},\s*\n\s*\],)/;
    if (tagInsert.test(content) && !content.includes(`{ name: "Uploads", description: "File uploads and asset access" }`)) {
        content = content.replace(
            tagInsert,
            `{ name: "Auth", description: "Authentication and session endpoints" },\n            { name: "Uploads", description: "File uploads and asset access" },\n        ],`
        );
    }

    await fs.writeFile(openApiPath, content);
    return true;
}

export function printUploadHints(result: UploadPromptResult) {
    console.log(chalk.yellow("ℹ Upload routes are mounted at: /api/uploads"));
    console.log(chalk.yellow(`ℹ Provider: ${result.provider} · Mode: ${result.mode} · Access: ${result.access}`));
    console.log(chalk.yellow("ℹ Fill the generated upload env vars in .env before testing uploads."));

    if (result.mode === "proxy") {
        console.log(chalk.yellow("ℹ Reuse uploadSingle()/uploadArray() from src/lib/uploads/proxy.ts in your own form + file routes."));
    }

    if (result.provider === "r2") {
        console.log(chalk.yellow("ℹ R2 presigned URLs use the R2 S3 API endpoint, not your custom domain."));
    }

    if (result.useDatabaseMetadata) {
        console.log(chalk.yellow("ℹ Upload metadata is stored in db/schema/uploads.ts."));
    } else {
        console.log(chalk.yellow("ℹ No upload metadata table was added. Private file ownership checks fall back to key prefixes."));
    }
}
