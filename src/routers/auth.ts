import { z } from "zod";
import { Hono } from "hono";
import { setSignedCookie } from "hono/cookie";
import { HTTPException } from "hono/http-exception";
import { jwt, sign } from "hono/jwt";
import { describeRoute, resolver, validator } from "hono-openapi";
import { StatusCodes } from "http-status-codes";
import { addMinutes, getUnixTime } from "date-fns";

import { userRepository } from "@/repositories/user";
import { loginRequest, loginResponse, registerRequest, registerResponse } from "@/schemas/auth";
import { createApiResponse } from "@/utils/open-api-response-builders";
import { ApiResponse } from "@/utils/api-response";
import { env } from "@/configs/env";
import { CustomJWTPayload, jwtConfig } from "@/configs/jwt";
import { baseResponse, COOKIE_MAX_AGE, COOKIE_NAME } from "@/configs/constants";
import { refreshTokenRepository } from "@/repositories/refresh-token";

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
                ...createApiResponse(registerResponse, "Register success"),
                ...createApiResponse(
                    baseResponse.extend({ data: z.array(z.any()) }),
                    "Validation failed register body",
                    StatusCodes.BAD_REQUEST,
                ),
                ...createApiResponse(
                    baseResponse.extend({ data: z.null() }),
                    "User already exists",
                    StatusCodes.CONFLICT,
                ),
            },
        }),
        validator("json", registerRequest, (result, _c) => {
            if (!result.success) {
                throw new HTTPException(StatusCodes.BAD_REQUEST, {
                    message: "Validation failed register body",
                    cause: result.error,
                });
            }
        }),
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
                    baseResponse.extend({ data: z.array(z.any()) }),
                    "Validation failed login body",
                    StatusCodes.BAD_REQUEST,
                ),
                ...createApiResponse(
                    baseResponse.extend({ data: z.null() }),
                    "User not found",
                    StatusCodes.NOT_FOUND,
                ),
                ...createApiResponse(
                    baseResponse.extend({ data: z.null() }),
                    "Invalid credentials",
                    StatusCodes.UNAUTHORIZED,
                ),
            },
        }),
        validator("json", loginRequest, (result, _c) => {
            if (!result.success) {
                throw new HTTPException(StatusCodes.BAD_REQUEST, {
                    message: "Validation failed login body",
                    cause: result.error,
                });
            }
        }),
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
            const refreshToken = await refreshTokenRepository.create(user.id);

            const apiResponse = ApiResponse.success("Login successfully", {
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

            return c.json(apiResponse, StatusCodes.OK);
        },
    );

export default authRouter;
