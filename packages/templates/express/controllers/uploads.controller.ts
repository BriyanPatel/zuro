import type { Request, Response } from "express";
import { z } from "zod";
import { BadRequestError } from "../lib/errors";
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

export const UploadsController = {
    async upload(req: Request & { file?: Express.Multer.File; uploadUser?: { id: string } | null }, res: Response) {
        if (getUploadMode() !== "proxy") {
            throw new BadRequestError("Uploads module is not configured for proxy uploads.");
        }

        if (!req.file) {
            throw new BadRequestError("Attach a file using the 'file' field.");
        }

        const result = await saveProxyUpload(req.file, {
            ownerId: getUploadUserId(req),
        });

        res.status(201).json(result);
    },

    async presign(req: Request & { uploadUser?: { id: string } | null }, res: Response) {
        if (getUploadMode() !== "direct") {
            throw new BadRequestError("Uploads module is not configured for direct uploads.");
        }

        const payload = directInitSchema.parse(req.body);
        const upload = await prepareDirectUpload({
            ...payload,
            ownerId: getUploadUserId(req),
        });

        res.json({ upload });
    },

    async complete(req: Request & { uploadUser?: { id: string } | null }, res: Response) {
        const payload = directCompleteSchema.parse(req.body);
        const result = await completeDirectUpload({
            ...payload,
            ownerId: getUploadUserId(req),
        });

        res.status(201).json(result);
    },

    async initMultipart(req: Request & { uploadUser?: { id: string } | null }, res: Response) {
        if (getUploadMode() !== "large") {
            throw new BadRequestError("Uploads module is not configured for large uploads.");
        }

        const payload = multipartInitSchema.parse(req.body);
        const upload = await prepareMultipartUpload({
            ...payload,
            ownerId: getUploadUserId(req),
        });

        res.json({ upload });
    },

    async completeMultipart(req: Request & { uploadUser?: { id: string } | null }, res: Response) {
        const payload = multipartCompleteSchema.parse(req.body);
        const result = await completeMultipartUploadFlow({
            ...payload,
            ownerId: getUploadUserId(req),
        });

        res.status(201).json(result);
    },

    async abortMultipart(req: Request & { uploadUser?: { id: string } | null }, res: Response) {
        if (getUploadMode() !== "large") {
            throw new BadRequestError("Uploads module is not configured for large uploads.");
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
    },

    async accessUrl(req: Request & { uploadUser?: { id: string } | null }, res: Response) {
        const payload = keyOnlySchema.pick({
            key: true,
            resourceType: true,
        }).parse(req.body);

        const result = await getUploadAccessUrl({
            ...payload,
            ownerId: getUploadUserId(req),
        });

        res.json(result);
    },

    async remove(req: Request & { uploadUser?: { id: string } | null }, res: Response) {
        const payload = keyOnlySchema.parse(req.body);
        await deleteUpload({
            ...payload,
            ownerId: getUploadUserId(req),
        });

        res.status(204).send();
    },
};
