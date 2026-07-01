import "dotenv/config";
import postgres from "postgres";
import * as schema from "./schema";
import { drizzle } from "drizzle-orm/postgres-js";

const pgClient = postgres(process.env.DATABASE_URL as string);
export const db = drizzle(pgClient, {
    schema,
    logger: process.env.NODE_ENV === 'development',
});

// Auto-run schema check to add the blocked_by column if it's missing in production
pgClient.unsafe(`
    ALTER TABLE "contacts" 
    ADD COLUMN IF NOT EXISTS "blocked_by" uuid REFERENCES "users"("id") ON DELETE cascade ON UPDATE cascade;
`).then(() => {
    // Silent success in production, log in development
    if (process.env.NODE_ENV === 'development') {
        console.log('Database schema check: "blocked_by" column verified.');
    }
}).catch((err) => {
    console.error('Failed to run startup database schema check:', err);
});