import dotenv from 'dotenv';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
    out: './src/drizzle/migrations',
    schema: './src/db/schema.ts',
    dialect: 'postgresql',
    dbCredentials: {
        url: process.env.DATABASE_URL! as string,
    },
    verbose: true,
    strict: true,
});
