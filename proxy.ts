import { jwtVerify } from "jose";
import { type NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "cms_session";
const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "ci-build-placeholder-not-for-production"
);

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

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

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

  return NextResponse.next();
}

export const config = {
  matcher: ["/cms/:path*", "/admin/:path*"],
};
