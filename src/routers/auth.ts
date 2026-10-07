import { z } from "zod";
import { Hono } from "hono";
import { setSignedCookie, getSignedCookie, deleteCookie } from "hono/cookie";
import { HTTPException } from "hono/http-exception";
import { jwt, sign } from "hono/jwt";
import { describeRoute, resolver } from "hono-openapi";
import { StatusCodes } from "http-status-codes";
import { addMinutes, getUnixTime, isAfter } from "date-fns";

import { userRepository } from "@/repositories/user";
import {
    loginRequest,
    loginResponse,
    refreshTokenResponse,
    registerRequest,
    registerResponse,
} from "@/schemas/auth";
import { createApiResponse } from "@/utils/open-api-response-builders";
import { ApiResponse } from "@/utils/api-response";
import { env } from "@/configs/env";
import { CustomJWTPayload, jwtConfig } from "@/configs/jwt";
import { COOKIE_MAX_AGE, COOKIE_NAME } from "@/configs/constants";
import { refreshTokenRepository } from "@/repositories/refresh-token";
import { customerValidator } from "@/utils/customer-validator";
import { authMiddleware } from "@/middleware/auth";
import { normalErrorResponse, validationErrorResponse } from "@/schemas/error";

const authRouter = new Hono()
    .post(
        "/register",
        describeRoute({
            description: "User register",
            tags: ["Auth"],
            requestBody: {
                content: {
                    "application/json": {
                        schema: resolver(registerRequest),
                    },
                },
            },
            responses: {
                ...createApiResponse(registerResponse, "Register success", StatusCodes.CREATED),
                ...createApiResponse(
                    validationErrorResponse,
                    "Validation failed register body",
                    StatusCodes.BAD_REQUEST,
                ),
                ...createApiResponse(
                    normalErrorResponse,
                    "User already exists",
                    StatusCodes.CONFLICT,
                ),
            },
        }),
        customerValidator("json", registerRequest),
        async (c) => {
            const body = c.req.valid("json");

            const existingUser = await userRepository.findByEmail(body.email);

            if (existingUser) {
                throw new HTTPException(StatusCodes.CONFLICT, { message: "User already exists" });
            }

            const { newUser, refreshToken } = await userRepository.create(body);

            const exp = getUnixTime(addMinutes(new Date(), 15));

            const payload: CustomJWTPayload = {
                userId: newUser.id,
                role: newUser.isAdmin ? "admin" : "user",
                exp,
            };
            const accessToken = await sign(payload, env.JWT_SECRET, "HS256");

            const apiResponse = ApiResponse.success("Register successfully", {
                accessToken,
                exp,
            });

            await setSignedCookie(c, COOKIE_NAME, refreshToken, env.COOKIE_SECRET, {
                httpOnly: true,
                maxAge: COOKIE_MAX_AGE,
                path: "/",
                secure: env.NODE_ENV === "production",
                domain: env.HOST,
            });

            return c.json(apiResponse, StatusCodes.CREATED);
        },
    )
    .post(
        "/login",
        describeRoute({
            description: "User login",
            tags: ["Auth"],
            requestBody: {
                content: {
                    "application/json": {
                        schema: resolver(loginRequest),
                    },
                },
            },
            responses: {
                ...createApiResponse(loginResponse, "Login success"),
                ...createApiResponse(
                    validationErrorResponse,
                    "Validation failed login body",
                    StatusCodes.BAD_REQUEST,
                ),
                ...createApiResponse(normalErrorResponse, "User not found", StatusCodes.NOT_FOUND),
                ...createApiResponse(
                    normalErrorResponse,
                    "Invalid credentials",
                    StatusCodes.UNAUTHORIZED,
                ),
            },
        }),
        customerValidator("json", loginRequest),
        async (c) => {
            const { email, password } = c.req.valid("json");

            const user = await userRepository.findByEmail(email);

            if (!user) {
                throw new HTTPException(StatusCodes.NOT_FOUND, { message: "User not found" });
            }

            const isValidPassword = await Bun.password.verify(password, user.password);

            if (!isValidPassword) {
                throw new HTTPException(StatusCodes.UNAUTHORIZED, {
                    message: "Invalid credentials",
                });
            }

            const exp = getUnixTime(addMinutes(new Date(), 15));

            const payload: CustomJWTPayload = {
                userId: user.id,
                role: user.isAdmin ? "admin" : "user",
                exp,
            };
            const accessToken = await sign(payload, env.JWT_SECRET, "HS256");
            const { token } = await refreshTokenRepository.create(user.id);

            const apiResponse = ApiResponse.success("Login successfully", {
                accessToken,
                exp,
            });

            await setSignedCookie(c, COOKIE_NAME, token, env.COOKIE_SECRET, {
                httpOnly: true,
                maxAge: COOKIE_MAX_AGE,
                path: "/",
                secure: env.NODE_ENV === "production",
                domain: env.HOST,
            });

            return c.json(apiResponse, StatusCodes.OK);
        },
    )

    .post(
        "/logout",
        describeRoute({
            description: "User logout",
            tags: ["Auth"],
            responses: createApiResponse(z.null(), "Logout success", StatusCodes.NO_CONTENT),
        }),
        jwt(jwtConfig),
        authMiddleware,
        async (c) => {
            const userId = c.get("userId");
            await refreshTokenRepository.updateMany(userId);

            deleteCookie(c, COOKIE_NAME, {
                httpOnly: true,
                path: "/",
                domain: env.HOST,
            });

            return c.status(StatusCodes.NO_CONTENT);
        },
    )
    .get(
        "/refresh-token",
        describeRoute({
            description: "Refresh token",
            tags: ["Auth"],
            responses: {
                ...createApiResponse(refreshTokenResponse, "Refresh token success"),
                ...createApiResponse(
                    normalErrorResponse,
                    "Missing refresh token",
                    StatusCodes.UNAUTHORIZED,
                ),
                ...createApiResponse(
                    normalErrorResponse,
                    "Refresh token has expired or is revoke",
                    StatusCodes.UNAUTHORIZED,
                ),
                ...createApiResponse(
                    normalErrorResponse,
                    "Refresh token data not found",
                    StatusCodes.BAD_REQUEST,
                ),
            },
        }),
        async (c) => {
            const now = new Date();
            const refreshToken = await getSignedCookie(c, env.COOKIE_SECRET, COOKIE_NAME);

            if (!refreshToken) {
                throw new HTTPException(StatusCodes.UNAUTHORIZED, {
                    message: "Missing refresh token",
                });
            }

            const refreshData = await refreshTokenRepository.getByToken(refreshToken);

            if (!refreshData) {
                throw new HTTPException(StatusCodes.BAD_REQUEST, {
                    message: "Refresh token data not found",
                });
            }

            if (refreshData.revoked || isAfter(now, refreshData.expiresAt)) {
                throw new HTTPException(StatusCodes.UNAUTHORIZED, {
                    message: "Refresh token has expired or is revoke",
                });
            }

            const { id, token, user } = await refreshTokenRepository.create(refreshData.userId);

            await refreshTokenRepository.updateById(refreshData.id, id);

            const exp = getUnixTime(addMinutes(new Date(), 15));

            const payload: CustomJWTPayload = {
                userId: user.id,
                role: user.isAdmin ? "admin" : "user",
                exp,
            };
            const accessToken = await sign(payload, env.JWT_SECRET, "HS256");

            const apiResponse = ApiResponse.success("Refresh token successfully", {
                accessToken,
                exp,
            });

            await setSignedCookie(c, COOKIE_NAME, token, env.COOKIE_SECRET, {
                httpOnly: true,
                maxAge: COOKIE_MAX_AGE,
                path: "/",
                secure: env.NODE_ENV === "production",
                domain: env.HOST,
            });

            return c.json(apiResponse, StatusCodes.OK);
        },
    );

export default authRouter;
