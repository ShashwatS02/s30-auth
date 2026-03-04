import jwt from "jsonwebtoken";
import crypto from "crypto";

function mustGetEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`${name} missing`);
  return v;
}

const JWT_SECRET = mustGetEnv("JWT_SECRET");
export const JWT_ISSUER = process.env.JWT_ISSUER ?? "s30-auth";
export const JWT_AUDIENCE = process.env.JWT_AUDIENCE ?? "s30-auth-api";

export const ACCESS_TOKEN_TTL = "15m";

export function signAccessToken(userId: string) {
  return jwt.sign(
    { sub: userId },
    JWT_SECRET,
    {
      expiresIn: ACCESS_TOKEN_TTL,
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
      algorithm: "HS256",
    }
  );
}

export function makeRefreshToken() {
  return crypto.randomBytes(32).toString("hex");
}

export function sha256Hex(input: string) {
  return crypto.createHash("sha256").update(input).digest("hex");
}
