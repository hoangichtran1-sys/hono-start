import { Hono } from "hono";
import { describeRoute } from "hono-openapi";
import { StatusCodes } from "http-status-codes";
import { ApiResponse } from "@/utils/api-response";
import z from "zod";
import { createApiResponse } from "@/utils/open-api-response-builders";

const healthRouter = new Hono().get(
    "/",
    describeRoute({
        description: "Check health",
        tags: ["Health"],
        responses: {
            ...createApiResponse(z.object({}), "Check health"),
        },
    }),
    (c) => {
        const apiresponse = ApiResponse.success("Service is healthy", {
            status: "healthy",
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
        });

        return c.json(apiresponse.toJSON(), StatusCodes.OK);
    },
);

export default healthRouter;
