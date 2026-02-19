import type { Request, Response, NextFunction } from "express";
import { z, ZodError } from "zod";

type ValidationPayload = {
    body?: unknown;
    query?: unknown;
    params?: unknown;
};

export const validate =
    (schema: z.ZodType<ValidationPayload>) =>
        async (req: Request, res: Response, next: NextFunction) => {
            try {
                const parsed: ValidationPayload = await schema.parseAsync({
                    body: req.body,
                    query: req.query,
                    params: req.params,
                });

                if (parsed.body !== undefined) {
                    req.body = parsed.body;
                }

                if (parsed.query !== undefined) {
                    req.query = parsed.query as Request["query"];
                }

                if (parsed.params !== undefined) {
                    req.params = parsed.params as Request["params"];
                }

                return next();
            } catch (error) {
                if (error instanceof ZodError) {
                    return res.status(422).json({
                        status: "error",
                        code: "VALIDATION_ERROR",
                        message: "Validation failed",
                        errors: error.issues.map((issue) => ({
                            path: issue.path.join("."),
                            message: issue.message,
                        })),
                    });
                }

                return next(error);
            }
        };
