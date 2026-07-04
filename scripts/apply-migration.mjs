import { readFileSync } from 'node:fs';
import pg from 'pg';

const sql = readFileSync(new URL('../supabase/migrations/0001_init.sql', import.meta.url), 'utf8');
const connectionString = process.env.SUPABASE_DB_URL;
if (!connectionString) {
  console.error('SUPABASE_DB_URL not set');
  process.exit(1);
}
const client = new pg.Client({ connectionString, ssl: { rejectUnauthorized: false } });
try {
  await client.connect();
  await client.query(sql);
  console.log('MIGRATION_APPLIED_OK');
} catch (e) {
  console.error('MIGRATION_ERROR:', e.message);
  process.exit(2);
} finally {
  await client.end().catch(() => {});
}
