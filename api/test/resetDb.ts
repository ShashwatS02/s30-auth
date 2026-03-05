// test/resetDb.ts
import { pool } from "../src/db";

export async function resetDb() {
  // sessions references users, so truncate both with cascade
  await pool.query("TRUNCATE TABLE sessions, users CASCADE");
}
