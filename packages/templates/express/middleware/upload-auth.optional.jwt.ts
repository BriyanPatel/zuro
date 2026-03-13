import type { NextFunction, Request, Response } from "express";
import { getBearerToken, verifyAuthToken } from "../lib/auth";

export const uploadAuth = async (
    req: Request & { uploadUser?: { id: string } | null },
    _res: Response,
    next: NextFunction
) => {
    try {
        const token = getBearerToken(req.headers.authorization);
        if (!token) {
            req.uploadUser = null;
            next();
            return;
        }

        const payload = verifyAuthToken(token, "access");
        req.uploadUser = { id: payload.sub };
        next();
    } catch {
        req.uploadUser = null;
        next();
    }
};

export function getUploadUserId(req: Request & { uploadUser?: { id: string } | null }) {
    return req.uploadUser?.id || null;
}
