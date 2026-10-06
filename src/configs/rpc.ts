import { hc } from "hono/client";
import { type AppType } from "@/app";
import { env } from "./env";

export const client = hc<AppType>(env.APP_URL);

async function test(){
    const data = await client.api.health.$get()

    const res = await data.json()
}