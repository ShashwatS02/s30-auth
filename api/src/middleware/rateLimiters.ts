import rateLimit, { ipKeyGenerator } from "express-rate-limit";

const ipPlusEmail = (req: any) => {
  const email = String(req.body?.email ?? "").trim().toLowerCase();
  const ipKey = ipKeyGenerator(req.ip); // important for IPv6-safe limiting
  return `${ipKey}|${email || "no-email"}`;
};

// Broad per-IP throttle (high-volume abuse)
export const loginIpLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // only count failed login attempts
  handler: (_req, res) => res.status(429).json({ error: "Too many login attempts. Try again later." }),
});

// Targeted account protection (same IP hammering one email)
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  keyGenerator: ipPlusEmail,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // only count failed login attempts
  handler: (_req, res) => res.status(429).json({ error: "Too many login attempts. Try again later." }),
});

// Refresh can stay per-IP (tune separately)
export const refreshLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => res.status(429).json({ error: "Too many refresh requests. Try again later." }),
});
