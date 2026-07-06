import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import bcrypt from "bcryptjs";

const rawSecret = typeof process !== "undefined" ? process.env?.JWT_SECRET : undefined;

if (!rawSecret && process.env.NODE_ENV === "production") {
  console.error("FATAL: JWT_SECRET environment variable is not set. Refusing to start with weak fallback in production.");
}

const SECRET = new TextEncoder().encode(rawSecret || "ci-build-placeholder-not-for-production");
const ALGORITHM = "HS256";
const EXPIRY = "1h";

export interface SessionPayload extends JWTPayload {
  id: string;
  username: string;
  role: "admin" | "editor" | "viewer";
  full_name: string | null;
  must_change_password: boolean;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSession(payload: Omit<SessionPayload, "iat" | "exp" | "iss">) {
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: ALGORITHM })
    .setIssuedAt()
    .setIssuer("codesplash-cms")
    .setExpirationTime(EXPIRY)
    .sign(SECRET);
  return token;
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET, { issuer: "codesplash-cms" });
    return payload as SessionPayload;
  } catch {
    return null;
  }
}

export interface UnlockPayload extends JWTPayload {
  scope: "admin-unlock";
}

export async function createUnlockToken(): Promise<string> {
  return new SignJWT({ scope: "admin-unlock" })
    .setProtectedHeader({ alg: ALGORITHM })
    .setIssuedAt()
    .setIssuer("codesplash-cms-unlock")
    .setExpirationTime("1h")
    .sign(SECRET);
}

export async function verifyUnlockToken(token: string): Promise<boolean> {
  try {
    const { payload } = await jwtVerify(token, SECRET, { issuer: "codesplash-cms-unlock" });
    return (payload as UnlockPayload).scope === "admin-unlock";
  } catch {
    return false;
  }
}
