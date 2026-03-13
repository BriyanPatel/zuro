import type { Request, Response } from "express";
import { eq } from "drizzle-orm";
import { db } from "../db/index";
import { user } from "../db/schema/auth";
import { UnauthorizedError } from "../lib/errors";
import { getBearerToken, verifyAuthToken } from "../lib/auth";

export const UserController = {
    async getProfile(req: Request, res: Response) {
        const token = getBearerToken(req.headers.authorization);
        if (!token) {
            throw new UnauthorizedError("Not authenticated");
        }

        const payload = verifyAuthToken(token, "access");
        const users = await db
            .select({ id: user.id, email: user.email, name: user.name })
            .from(user)
            .where(eq(user.id, payload.sub))
            .limit(1);

        const existingUser = users[0];
        if (!existingUser) {
            throw new UnauthorizedError("Not authenticated");
        }

        return res.json({ user: existingUser });
    },
};
