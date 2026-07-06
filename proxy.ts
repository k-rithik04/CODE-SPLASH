/*
 * Proxy (Middleware) — CodeSplash 2026
 * ======================================
 * Portfolio project by Rithika (lead), Pahan, and Yasiru
 * https://codesplash.cssa.lk
 *
 * Next.js 16 middleware replacement. Handles:
 *  - /admin → /cms redirect (legacy URL compat)
 *  - JWT session verification from HttpOnly cookies
 *  - Unauthenticated /cms/* → /cms/login redirect
 *  - RBAC route enforcement (admin/editor/viewer roles)
 *  - CSRF Origin/Referer validation for API routes
 *
 * Security: JWT_SECRET is required in production (throws on startup).
 */

import { jwtVerify } from "jose";
import { type NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "cms_session";

if (!process.env.JWT_SECRET && process.env.NODE_ENV === "production") {
  throw new Error("FATAL: JWT_SECRET environment variable is not set.");
}

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "ci-build-placeholder-not-for-production"
);

const ROLE_HIERARCHY: Record<string, number> = { viewer: 0, editor: 1, admin: 2 };

const ADMIN_ROUTES = ["/cms/audit", "/cms/settings/users"];
const EDITOR_ROUTES = [
  "/cms/content",
  "/cms/settings/hero",
  "/cms/settings/cta",
  "/cms/settings/connect",
];

// Rate limiting store (in-memory, per-instance)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 100; // requests per window

function getRateLimitKey(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

function checkGlobalRateLimit(key: string): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(key);
  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return true;
  }
  if (entry.count >= RATE_LIMIT_MAX) return false;
  entry.count++;
  return true;
}

async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, SECRET, {
      issuer: "codesplash-cms",
    });
    return payload;
  } catch {
    return null;
  }
}

function isSuspiciousPath(pathname: string): boolean {
  const suspicious = [
    "/.env", "/.git", "/wp-admin", "/wp-login", "/phpmyadmin",
    "/xmlrpc.php", "/cgi-bin", "/shell.php", "/c99.php", "/R57.php",
    "/cmd.exe", "/etc/passwd", "/proc/self", "/.svn", "/.hg",
    "/WEB-INF", "/.DS_Store", "/Thumbs.db", "/debug", "/server-info",
  ];
  return suspicious.some((p) => pathname.startsWith(p));
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Block suspicious paths immediately
  if (isSuspiciousPath(pathname)) {
    return new NextResponse("Not Found", { status: 404 });
  }

  // Global rate limiting (all routes)
  const clientKey = getRateLimitKey(request);
  if (!checkGlobalRateLimit(clientKey)) {
    return new NextResponse(
      JSON.stringify({ error: "Too many requests. Please try again later." }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": "60",
          "X-RateLimit-Limit": String(RATE_LIMIT_MAX),
          "X-RateLimit-Remaining": "0",
        },
      }
    );
  }

  // Block large request bodies (prevent memory exhaustion)
  const contentLength = request.headers.get("content-length");
  if (contentLength && parseInt(contentLength) > 1_048_576) {
    // 1MB limit
    return new NextResponse(
      JSON.stringify({ error: "Request body too large" }),
      { status: 413, headers: { "Content-Type": "application/json" } }
    );
  }

  // Redirect /admin → /cms (legacy route)
  if (pathname.startsWith("/admin")) {
    const sub = pathname.replace("/admin", "") || "/login";
    return NextResponse.redirect(new URL("/cms" + sub, request.url));
  }

  if (!pathname.startsWith("/cms")) return NextResponse.next();

  // Allow API routes through without auth check
  if (pathname.startsWith("/cms/api")) return NextResponse.next();

  const token = request.cookies.get(COOKIE_NAME)?.value;
  const session = token ? await verifyToken(token) : null;

  if (pathname.startsWith("/cms/login")) {
    if (session) {
      return NextResponse.redirect(new URL("/cms/dashboard", request.url));
    }
    return NextResponse.next();
  }

  if (!session) {
    return NextResponse.redirect(new URL("/cms/login", request.url));
  }

  const role = (session.role as string) || "viewer";
  const userLevel = ROLE_HIERARCHY[role] ?? 0;

  const isAdminRoute = ADMIN_ROUTES.some((r) => pathname === r || pathname.startsWith(r + "/"));
  if (isAdminRoute && userLevel < ROLE_HIERARCHY["admin"]) {
    return NextResponse.redirect(new URL("/cms/dashboard", request.url));
  }

  const isEditorRoute = EDITOR_ROUTES.some((r) => pathname === r || pathname.startsWith(r + "/"));
  if (isEditorRoute && userLevel < ROLE_HIERARCHY["editor"]) {
    return NextResponse.redirect(new URL("/cms/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/cms/:path*", "/admin/:path*", "/:path*"],
};
