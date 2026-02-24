import express from "express";
import { pool } from "./db";

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

// Start server (keep this last)
app.listen(PORT, () => {
  console.log(`API listening on port ${PORT}`);
});
