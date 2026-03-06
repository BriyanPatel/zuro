import type { NextFunction, Request, Response } from "express";

export const uploadAuth = (_req: Request, _res: Response, next: NextFunction) => {
    next();
};

export function getUploadUserId(_req: Request & { uploadUser?: { id: string } | null }) {
    return null;
}
