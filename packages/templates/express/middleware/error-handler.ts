import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { AppError, ValidationError } from "../lib/errors";
import { logger } from "../lib/logger";
import { env } from "../env";

interface ErrorResponse {
    status: "error";
    code: string;
    message: string;
    errors?: Array<{ path: string; message: string }>;
    stack?: string;
}

export const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    _next: NextFunction
) => {
    // Log the error
    logger.error({
        err,
        method: req.method,
        url: req.url,
        body: req.body,
    });

    // Handle Zod validation errors
    if (err instanceof ZodError) {
        const response: ErrorResponse = {
            status: "error",
            code: "VALIDATION_ERROR",
            message: "Validation failed",
            errors: err.issues.map((issue) => ({
                path: issue.path.join("."),
                message: issue.message,
            })),
        };
        return res.status(422).json(response);
    }

    // Handle custom AppError
    if (err instanceof AppError) {
        const response: ErrorResponse = {
            status: "error",
            code: err.code,
            message: err.message,
        };

        // Include validation errors if present
        if (err instanceof ValidationError) {
            response.errors = err.errors;
        }

        // Include stack trace in development
        if (env.NODE_ENV === "development") {
            response.stack = err.stack;
        }

        return res.status(err.statusCode).json(response);
    }

    // Handle unknown errors
    const response: ErrorResponse = {
        status: "error",
        code: "INTERNAL_ERROR",
        message:
            env.NODE_ENV === "production"
                ? "Something went wrong"
                : err.message || "Unknown error",
    };

    if (env.NODE_ENV === "development") {
        response.stack = err.stack;
    }

    return res.status(500).json(response);
};

// Async wrapper to catch async errors
export const asyncHandler =
    (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) =>
    (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };

// 404 handler
export const notFoundHandler = (req: Request, res: Response) => {
    res.status(404).json({
        status: "error",
        code: "NOT_FOUND",
        message: `Route ${req.method} ${req.url} not found`,
    });
};
