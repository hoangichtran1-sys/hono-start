import { nanoid } from "nanoid";
import { addDays } from "date-fns";
import { type Repository } from "typeorm";
import { AppDataSource } from "@/configs/db";
import { RefreshToken } from "@/entities/RefreshToken";

class RefreshTokenService {
    constructor(private readonly refreshTokenRepository: Repository<RefreshToken>) {}

    async create(userId: string) {
        const refreshToken = this.refreshTokenRepository.create({
            userId,
            token: nanoid(),
            expiresAt: addDays(new Date(), 7),
        });

        await this.refreshTokenRepository.save(refreshToken);

        return refreshToken.token;
    }
}

export const refreshTokenRepository = new RefreshTokenService(
    AppDataSource.getRepository(RefreshToken),
);
