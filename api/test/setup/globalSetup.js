const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const { Pool } = require("pg");

module.exports = async () => {
  dotenv.config({ path: path.join(process.cwd(), ".env.test") });
  process.env.NODE_ENV = "test";

  const url = process.env.DATABASE_URL_TEST;
  if (!url) throw new Error("Missing DATABASE_URL_TEST in .env.test");

  const pool = new Pool({ connectionString: url });

  const migrationsDir = path.join(process.cwd(), "db", "migrations");
  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  await pool.query(`
    create table if not exists jest_schema_migrations (
      id text primary key,
      applied_at timestamptz not null default now()
    );
  `);

  const { rows: cntRows } = await pool.query(`select count(*)::int as c from jest_schema_migrations`);
  const count = cntRows[0].c;

  // If migrations table is empty but schema already exists, baseline it.
  if (count === 0) {
    const { rows } = await pool.query(
      `select to_regclass('public.users') is not null as users_exists`
    );
    if (rows[0].users_exists) {
      for (const f of files) {
        await pool.query(
          `insert into jest_schema_migrations (id) values ($1) on conflict do nothing`,
          [f]
        );
      }
      await pool.end();
      return;
    }
  }

  // Normal mode: apply pending migrations
  for (const f of files) {
    const already = await pool.query(
      `select 1 from jest_schema_migrations where id = $1`,
      [f]
    );
    if (already.rowCount) continue;

    const sql = fs.readFileSync(path.join(migrationsDir, f), "utf8");

    await pool.query("begin");
    try {
      await pool.query(sql);
      await pool.query(
        `insert into jest_schema_migrations (id) values ($1) on conflict do nothing`,
        [f]
      );
      await pool.query("commit");
    } catch (e) {
      await pool.query("rollback");
      throw new Error(`Migration failed: ${f}\n${e.message || e}`);
    }
  }

  await pool.end();
};
