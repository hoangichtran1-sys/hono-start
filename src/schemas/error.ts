import { z } from "zod";
import { baseResponse } from "@/configs/constants";

export const normalErrorResponse = baseResponse
    .extend({
        success: z.boolean().default(false),
        data: z.null(),
    })
    .meta({
        ref: "NormalErrorResponse",
    });

export const validationErrorResponse = baseResponse
    .extend({
        success: z.boolean().default(false),
        data: z.array(z.object({ field: z.string().optional(), message: z.string() })),
        statusCode: z.number().int().positive().default(400),
    })
    .meta({
        ref: "ValidationErrorResponse",
    });
export const JWTErrorResponse = baseResponse
    .extend({
        success: z.boolean().default(false),
        data: z.object({ name: z.string() }),
        statusCode: z.number().int().positive().default(401),
    })
    .meta({
        ref: "JWTErrorErrorResponse",
    });
