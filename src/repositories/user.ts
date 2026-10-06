import { nanoid } from "nanoid";
import { type Repository } from "typeorm";
import { AppDataSource } from "@/configs/db";
import { User } from "@/entities/User";
import { addDays } from "date-fns";

class UserService {
    constructor(private readonly userRepository: Repository<User>) {}

    async findByEmail(email: string) {
        const user = await this.userRepository.findOneBy({ email });
        return user;
    }

    async findAll() {
        const users = await this.userRepository.find();
        return users;
    }

    async create(body: Pick<User, "email" | "name" | "password">) {
        const hashPassword = await Bun.password.hash(body.password);

        const refreshToken = nanoid();
        const newUser = this.userRepository.create({
            name: body.name,
            email: body.email,
            password: hashPassword,
            refreshTokens: [{ token: refreshToken, expiresAt: addDays(new Date(), 7) }],
        });

        await this.userRepository.save(newUser);

        return { newUser, refreshToken };
    }
}

export const userRepository = new UserService(AppDataSource.getRepository(User));
