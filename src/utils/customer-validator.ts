import { validator } from "hono-openapi";
import type { ZodType } from "zod";
import type { ValidationTargets } from "hono";
import { HTTPException } from "hono/http-exception";

export const customerValidator = <T extends ZodType, Target extends keyof ValidationTargets>(
    target: Target,
    schema: T,
) => {
    return validator(target, schema, (result, _c) => {
        if (!result.success) {
            throw new HTTPException(400, {
                message: "Validation failed!",
                cause: result.error.map((err) => ({
                    field: err.path?.join("."),
                    message: err.message,
                })),
            });
        }
    });
};
