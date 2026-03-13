import jwt, { type JwtPayload, type SignOptions } from "jsonwebtoken";
import { UnauthorizedError } from "./errors";
import { env } from "../env";

export type AuthTokenType = "access" | "refresh";

export interface AuthJwtPayload extends JwtPayload {
    sub: string;
    email: string;
    name: string | null;
    type: AuthTokenType;
}

const DEFAULT_EXPIRES_IN: Record<AuthTokenType, string> = {
    access: "15m",
    refresh: "7d",
};

function getTokenSecret(type: AuthTokenType) {
    return type === "access" ? env.JWT_ACCESS_SECRET : env.JWT_REFRESH_SECRET;
}

function getExpiresIn(type: AuthTokenType) {
    return type === "access"
        ? env.JWT_ACCESS_EXPIRES_IN
        : env.JWT_REFRESH_EXPIRES_IN;
}

function parseDurationToMs(value: string): number {
    const match = /^(\d+)([smhd])$/.exec(value.trim());
    if (!match) {
        return 0;
    }

    const amount = Number(match[1]);
    const unit = match[2];

    switch (unit) {
        case "s":
            return amount * 1000;
        case "m":
            return amount * 60_000;
        case "h":
            return amount * 3_600_000;
        case "d":
            return amount * 86_400_000;
        default:
            return 0;
    }
}

export function getTokenExpiryDate(type: AuthTokenType) {
    const rawValue = getExpiresIn(type) || DEFAULT_EXPIRES_IN[type];
    const durationMs = parseDurationToMs(rawValue);

    if (!durationMs) {
        return new Date(Date.now() + parseDurationToMs(DEFAULT_EXPIRES_IN[type]));
    }

    return new Date(Date.now() + durationMs);
}

export function signAuthToken(payload: Omit<AuthJwtPayload, "type">, type: AuthTokenType) {
    const expiresIn = (getExpiresIn(type) || DEFAULT_EXPIRES_IN[type]) as SignOptions["expiresIn"];
    const options: SignOptions = {
        expiresIn,
    };

    return jwt.sign(
        {
            sub: payload.sub,
            email: payload.email,
            name: payload.name,
            type,
        },
        getTokenSecret(type),
        options
    );
}

export function verifyAuthToken(token: string, expectedType: AuthTokenType): AuthJwtPayload {
    try {
        const payload = jwt.verify(token, getTokenSecret(expectedType)) as AuthJwtPayload;

        if (payload.type !== expectedType) {
            throw new UnauthorizedError("Invalid token type");
        }

        return payload;
    } catch {
        throw new UnauthorizedError("Invalid or expired token");
    }
}

export function getBearerToken(authorizationHeader: string | undefined) {
    if (!authorizationHeader) {
        return null;
    }

    const [scheme, token] = authorizationHeader.split(" ");
    if (!scheme || !token || scheme.toLowerCase() !== "bearer") {
        return null;
    }

    return token.trim();
}
