import type { NextFunction, Request, Response } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../lib/auth";

export const uploadAuth = async (
    req: Request & { uploadUser?: { id: string } | null },
    res: Response,
    next: NextFunction
) => {
    try {
        const session = await auth.api.getSession({
            headers: fromNodeHeaders(req.headers),
        });

        if (!session) {
            res.status(401).json({
                status: "error",
                code: "UNAUTHORIZED",
                message: "Authentication is required for uploads.",
            });
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
