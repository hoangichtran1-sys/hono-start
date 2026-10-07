import { Hono } from "hono";
import { z } from "zod";
import { jwt } from "hono/jwt";
import { HTTPException } from "hono/http-exception";
import { describeRoute } from "hono-openapi";
import type { UploadApiResponse, UploadApiErrorResponse } from "cloudinary";
import cloudinary from "@/configs/cloudinary";
import { jwtConfig } from "@/configs/jwt";
import { authMiddleware } from "@/middleware/auth";
import { userRepository } from "@/repositories/user";
import { ApiResponse } from "@/utils/api-response";
import { StatusCodes } from "http-status-codes";
import { userDTO, userResponse } from "@/schemas/user";
import { createApiResponse } from "@/utils/open-api-response-builders";
import { customerValidator } from "@/utils/customer-validator";
import { normalErrorResponse, validationErrorResponse } from "@/schemas/error";

const userRouter = new Hono()
    .use(jwt(jwtConfig))
    .get(
        "/current",
        describeRoute({
            description: "Get current user",
            tags: ["User"],
            responses: {
                ...createApiResponse(userResponse, "Get current"),
                ...createApiResponse(normalErrorResponse, "User not found", StatusCodes.NOT_FOUND),
            },
        }),
        authMiddleware,
        async (c) => {
            const userId = c.get("userId");
            const user = await userRepository.findById(userId);
            console.log(user);

            if (!user) {
                throw new HTTPException(StatusCodes.NOT_FOUND, { message: "User not found" });
            }

            const userParse = await userDTO.parseAsync(user);

            const apiResponse = ApiResponse.success("Get current user", userParse);

            return c.json(apiResponse, StatusCodes.OK);
        },
    )
    .get(
        "/",
        describeRoute({
            description: "Get all user",
            tags: ["User"],
            responses: {
                ...createApiResponse(z.array(userResponse), "Get all user"),
                ...createApiResponse(normalErrorResponse, "Forbidden", StatusCodes.FORBIDDEN),
            },
        }),
        authMiddleware,
        async (c) => {
            const role = c.get("role");

            if (role !== "admin") {
                throw new HTTPException(403, { message: "Forbidden" });
            }
            const users = await userRepository.findAll();
            const usersParse = await Promise.all(
                users.map((user) => {
                    return userDTO.parseAsync(user);
                }),
            );

            const apiResponse = ApiResponse.success("Get all user", usersParse);

            return c.json(apiResponse, StatusCodes.OK);
        },
    )
    .get(
        "/:slug",
        describeRoute({
            description: "Get user by slug",
            tags: ["User"],
            responses: {
                ...createApiResponse(userResponse, "Get user by slug"),
                ...createApiResponse(normalErrorResponse, "User not found", StatusCodes.NOT_FOUND),
                ...createApiResponse(
                    validationErrorResponse,
                    "Validation failed",
                    StatusCodes.BAD_REQUEST,
                ),
            },
        }),
        customerValidator("param", z.object({ slug: z.string().min(1) })),
        authMiddleware,
        async (c) => {
            const { slug } = c.req.valid("param");

            const user = await userRepository.findBySlug(slug);

            if (!user) {
                throw new HTTPException(StatusCodes.NOT_FOUND, { message: "User not found" });
            }

            const userParse = await userDTO.parseAsync(user);

            const apiResponse = ApiResponse.success("Get user by slug", userParse);

            return c.json(apiResponse, StatusCodes.OK);
        },
    )
    .post(
        "/upload-avatar",
        describeRoute({
            description: "Upload avatar user",
            tags: ["User"],
            responses: {
                ...createApiResponse(userResponse, "Upload avatar user"),
                ...createApiResponse(
                    validationErrorResponse,
                    "Validation failed",
                    StatusCodes.BAD_REQUEST,
                ),
                ...createApiResponse(
                    normalErrorResponse,
                    "Failed to upload file",
                    StatusCodes.BAD_REQUEST,
                ),
            },
        }),
        customerValidator(
            "form",
            z.object({
                file: z
                    .instanceof(File)
                    .refine((file) => file.size <= 5 * 1024 * 1024, "Max file size 5MB")
                    .refine((file) => file.type.startsWith("image/"), "Type image is required"),
            }),
        ),
        authMiddleware,
        async (c) => {
            const { file } = c.req.valid("form");
            const userId = c.get("userId");

            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            const uploadResult = await new Promise<UploadApiResponse>((resolve, reject) => {
                cloudinary.uploader
                    .upload_stream(
                        { folder: "billboards" },
                        (
                            error: UploadApiErrorResponse | undefined,
                            result: UploadApiResponse | undefined,
                        ) => {
                            if (error) reject(error);
                            if (!result)
                                return reject(
                                    new HTTPException(StatusCodes.BAD_REQUEST, {
                                        message: "Failed to upload file",
                                    }),
                                );
                            resolve(result);
                        },
                    )
                    .end(buffer);
            });

            const result = await userRepository.uploadAvatar(userId, uploadResult.secure_url);

            const userParse = await userDTO.parseAsync(result);

            const apiResponse = ApiResponse.success("Upload avatar user", userParse);

            return c.json(apiResponse, StatusCodes.OK);
        },
    )
    .delete(
        "/:id",
        describeRoute({
            description: "Delete user",
            tags: ["User"],
            responses: {
                ...createApiResponse(z.null(), "Delete user", StatusCodes.NO_CONTENT),
                ...createApiResponse(normalErrorResponse, "Forbidden", StatusCodes.FORBIDDEN),
                ...createApiResponse(
                    validationErrorResponse,
                    "Validation failed",
                    StatusCodes.BAD_REQUEST,
                ),
            },
        }),
        customerValidator("param", z.object({ id: z.string().min(1) })),
        authMiddleware,
        async (c) => {
            const role = c.get("role");
            const { id } = c.req.valid("param");

            if (role !== "admin") {
                throw new HTTPException(403, { message: "Forbidden" });
            }

            await userRepository.delete(id);

            return c.status(204);
        },
    );

export default userRouter;
