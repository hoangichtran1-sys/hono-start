import { Hono } from "hono";
import { StatusCodes } from "http-status-codes";
import { ApiResponse } from "@/utils/api-response";

const healthRouter = new Hono().get("/", (c) => {
    const apiresponse = ApiResponse.success("Service is healthy", {
        status: "healthy",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    });

    return c.json(apiresponse.toJSON(), StatusCodes.OK);
});

export default healthRouter;
