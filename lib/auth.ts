import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

// Fail fast if JWT_SECRET is missing — never use a fallback in production
const rawSecret = process.env.JWT_SECRET;
if (!rawSecret || rawSecret === "codesplash-cms-secret-key-change-in-production") {
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "FATAL: JWT_SECRET is not set or is still the default value. Set a strong random secret in .env.local"
    );
  }
  console.warn("[SECURITY] Using insecure default JWT_SECRET — only acceptable in development");
}
const SECRET = new TextEncoder().encode(rawSecret || "codesplash-cms-secret-key-change-in-production");
const ALGORITHM = "HS256";
const COOKIE_NAME = "cms_session";
const EXPIRY = "7d";

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
    const { payload } = await jwtVerify(token, SECRET, {
      issuer: "codesplash-cms",
    });
    return payload as SessionPayload;
  } catch {
    return null;
  }
}

export async function getSessionFromCookies(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySession(token);
}

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export { COOKIE_NAME };

// ─── Unlock JWT (for privileged CMS operations like user management) ───

const UNLOCK_ISSUER = "codesplash-cms-unlock";
const UNLOCK_EXPIRY = "1h";

export interface UnlockPayload extends JWTPayload {
  scope: "admin-unlock";
}

export async function createUnlockToken(): Promise<string> {
  return new SignJWT({ scope: "admin-unlock" })
    .setProtectedHeader({ alg: ALGORITHM })
    .setIssuedAt()
    .setIssuer(UNLOCK_ISSUER)
    .setExpirationTime(UNLOCK_EXPIRY)
    .sign(SECRET);
}

export async function verifyUnlockToken(token: string): Promise<boolean> {
  try {
    const { payload } = await jwtVerify(token, SECRET, { issuer: UNLOCK_ISSUER });
    return (payload as UnlockPayload).scope === "admin-unlock";
  } catch {
    return false;
  }
}
