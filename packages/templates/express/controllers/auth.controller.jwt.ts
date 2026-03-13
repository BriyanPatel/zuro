import { createHash, randomUUID } from "node:crypto";
import type { Request, Response } from "express";
import { and, eq, gt, isNull } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db } from "../db/index";
import { refreshToken, user } from "../db/schema/auth";
import {
    BadRequestError,
    ConflictError,
    UnauthorizedError,
} from "../lib/errors";
import {
    getTokenExpiryDate,
    signAuthToken,
    verifyAuthToken,
} from "../lib/auth";

function getString(input: unknown, fieldName: string): string {
    if (typeof input !== "string") {
        throw new BadRequestError(`${fieldName} is required`);
    }

    const value = input.trim();
    if (!value) {
        throw new BadRequestError(`${fieldName} is required`);
    }

    return value;
}

function toPublicUser(row: { id: string; email: string; name: string | null }) {
    return {
        id: row.id,
        email: row.email,
        name: row.name,
    };
}

function hashToken(rawToken: string) {
    return createHash("sha256").update(rawToken).digest("hex");
}

async function issueTokens(currentUser: { id: string; email: string; name: string | null }) {
    const tokenPayload = {
        sub: currentUser.id,
        email: currentUser.email,
        name: currentUser.name,
    };

    const accessToken = signAuthToken(tokenPayload, "access");
    const refreshTokenValue = signAuthToken(tokenPayload, "refresh");

    await db.insert(refreshToken).values({
        id: randomUUID(),
        userId: currentUser.id,
        tokenHash: hashToken(refreshTokenValue),
        expiresAt: getTokenExpiryDate("refresh"),
        revokedAt: null,
        createdAt: new Date(),
    });

    return {
        accessToken,
        refreshToken: refreshTokenValue,
        tokenType: "Bearer" as const,
    };
}

export const AuthController = {
    async signUpEmail(req: Request, res: Response) {
        const email = getString(req.body?.email, "Email").toLowerCase();
        const password = getString(req.body?.password, "Password");
        const name = typeof req.body?.name === "string" ? req.body.name.trim() || null : null;

        if (password.length < 8) {
            throw new BadRequestError("Password must be at least 8 characters long");
        }

        const existingUsers = await db
            .select({ id: user.id })
            .from(user)
            .where(eq(user.email, email))
            .limit(1);

        if (existingUsers.length > 0) {
            throw new ConflictError("Email already registered");
        }

        const createdUser = {
            id: randomUUID(),
            email,
            name,
            passwordHash: await bcrypt.hash(password, 10),
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        await db.insert(user).values(createdUser);
        const tokens = await issueTokens(createdUser);

        return res.json({
            user: toPublicUser(createdUser),
            ...tokens,
        });
    },

    async signInEmail(req: Request, res: Response) {
        const email = getString(req.body?.email, "Email").toLowerCase();
        const password = getString(req.body?.password, "Password");

        const users = await db
            .select({
                id: user.id,
                email: user.email,
                name: user.name,
                passwordHash: user.passwordHash,
            })
            .from(user)
            .where(eq(user.email, email))
            .limit(1);

        const existingUser = users[0];
        if (!existingUser) {
            throw new UnauthorizedError("Invalid credentials");
        }

        const passwordMatches = await bcrypt.compare(password, existingUser.passwordHash);
        if (!passwordMatches) {
            throw new UnauthorizedError("Invalid credentials");
        }

        const tokens = await issueTokens(existingUser);

        return res.json({
            user: toPublicUser(existingUser),
            ...tokens,
        });
    },

    async signOut(req: Request, res: Response) {
        const bodyRefreshToken =
            typeof req.body?.refreshToken === "string"
                ? req.body.refreshToken.trim()
                : "";

        if (bodyRefreshToken) {
            await db
                .update(refreshToken)
                .set({ revokedAt: new Date() })
                .where(eq(refreshToken.tokenHash, hashToken(bodyRefreshToken)));
        }

        return res.json({ success: true });
    },

    async getSession(req: Request, res: Response) {
        const accessToken = getBearerToken(req.headers.authorization);
        if (!accessToken) {
            return res.json({ user: null });
        }

        try {
            const payload = verifyAuthToken(accessToken, "access");
            const users = await db
                .select({ id: user.id, email: user.email, name: user.name })
                .from(user)
                .where(eq(user.id, payload.sub))
                .limit(1);

            const existingUser = users[0];
            return res.json({ user: existingUser ? toPublicUser(existingUser) : null });
        } catch {
            return res.json({ user: null });
        }
    },

    async refreshToken(req: Request, res: Response) {
        const rawRefreshToken = getString(req.body?.refreshToken, "Refresh token");
        const payload = verifyAuthToken(rawRefreshToken, "refresh");
        const tokenHash = hashToken(rawRefreshToken);

        const activeTokens = await db
            .select({ userId: refreshToken.userId })
            .from(refreshToken)
            .where(and(
                eq(refreshToken.tokenHash, tokenHash),
                isNull(refreshToken.revokedAt),
                gt(refreshToken.expiresAt, new Date())
            ))
            .limit(1);

        if (activeTokens.length === 0 || activeTokens[0].userId !== payload.sub) {
            throw new UnauthorizedError("Invalid refresh token");
        }

        await db
            .update(refreshToken)
            .set({ revokedAt: new Date() })
            .where(eq(refreshToken.tokenHash, tokenHash));

        const users = await db
            .select({ id: user.id, email: user.email, name: user.name })
            .from(user)
            .where(eq(user.id, payload.sub))
            .limit(1);

        const existingUser = users[0];
        if (!existingUser) {
            throw new UnauthorizedError("Invalid refresh token");
        }

        const tokens = await issueTokens(existingUser);
        return res.json(tokens);
    },
};
