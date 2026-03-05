import "dotenv/config";
import { Pool } from "pg";

const connectionString =
  process.env.NODE_ENV === "test"
    ? process.env.DATABASE_URL_TEST
    : process.env.DATABASE_URL;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL missing");
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});
