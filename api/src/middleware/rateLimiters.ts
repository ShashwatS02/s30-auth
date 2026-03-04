import rateLimit, { ipKeyGenerator } from "express-rate-limit";

const getClientIp = (req: any) => String(req.headers["cf-connecting-ip"] ?? req.ip);

const ipPlusEmail = (req: any) => {
  const email = String(req.body?.email ?? "").trim().toLowerCase();
  const ipKey = ipKeyGenerator(getClientIp(req));
  return `${ipKey}|${email || "no-email"}`;
};

const ipOnly = (req: any) => ipKeyGenerator(getClientIp(req));

// Broad per-IP throttle (high-volume abuse)
export const loginIpLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  keyGenerator: (req) => ipOnly(req),
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  handler: (_req, res) => res.status(429).json({ error: "Too many login attempts. Try again later." }),
});

// Targeted account protection (per IP + email)
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  keyGenerator: ipPlusEmail,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  handler: (_req, res) => res.status(429).json({ error: "Too many login attempts. Try again later." }),
});

// Refresh per-IP
export const refreshLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  keyGenerator: (req) => ipOnly(req),
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => res.status(429).json({ error: "Too many refresh requests. Try again later." }),
});
