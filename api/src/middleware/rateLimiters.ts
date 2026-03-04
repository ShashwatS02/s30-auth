import { rateLimit } from "express-rate-limit";

const json429 = (code: string, message: string) => ({ error: { code, message } });

export const loginLimiter = rateLimit({
  windowMs: 60_000,       // 1 minute
  limit: 10,              // tune as you like
  standardHeaders: "draft-8",
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  handler: (_req, res) => {
    res.status(429).json(json429("rate_limited", "Too many login attempts. Try again soon."));
  },
});

export const refreshLimiter = rateLimit({
  windowMs: 60_000,
  limit: 30,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json(json429("rate_limited", "Too many refresh attempts. Try again soon."));
  },
});
