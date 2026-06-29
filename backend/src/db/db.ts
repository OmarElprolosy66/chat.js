import "dotenv/config";
import postgres from "postgres";
import * as schema from "./schema";
import { drizzle } from "drizzle-orm/postgres-js";

const pgClient = postgres(process.env.DATABASE_URL as string);
export const db = drizzle(pgClient, {
    schema,
    logger: process.env.NODE_ENV === 'development',
});