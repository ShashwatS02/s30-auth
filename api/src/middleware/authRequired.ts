import type { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_ISSUER, JWT_AUDIENCE } from "../auth";
import { sendBearer401 } from "../http/unauthorized";


function mustGetEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`${name} missing`);
  return v;
}

const JWT_SECRET = mustGetEnv("JWT_SECRET");

export function authRequired(req: Request, res: Response, next: NextFunction) {
  const h = req.headers.authorization;

  // Missing credentials -> 401 + WWW-Authenticate Bearer realm="..." (RFC 6750). [page:0]
  if (!h || !h.startsWith("Bearer ")) {
    return sendBearer401(
      res,
      { code: "unauthorized", message: "Missing bearer token" }
      // No challenge.error here keeps us closer to RFC 6750 guidance for "no auth info". [page:0]
    );
  }

  const token = h.slice("Bearer ".length);

  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
      algorithms: ["HS256"],
    }) as JwtPayload;

    if (typeof decoded.sub !== "string") {
      return sendBearer401(res, { code: "invalid_token", message: "Invalid access token" }, {
        error: "invalid_token",
        description: "Malformed token subject",
      });
    }

    req.auth = { userId: decoded.sub };
    return next();
  } catch {
    // Invalid/expired token -> error="invalid_token" per RFC 6750 Section 3.1. [page:0]
    return sendBearer401(res, { code: "invalid_token", message: "Invalid or expired access token" }, {
      error: "invalid_token",
      description: "The access token is invalid or expired",
    });
  }
}
