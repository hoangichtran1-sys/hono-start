import { z } from "zod";
import { baseResponse } from "@/configs/constants";

export const userDTO = z.object({
    name: z.string(),
    email: z.email(),
    emailVerifiedAt: z.string().nullable(),
    avatarUrl: z.string().nullable(),
    isAdmin: z.boolean(),
});

export const userResponse = baseResponse
    .extend({
        data: z.object({
            name: z.string(),
            email: z.email(),
            emailVerifiedAt: z.string().nullable(),
            avatarUrl: z.string().nullable(),
            isAdmin: z.boolean(),
        }),
    })
    .meta({
        ref: "UserResponse",
    });
