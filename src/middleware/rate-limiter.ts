import { rateLimiter } from "hono-rate-limiter";
import { ApiResponse } from "@/utils/api-response";
import { StatusCodes } from "http-status-codes";

export const globalRateLimiter = rateLimiter({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    keyGenerator: (c) => c.req.header("x-forwarded-for") ?? "",
    message: ApiResponse.failure(
        "Too many requests from this IP, please try again after 15 minutes.",
        null,
        StatusCodes.TOO_MANY_REQUESTS,
    ).toJSON(),
});

export const loginLimiter = rateLimiter({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    keyGenerator: (c) => c.req.header("x-forwarded-for") ?? "",
    message: ApiResponse.failure(
        "Too many login attempts, please try again later.",
        null,
        StatusCodes.TOO_MANY_REQUESTS,
    ).toJSON(),
});

export const registerLimiter = rateLimiter({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    keyGenerator: (c) => c.req.header("x-forwarded-for") ?? "",
    message: ApiResponse.failure(
        "Too many registration attempts, please try again later.",
        null,
        StatusCodes.TOO_MANY_REQUESTS,
    ).toJSON(),
});
