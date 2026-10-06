import { StatusCodes } from "http-status-codes";
import { HTTPException } from "hono/http-exception";
import type { HTTPExceptionFunction } from "hono/timeout";

export const timeoutException: HTTPExceptionFunction = () =>
    new HTTPException(StatusCodes.REQUEST_TIMEOUT, {
        message: "Request timeout after waiting 10 seconds. Please try again later.",
    });
