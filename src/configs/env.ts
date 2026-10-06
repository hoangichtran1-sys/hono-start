import { z } from "zod";

const envSchema = z.object({
    NODE_ENV: z.enum(["development", "production", "test"]).default("production"),

    HOST: z.string().min(1).default("localhost"),

    PORT: z.coerce.number().int().positive().default(8080),

    APP_URL: z.url().default("http://localhost:8080"),

    COOKIE_SECRET: z.string().min(6),

    CORS_ORIGIN: z.url().default("http://localhost:8080"),

    DATABASE_URL: z.string().min(1),

    JWT_SECRET: z.string().min(10),

    PGHOST: z.string().min(1),
    PGPOST: z.coerce.number().int().positive().default(5432),
    PGDATABASE: z.string().min(1),
    PGUSER: z.string().min(1),
    PGPASSWORD: z.string().min(1),
    PGSSLMODE: z.union([z.literal("require"), z.literal("not_require")]),
    PGCHANNELBINDING: z.string().min(1),

    EMAIL_ADMIN: z.email(),

    CLOUDINARY_CLOUD_NAME: z.string().min(1),
    CLOUDINARY_API_KEY: z.string().min(1),
    CLOUDINARY_API_SECRET: z.string().min(1),
});

const parsedEnv = envSchema.safeParse(Bun.env);

if (!parsedEnv.success) {
    console.error("❌ Invalid environment variables:", parsedEnv.error.format());
    throw new Error("Invalid environment variables");
}

export const env = {
    ...parsedEnv.data,
    isDevelopment: parsedEnv.data.NODE_ENV === "development",
    isProduction: parsedEnv.data.NODE_ENV === "production",
    isTest: parsedEnv.data.NODE_ENV === "test",
};
