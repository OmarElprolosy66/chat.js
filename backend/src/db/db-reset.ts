import 'dotenv/config';
import postgres from 'postgres';

async function reset() {
    const url = process.env.DATABASE_URL;
    if (!url) {
        console.error('❌ No DATABASE_URL in .env');
        process.exit(1);
    }

    const sql = postgres(url, { max: 1 });

    try {
        await sql`DROP SCHEMA public CASCADE;`;
        await sql`CREATE SCHEMA public;`;

        await sql`DROP SCHEMA IF EXISTS drizzle CASCADE;`;
        await sql`CREATE SCHEMA drizzle;`;

        console.log('✅ Schemas reset.');
    } finally {
        await sql.end();
    }

    process.exit(0);
}

reset().catch((err) => {
  console.error('❌ `Reset failed:', err);
  process.exit(1);
});
