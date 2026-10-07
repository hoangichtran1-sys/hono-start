import { baseResponse } from "@/configs/constants";
import { z } from "zod";

export const registerRequest = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.email("Please enter a valid email address"),
    password: z
        .string()
        .min(6, "Password too short")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter"),
});

export const loginRequest = z.object({
    email: z.email("Please enter a valid email address"),
    password: z
        .string()
        .min(6, "Password too short")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter"),
});

export const loginResponse = baseResponse
    .extend({
        data: z.object({
            accessToken: z.string(),
            exp: z.union([z.string(), z.number().int()]),
        }),
        statusCode: z.number().int().positive().default(200),
    })
    .meta({
        ref: "AuthResponse",
    });
export const registerResponse = loginResponse.extend({
    statusCode: z.number().int().positive().default(201),
});
export const refreshTokenResponse = loginResponse;
