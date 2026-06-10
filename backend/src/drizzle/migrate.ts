import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

const migrateClient = postgres(process.env.DATABASE_URL! as string, { max: 1, });
migrate(drizzle(migrateClient), {
    migrationsFolder: './src/drizzle/migrations',
    migrationsTable: 'drizzle_migrations',
}).then(() => {
    console.log('Database migration completed successfully.');
}).catch((error) => {
    console.error('Database migration failed:', error);
}).finally(() => {
    migrateClient.end();
});