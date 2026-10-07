import { nanoid } from "nanoid";
import { addDays, addMinutes } from "date-fns";
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

        return refreshToken;
    }

    async updateMany(userId: string) {
        return await this.refreshTokenRepository.update(
            { userId, revoked: false },
            { revoked: true, updatedAt: new Date() },
        );
    }

    async updateById(id: string, replacedBy: string) {
        return await this.refreshTokenRepository.update(id, {
            expiresAt: addMinutes(new Date(), 3),
            revoked: true,
            replacedBy,
        });
    }

    async getByToken(token: string) {
        return await this.refreshTokenRepository.findOneBy({ token });
    }
}

export const refreshTokenRepository = new RefreshTokenService(
    AppDataSource.getRepository(RefreshToken),
);
