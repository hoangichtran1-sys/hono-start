import { Hono } from "hono";
import { cors } from "hono/cors";
import { csrf } from "hono/csrf";
import { logger } from "hono/logger";
import { openAPIRouteHandler } from "hono-openapi";
import { Scalar } from "@scalar/hono-api-reference";
import { methodNotAllowed } from "hono/method-not-allowed";
import { StatusCodes } from "http-status-codes";
import { timeout } from "hono/timeout";
import { HTTPException } from "hono/http-exception";
import { type ContentfulStatusCode } from "hono/utils/http-status";

import { env } from "@/configs/env";
import { ApiResponse } from "@/utils/api-response";
import { globalRateLimiter } from "@/middleware/rate-limiter";
import { timeoutException } from "@/middleware/timeout-handler";

import authRouter from "@/routers/auth";
import healthRouter from "@/routers/health";
import userRouter from "@/routers/user";

const app = new Hono();

app.use(csrf({ origin: env.CORS_ORIGIN }));
app.use(logger());

app.use(
    "/api",
    cors({
        origin: env.CORS_ORIGIN,
        credentials: true,
    }),
    globalRateLimiter,
    timeout(10000, timeoutException),
    methodNotAllowed({
        app,
        onMethodNotAllowed: (c, methods) => {
            const apiResponse = ApiResponse.failure(
                `Method Not Allowed: ${methods.join(", ")}`,
                null,
                StatusCodes.METHOD_NOT_ALLOWED,
            );

            return c.json(apiResponse, StatusCodes.METHOD_NOT_ALLOWED);
        },
    }),
);

app.get(
    "/openapi",
    openAPIRouteHandler(app, {
        documentation: {
            info: {
                title: "Hono Auth API",
                version: "1.0.0",
                description: "Auth API",
            },
            servers: [{ url: env.APP_URL, description: "Local server" }],
        },
    }),
);

app.get("/docs", Scalar({ url: "/openapi", theme: "laserwave", pageTitle: "Hono Auth API" }));

const routers = app
    .basePath("/api")
    .route("/auth", authRouter)
    .route("/user", userRouter)
    .route("/health", healthRouter);

app.notFound((c) => {
    const apiResponse = ApiResponse.failure(
        `Route ${c.req.method} ${c.req.url} not found`,
        null,
        StatusCodes.NOT_FOUND,
    );
    return c.json(apiResponse, StatusCodes.NOT_FOUND);
});

app.onError((err, c) => {
    if (err instanceof HTTPException) {
        const apiResponse = ApiResponse.failure(err.message, err.cause || null, err.status);

        return c.json(apiResponse, apiResponse.statusCode as ContentfulStatusCode);
    }

    return c.json(
        ApiResponse.failure("Something went wrong", null, StatusCodes.INTERNAL_SERVER_ERROR),
        StatusCodes.INTERNAL_SERVER_ERROR,
    );
});

export type AppType = typeof routers;

export default app;
