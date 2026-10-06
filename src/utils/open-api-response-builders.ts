import { StatusCodes } from "http-status-codes";
import { type ZodType } from "zod";
import { resolver } from "hono-openapi";

export function createApiResponse(
    schema: ZodType,
    description: string,
    statusCode = StatusCodes.OK,
) {
    return {
        [statusCode]: {
            description,
            content: {
                "application/json": {
                    schema: resolver(schema),
                },
            },
        },
    };
}
