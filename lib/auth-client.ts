import { decodeJwt } from "jose";
import type { SessionPayload } from "./auth-shared";

export type { SessionPayload };

const SESSION_KEY = "cms_session";

let cachedToken: string | null = null;
let cachedSession: SessionPayload | null = null;

export function getClientSession(): SessionPayload | null {
  if (typeof window === "undefined") return null;
  try {
    const token = localStorage.getItem(SESSION_KEY);
    if (!token) {
      if (cachedToken !== null) {
        cachedToken = null;
        cachedSession = null;
      }
      return null;
    }
    if (token === cachedToken && cachedSession !== null) return cachedSession;

    const payload = decodeJwt(token) as SessionPayload;
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      localStorage.removeItem(SESSION_KEY);
      cachedToken = null;
      cachedSession = null;
      return null;
    }
    cachedToken = token;
    cachedSession = payload;
    return payload;
  } catch {
    localStorage.removeItem(SESSION_KEY);
    cachedToken = null;
    cachedSession = null;
    return null;
  }
}

export function setClientSession(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(SESSION_KEY, token);
  cachedToken = null;
  cachedSession = null;
}

export function clearClientSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SESSION_KEY);
  cachedToken = null;
  cachedSession = null;
}

export function getClientToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(SESSION_KEY);
}
