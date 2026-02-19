import type { Request, RequestHandler } from "express";
import { z, ZodError } from "zod";

type ValidationTarget = "body" | "query" | "params";

type ValidationPayload = {
    body?: unknown;
    query?: unknown;
    params?: unknown;
};

export type RequestSchema = z.ZodType<ValidationPayload>;

type InferSchemaField<
    TSchema extends RequestSchema,
    TKey extends keyof ValidationPayload,
    TFallback
> = z.infer<TSchema> extends Record<TKey, infer TValue> ? TValue : TFallback;

export type ValidatedRequest<TSchema extends RequestSchema> = Request<
    InferSchemaField<TSchema, "params", Record<string, string>>,
    unknown,
    InferSchemaField<TSchema, "body", unknown>,
    InferSchemaField<TSchema, "query", Record<string, unknown>>
>;

export interface ValidationIssue {
    path: string;
    message: string;
}

export interface ValidationErrorResponse {
    status: "error";
    code: "VALIDATION_ERROR";
    message: string;
    errors: ValidationIssue[];
}

export interface ValidateOptions {
    targets?: ValidationTarget[];
    unknownKeys?: "strip" | "passthrough";
    statusCode?: number;
    formatError?: (error: ZodError) => ValidationErrorResponse;
}

const DEFAULT_TARGETS: ValidationTarget[] = ["body", "query", "params"];
const DEFAULT_STATUS_CODE = 422;

function isPlainObject(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function mergeUnknownKeys(rawValue: unknown, parsedValue: unknown) {
    if (!isPlainObject(rawValue) || !isPlainObject(parsedValue)) {
        return parsedValue;
    }

    return {
        ...rawValue,
        ...parsedValue,
    };
}

function toValidationResponse(error: ZodError): ValidationErrorResponse {
    return {
        status: "error",
        code: "VALIDATION_ERROR",
        message: "Validation failed",
        errors: error.issues.map((issue) => ({
            path: issue.path.join("."),
            message: issue.message,
        })),
    };
}

export const validate =
    <TSchema extends RequestSchema>(schema: TSchema, options: ValidateOptions = {}): RequestHandler =>
        async (req, res, next) => {
            const targets = options.targets?.length ? options.targets : DEFAULT_TARGETS;
            const payload: ValidationPayload = {};

            if (targets.includes("body")) {
                payload.body = req.body;
            }

            if (targets.includes("query")) {
                payload.query = req.query;
            }

            if (targets.includes("params")) {
                payload.params = req.params;
            }

            try {
                const parsed = await schema.parseAsync(payload);
                const mode = options.unknownKeys ?? "strip";

                if (targets.includes("body") && parsed.body !== undefined) {
                    req.body = mode === "passthrough"
                        ? mergeUnknownKeys(req.body, parsed.body)
                        : parsed.body;
                }

                if (targets.includes("query") && parsed.query !== undefined) {
                    (req as Request).query = mode === "passthrough"
                        ? (mergeUnknownKeys(req.query, parsed.query) as Request["query"])
                        : (parsed.query as Request["query"]);
                }

                if (targets.includes("params") && parsed.params !== undefined) {
                    req.params = mode === "passthrough"
                        ? (mergeUnknownKeys(req.params, parsed.params) as Request["params"])
                        : (parsed.params as Request["params"]);
                }

                return next();
            } catch (error) {
                if (error instanceof ZodError) {
                    const formatter = options.formatError ?? toValidationResponse;
                    const response = formatter(error);
                    const statusCode = options.statusCode ?? DEFAULT_STATUS_CODE;
                    return res.status(statusCode).json(response);
                }

                return next(error);
            }
        };
