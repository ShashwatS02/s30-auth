import express from "express";
import { pool } from "./db";
import bcrypt from "bcrypt";
import { isValidEmail, isValidPassword } from "./validation";
import cookieParser from "cookie-parser";
import { signAccessToken, makeRefreshToken, sha256Hex } from "./auth";
import { authRequired } from "./middleware/authRequired";
import { loginLimiter, loginIpLimiter, refreshLimiter } from "./middleware/rateLimiters";


const app = express();
app.set("trust proxy", process.env.NODE_ENV === "production" ? 2 : false);
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

// Middleware (runs before routes)
app.use(express.json());
app.use(cookieParser());

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

app.get("/me", authRequired, async (req, res) => {
  const userId = (req as any).auth.userId as string;

  const result = await pool.query(
    `select id, email, created_at
     from users
     where id = $1`,
    [userId]
  );

  if (result.rowCount === 0) return res.status(404).json({ error: "User not found" });

  const u = result.rows[0];
  return res.json({ user: { id: u.id, email: u.email, createdAt: u.created_at } });
});

app.get("/protected/ping", authRequired, (req, res) => {
  res.json({ ok: true, userId: req.auth.userId });
});

app.get("/debug/ip", (req, res) => {
  res.json({
    ip: req.ip,
    ips: (req as any).ips,
    remoteAddress: req.socket.remoteAddress,
    xForwardedFor: req.headers["x-forwarded-for"],
    cfConnectingIp: req.headers["cf-connecting-ip"],
  });
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

app.post("/auth/login", loginIpLimiter, loginLimiter, async (req, res) => {
  const email = String(req.body?.email ?? "").trim();
  const password = String(req.body?.password ?? "");

  const userRes = await pool.query(
    `select id, email, password_hash from users where email = $1`,
    [email]
  );

  if (userRes.rowCount === 0) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const user = userRes.rows[0];
  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });

  const refreshToken = makeRefreshToken();
  const refreshTokenHash = sha256Hex(refreshToken);

  const sessionRes = await pool.query(
    `insert into sessions (user_id, refresh_token_hash, expires_at)
     values ($1, $2, now() + interval '30 days')
     returning id`,
    [user.id, refreshTokenHash]
  );

  res.cookie("refresh_token", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/auth/refresh",
    maxAge: 30 * 24 * 60 * 60 * 1000
  });

  const accessToken = signAccessToken(user.id);
  return res.status(200).json({ accessToken, sessionId: sessionRes.rows[0].id });
});

app.post("/auth/refresh", refreshLimiter, async (req, res) => {
  const token = String(req.cookies?.refresh_token ?? "");
  if (!token) return res.status(401).json({ error: "Missing refresh token" });

  const tokenHash = sha256Hex(token);

  const sessionRes = await pool.query(
    `select id, user_id, revoked_at, expires_at, replaced_by
     from sessions
     where refresh_token_hash = $1`,
    [tokenHash]
  );

  if (sessionRes.rowCount === 0) return res.status(401).json({ error: "Invalid refresh token" });

  const s = sessionRes.rows[0];

  const expired = new Date(s.expires_at).getTime() <= Date.now();
  if (s.revoked_at || expired) return res.status(401).json({ error: "Refresh token expired/revoked" });

  if (s.replaced_by) {
    // reuse detection: old token used again => revoke entire family (simple version)
    await pool.query(`update sessions set revoked_at = now() where user_id = $1 and revoked_at is null`, [s.user_id]);
    return res.status(401).json({ error: "Refresh token reuse detected" });
  }

  const newRefresh = makeRefreshToken();
  const newHash = sha256Hex(newRefresh);

  const newSessionRes = await pool.query(
    `insert into sessions (user_id, refresh_token_hash, expires_at)
     values ($1, $2, now() + interval '30 days')
     returning id`,
    [s.user_id, newHash]
  );

  await pool.query(
    `update sessions set replaced_by = $1 where id = $2`,
    [newSessionRes.rows[0].id, s.id]
  );

  res.cookie("refresh_token", newRefresh, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/auth/refresh",
    maxAge: 30 * 24 * 60 * 60 * 1000
  });

  const accessToken = signAccessToken(s.user_id);
  return res.status(200).json({ accessToken });
});

app.post("/auth/logout", async (req, res) => {
  const token = String(req.cookies?.refresh_token ?? "");
  if (token) {
    const tokenHash = sha256Hex(token);
    await pool.query(`update sessions set revoked_at = now() where refresh_token_hash = $1`, [tokenHash]);
  }

  res.clearCookie("refresh_token", { path: "/auth/refresh" });
  return res.status(204).send();
});

app.post("/auth/logout-all", authRequired, async (req, res) => {
  const userId = (req as any).auth.userId as string;

  await pool.query(
    `update sessions
     set revoked_at = now()
     where user_id = $1 and revoked_at is null`,
    [userId]
  );

  res.clearCookie("refresh_token", { path: "/auth/refresh" });
  return res.status(204).send();
});

// Start server (keep this last)
app.listen(PORT, () => {
  console.log(`API listening on port ${PORT}`);
});
