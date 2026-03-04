import type { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

function mustGetEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`${name} missing`);
  return v;
}

const JWT_SECRET = mustGetEnv("JWT_SECRET");

export function authRequired(req: Request, res: Response, next: NextFunction) {
  const h = req.headers.authorization;

  if (!h || !h.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing bearer token" });
  }

  const token = h.slice("Bearer ".length);

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    const userId = decoded.sub;

    if (typeof userId !== "string") {
      return res.status(401).json({ error: "Invalid access token" });
    }

    (req as any).auth = { userId };
    return next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired access token" });
  }
}
