import { Pool } from "pg";

const connectionString =
  process.env.NODE_ENV === "test"
    ? (process.env.DATABASE_URL_TEST || process.env.DATABASE_URL)
    : process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL missing (or DATABASE_URL_TEST when NODE_ENV=test)");
}

export const pool = new Pool({ connectionString });
