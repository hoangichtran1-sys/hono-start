import { DataSource } from "typeorm";
import { env } from "@/configs/env";
import { User } from "@/entities/User";
import { RefreshToken } from "@/entities/RefreshToken";

export const AppDataSource = new DataSource({
    type: "postgres",
    host: env.PGHOST,
    port: env.PGPOST,
    username: env.PGUSER,
    password: env.PGPASSWORD,
    database: env.PGDATABASE,
    ssl: env.PGSSLMODE === "require",

    entities: [User, RefreshToken],
    migrations: ["src/migrations/*.ts"],
});

export const connectDB = async () => {
    try {
        await AppDataSource.initialize();
        console.log("Data Source has been initialized!");
    } catch (error) {
        console.error("Error during Data Source initialization", error);
    }
};
