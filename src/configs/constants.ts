import { z } from "zod";

export const COOKIE_NAME = "hono-auth";
export const COOKIE_MAX_AGE = 7 * 24 * 60 * 60;
export const baseResponse = z.object({
    success: z.boolean().default(true),
    message: z.string(),
    // statusCode: z.number().int().positive(),
});
