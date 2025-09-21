import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';

// Load environment variables from .env.local
config({ path: '.env.local' });

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('DATABASE_URL is not set. Aborting.');
  process.exit(1);
}

const sqlFile = join(process.cwd(), 'sql', 'schema.sql');
const statements = readFileSync(sqlFile, 'utf8');

async function main() {
  const sql = neon(databaseUrl);
  await sql(statements);
  console.log('Database schema applied successfully.');
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});


