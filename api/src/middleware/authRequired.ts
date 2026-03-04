import type { Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_ISSUER, JWT_AUDIENCE } from "../auth";

function mustGetEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`${name} missing`);
  return v;
}

const JWT_SECRET = mustGetEnv("JWT_SECRET");

export function authRequired(req: Express.Request, res: Response, next: NextFunction) {
  const h = req.headers.authorization;
  if (!h || !h.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing bearer token" });
  }

  const token = h.slice("Bearer ".length);

  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
      algorithms: ["HS256"],
    }) as JwtPayload;

    if (typeof decoded.sub !== "string") {
      return res.status(401).json({ error: "Invalid access token" });
    }

    req.auth = { userId: decoded.sub };
    return next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired access token" });
  }
}
