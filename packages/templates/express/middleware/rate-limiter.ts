import rateLimit from "express-rate-limit";
import { env } from "../env";

export const rateLimiter = rateLimit({
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: env.RATE_LIMIT_MAX,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: {
        status: "error",
        code: "RATE_LIMIT_EXCEEDED",
        message: "Too many requests, please try again later.",
    },
});
