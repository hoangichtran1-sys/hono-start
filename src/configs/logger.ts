import path from "path";
import { pino } from "pino";

export const logDir = path.join(process.cwd(), "src/storages/log");

export const logger = pino({
    name: "server start",
    level: "info",
    transport: {
        targets: [
            {
                target: "pino-pretty",
                options: { colorize: true },
            },
            {
                target: "pino/file",
                options: {
                    destination: path.join(
                        logDir,
                        `hono-${new Date().toISOString().split("T")[0]}.log`,
                    ),
                    mkdir: true,
                    sync: false,
                },
            },
        ],
    },
});
