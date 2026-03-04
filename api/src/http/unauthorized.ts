import type { Response } from "express";

const REALM = process.env.BEARER_REALM ?? process.env.JWT_ISSUER ?? "s30-auth";

function q(s: string) {
  return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

type BearerError = "invalid_request" | "invalid_token" | "insufficient_scope";

export function sendBearer401(
  res: Response,
  body: { code: string; message: string },
  challenge?: { error?: BearerError; description?: string }
) {
  // RFC 6750: challenges use auth-scheme "Bearer" and may include realm/error/error_description. [page:0]
  const parts = [`Bearer realm="${q(REALM)}"`];

  if (challenge?.error) parts.push(`error="${challenge.error}"`);
  if (challenge?.description) parts.push(`error_description="${q(challenge.description)}"`);

  res.setHeader("WWW-Authenticate", parts.join(", "));
  return res.status(401).json({ error: body });
}
