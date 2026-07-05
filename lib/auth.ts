import { cookies } from "next/headers";

// Re-export everything that works in both environments
export {
  hashPassword,
  verifyPassword,
  createSession,
  verifySession,
  createUnlockToken,
  verifyUnlockToken,
} from "./auth-shared";
export type { SessionPayload, UnlockPayload } from "./auth-shared";

import { verifySession, type SessionPayload } from "./auth-shared";

const COOKIE_NAME = "cms_session";

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
    maxAge: 1 * 60 * 60, // 1 hour
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export { COOKIE_NAME };
