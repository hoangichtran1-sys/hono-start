import "reflect-metadata";
import fs from "fs";

import app from "@/app";
import { env } from "@/configs/env";
import { connectDB } from "@/configs/db";
import { logDir, logger } from "@/configs/logger";

if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

const start = async () => {
    // throw new Error("Something went wrong");
    await connectDB();

    Bun.serve({
        port: env.PORT,
        fetch: app.fetch,
    });
    logger.info(`Server (${env.NODE_ENV}) running on port http://${env.HOST}:${env.PORT}`);
};

start()
    .then(() => console.log(`Server (${env.NODE_ENV}) running on http://${env.HOST}:${env.PORT}`))
    .catch((error) => {
        console.log(error);
        process.exit(1);
    });
