import type { NextFunction, Request, Response } from "express";
import { UnauthorizedError } from "../lib/errors";
import { getBearerToken, verifyAuthToken } from "../lib/auth";

export const uploadAuth = async (
    req: Request & { uploadUser?: { id: string } | null },
    _res: Response,
    next: NextFunction
) => {
    try {
        const token = getBearerToken(req.headers.authorization);
        if (!token) {
            next(new UnauthorizedError("Authentication is required for uploads."));
            return;
        }

        const payload = verifyAuthToken(token, "access");
        req.uploadUser = { id: payload.sub };
        next();
    } catch (error) {
        next(error);
    }
};

export function getUploadUserId(req: Request & { uploadUser?: { id: string } | null }) {
    return req.uploadUser?.id || null;
}
