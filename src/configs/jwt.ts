import { AlgorithmTypes } from "hono/jwt";
import { type VerifyOptions } from "hono/utils/jwt/jwt";
import { type JWTPayload } from "hono/utils/jwt/types";
import { env } from "@/configs/env";

interface JWTOptions {
    secret: string;
    alg: keyof typeof AlgorithmTypes;
    cookie?: string;
    headerName?: string;
    realm?: string;
    options?: VerifyOptions;
}

export interface CustomJWTPayload extends JWTPayload {
    userId: string;
    role?: "admin" | "user";
}

export const jwtConfig: JWTOptions = {
    secret: env.JWT_SECRET,
    alg: "HS256",
};
