import express from "express";
import { pool } from "./db";
import bcrypt from "bcrypt";
import { isValidEmail, isValidPassword } from "./validation";

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

// Middleware (runs before routes)
app.use(express.json());

// Routes
app.get("/", (_req, res) => {
  res.status(200).send("OK. Try /health");
});

app.get("/health", (_req, res) => {
  res.status(200).json({ ok: true });
});

app.post("/debug/echo", (req, res) => {
  res.status(200).json({ youSent: req.body });
});

app.get("/debug/db", async (_req, res) => {
  const result = await pool.query("select now() as now");
  res.json({ dbTime: result.rows[0].now });
});

app.post("/auth/register", async (req, res) => {
  const email = String(req.body?.email ?? "").trim();
  const password = String(req.body?.password ?? "");

  if (!isValidEmail(email)) {
    return res.status(400).json({ error: "Invalid email" });
  }
  if (!isValidPassword(password)) {
    return res.status(400).json({ error: "Password must be 10+ chars and include 1 number + 1 special char" });
  }

  const passwordHash = await bcrypt.hash(password, 12);

  try {
    const result = await pool.query(
      `insert into users (email, password_hash)
       values ($1, $2)
       returning id, email, created_at`,
      [email, passwordHash]
    );

    return res.status(201).json({
      user: {
        id: result.rows[0].id,
        email: result.rows[0].email,
        createdAt: result.rows[0].created_at
      }
    });
  } catch (err: any) {
    if (err?.code === "23505") {
      return res.status(409).json({ error: "Email already registered" });
    }
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});


// Start server (keep this last)
app.listen(PORT, () => {
  console.log(`API listening on port ${PORT}`);
});
