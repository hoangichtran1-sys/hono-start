import { z } from "zod";
import { baseResponse } from "@/configs/constants";

export const normalErrorResponse = baseResponse
    .extend({
        data: z.null(),
    })
    .meta({
        ref: "NormalErrorResponse",
    });

export const validationErrorResponse = baseResponse
    .extend({
        data: z.array(z.object({ field: z.string().optional(), message: z.string() })),
    })
    .meta({
        ref: "ValidationErrorResponse",
    });
