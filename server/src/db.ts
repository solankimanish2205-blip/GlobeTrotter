import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
});

export async function checkDatabase() {
  const result = await pool.query('SELECT NOW() AS now');
  return result.rows[0];
}

export async function closeDatabase() {
  await pool.end();
}
