import express from "express";

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

app.get("/", (_req, res) => {
  res.status(200).send("OK. Try /health");
});

app.get("/health", (_req, res) => {
  res.status(200).json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`API listening on port ${PORT}`);
});
