import type { Request, Response } from "express";
import { ZodError, z } from "zod";
import { getUploadUserId } from "../middleware/upload-auth";
import {
    abortMultipartUploadFlow,
    completeDirectUpload,
    completeMultipartUploadFlow,
    deleteUpload,
    getUploadAccessUrl,
    getUploadMode,
    prepareDirectUpload,
    prepareMultipartUpload,
    saveProxyUpload,
} from "../lib/uploads";

const directInitSchema = z.object({
    originalName: z.string().min(1),
    mimeType: z.string().min(1),
    bytes: z.coerce.number().positive(),
});

const directCompleteSchema = directInitSchema.extend({
    key: z.string().min(1),
    resourceType: z.string().optional(),
    providerResponse: z.record(z.string(), z.unknown()).optional(),
});

const multipartInitSchema = directInitSchema.extend({
    parts: z.coerce.number().int().positive().max(1000),
});

const multipartCompleteSchema = directCompleteSchema.extend({
    uploadId: z.string().min(1),
    parts: z.array(
        z.object({
            partNumber: z.coerce.number().int().positive(),
            etag: z.string().min(1),
        })
    ).min(1),
});

const keyOnlySchema = z.object({
    key: z.string().min(1),
    resourceType: z.string().optional(),
    providerAssetId: z.string().optional(),
    uploadId: z.string().optional(),
});

function respondError(res: Response, error: unknown) {
    if (error instanceof ZodError) {
        res.status(422).json({
            status: "error",
            code: "VALIDATION_ERROR",
            message: "Validation failed",
            errors: error.issues.map((issue) => ({
                path: issue.path.join("."),
                message: issue.message,
            })),
        });
        return;
    }

    const message = error instanceof Error ? error.message : "Unexpected upload error";
    res.status(400).json({
        status: "error",
        code: "UPLOAD_ERROR",
        message,
    });
}

export const UploadsController = {
    async upload(req: Request & { file?: Express.Multer.File; uploadUser?: { id: string } | null }, res: Response) {
        try {
            if (getUploadMode() !== "proxy") {
                res.status(404).json({
                    status: "error",
                    code: "ROUTE_NOT_AVAILABLE",
                    message: "Uploads module is not configured for proxy uploads.",
                });
                return;
            }

            if (!req.file) {
                res.status(400).json({
                    status: "error",
                    code: "FILE_REQUIRED",
                    message: "Attach a file using the 'file' field.",
                });
                return;
            }

            const result = await saveProxyUpload(req.file, {
                ownerId: getUploadUserId(req),
            });

            res.status(201).json(result);
        } catch (error) {
            respondError(res, error);
        }
    },

    async presign(req: Request & { uploadUser?: { id: string } | null }, res: Response) {
        try {
            if (getUploadMode() !== "direct") {
                res.status(404).json({
                    status: "error",
                    code: "ROUTE_NOT_AVAILABLE",
                    message: "Uploads module is not configured for direct uploads.",
                });
                return;
            }

            const payload = directInitSchema.parse(req.body);
            const upload = await prepareDirectUpload({
                ...payload,
                ownerId: getUploadUserId(req),
            });

            res.json({ upload });
        } catch (error) {
            respondError(res, error);
        }
    },

    async complete(req: Request & { uploadUser?: { id: string } | null }, res: Response) {
        try {
            const payload = directCompleteSchema.parse(req.body);
            const result = await completeDirectUpload({
                ...payload,
                ownerId: getUploadUserId(req),
            });

            res.status(201).json(result);
        } catch (error) {
            respondError(res, error);
        }
    },

    async initMultipart(req: Request & { uploadUser?: { id: string } | null }, res: Response) {
        try {
            if (getUploadMode() !== "large") {
                res.status(404).json({
                    status: "error",
                    code: "ROUTE_NOT_AVAILABLE",
                    message: "Uploads module is not configured for large uploads.",
                });
                return;
            }

            const payload = multipartInitSchema.parse(req.body);
            const upload = await prepareMultipartUpload({
                ...payload,
                ownerId: getUploadUserId(req),
            });

            res.json({ upload });
        } catch (error) {
            respondError(res, error);
        }
    },

    async completeMultipart(req: Request & { uploadUser?: { id: string } | null }, res: Response) {
        try {
            const payload = multipartCompleteSchema.parse(req.body);
            const result = await completeMultipartUploadFlow({
                ...payload,
                ownerId: getUploadUserId(req),
            });

            res.status(201).json(result);
        } catch (error) {
            respondError(res, error);
        }
    },

    async abortMultipart(req: Request & { uploadUser?: { id: string } | null }, res: Response) {
        try {
            if (getUploadMode() !== "large") {
                res.status(404).json({
                    status: "error",
                    code: "ROUTE_NOT_AVAILABLE",
                    message: "Uploads module is not configured for large uploads.",
                });
                return;
            }

            const payload = keyOnlySchema.pick({
                key: true,
                uploadId: true,
            }).parse(req.body);

            await abortMultipartUploadFlow({
                ...payload,
                uploadId: payload.uploadId!,
                ownerId: getUploadUserId(req),
            });

            res.status(204).send();
        } catch (error) {
            respondError(res, error);
        }
    },

    async accessUrl(req: Request & { uploadUser?: { id: string } | null }, res: Response) {
        try {
            const payload = keyOnlySchema.pick({
                key: true,
                resourceType: true,
            }).parse(req.body);

            const result = await getUploadAccessUrl({
                ...payload,
                ownerId: getUploadUserId(req),
            });

            res.json(result);
        } catch (error) {
            respondError(res, error);
        }
    },

    async remove(req: Request & { uploadUser?: { id: string } | null }, res: Response) {
        try {
            const payload = keyOnlySchema.parse(req.body);
            await deleteUpload({
                ...payload,
                ownerId: getUploadUserId(req),
            });

            res.status(204).send();
        } catch (error) {
            respondError(res, error);
        }
    },
};
