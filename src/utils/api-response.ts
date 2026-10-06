import { StatusCodes } from "http-status-codes";
import { z, type ZodType } from "zod";

export class ApiResponse<T = null> {
    readonly success: boolean;
    readonly message: string;
    readonly data: T;
    readonly statusCode: number;

    private constructor(success: boolean, message: string, data: T, statusCode: number) {
        this.success = success;
        this.message = message;
        this.data = data;
        this.statusCode = statusCode;
    }

    toJSON() {
        return {
            success: this.success,
            message: this.message,
            data: this.data,
            statusCode: this.statusCode,
        };
    }

    static success<T>(message: string, data: T, statusCode: number = StatusCodes.OK) {
        return new ApiResponse(true, message, data, statusCode);
    }

    static failure<T>(message: string, data: T, statusCode: number = StatusCodes.BAD_REQUEST) {
        return new ApiResponse(false, message, data, statusCode);
    }
}

export const ApiResponseSchema = <T extends ZodType>(dataSchema: T) =>
    z.object({
        success: z.boolean(),
        message: z.string(),
        responseObject: dataSchema.optional(),
        statusCode: z.enum(StatusCodes),
    });
