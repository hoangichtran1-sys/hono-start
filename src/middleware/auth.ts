import { CustomJWTPayload } from "@/configs/jwt";
import { createMiddleware } from "hono/factory";
import type { JwtVariables } from "hono/jwt";

type AdditionalContext = {
    Variables: JwtVariables<CustomJWTPayload> & {
        userId: string;
        role?: "admin" | "user";
    };
};

export const authMiddleware = createMiddleware<AdditionalContext>(async (c, next) => {
    const payload = c.get("jwtPayload");
    const { userId, role } = payload;

    c.set("userId", userId);
    c.set("role", role);

    await next();
});
