import { OpenAPIRegistry, OpenApiGeneratorV3, extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

const registry = new OpenAPIRegistry();

const healthResponseSchema = z.object({
    status: z.string().openapi({ example: "ok" }),
    timestamp: z.string().datetime().openapi({ example: "2026-01-01T00:00:00.000Z" }),
});

registry.registerPath({
    method: "get",
    path: "/health",
    tags: ["System"],
    summary: "Health check",
    responses: {
        200: {
            description: "Service health status",
            content: {
                "application/json": {
                    schema: healthResponseSchema,
                },
            },
        },
    },
});

// ZURO_DOCS_MODULES_START
// Additional module docs are inserted here by `zuro-cli add <module>`.
// ZURO_DOCS_MODULES_END

export function createOpenApiDocument() {
    const generator = new OpenApiGeneratorV3(registry.definitions);

    return generator.generateDocument({
        openapi: "3.0.3",
        info: {
            title: "Zuro API",
            version: "1.0.0",
            description: "API reference generated with Zod + OpenAPI.",
        },
        servers: [
            {
                url: "http://localhost:3000",
                description: "Local development",
            },
        ],
        tags: [
            { name: "System", description: "System and health endpoints" },
            { name: "Auth", description: "Authentication and session endpoints" },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
            },
        },
    });
}
