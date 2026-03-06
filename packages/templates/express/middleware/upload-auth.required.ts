import type { NextFunction, Request, Response } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../lib/auth";
import { UnauthorizedError } from "../lib/errors";

export const uploadAuth = async (
    req: Request & { uploadUser?: { id: string } | null },
    _res: Response,
    next: NextFunction
) => {
    try {
        const session = await auth.api.getSession({
            headers: fromNodeHeaders(req.headers),
        });

        if (!session) {
            next(new UnauthorizedError("Authentication is required for uploads."));
            return;
        }

        req.uploadUser = { id: session.user.id };
        next();
    } catch (error) {
        next(error);
    }
};

export function getUploadUserId(req: Request & { uploadUser?: { id: string } | null }) {
    return req.uploadUser?.id || null;
}
