import { type NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { verifySession, COOKIE_NAME } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  const session = token ? await verifySession(token) : null;
  const { pathname } = request.nextUrl;

  const isChangePasswordPage = pathname.startsWith("/admin/change-password");
  const isLoginPage = pathname.startsWith("/admin/login");

  // Protect /admin routes — redirect to login if not authenticated
  if (pathname.startsWith("/admin") && !isLoginPage && !isChangePasswordPage && !session) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    return NextResponse.redirect(url);
  }

  // If authenticated and must_change_password, force change-password page
  if (
    session &&
    session.must_change_password &&
    !isChangePasswordPage &&
    !isLoginPage
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/change-password";
    return NextResponse.redirect(url);
  }

  // If authenticated and password already changed, block access to change-password page
  if (session && !session.must_change_password && isChangePasswordPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/dashboard";
    return NextResponse.redirect(url);
  }

  // Redirect to dashboard if already logged in and visiting /admin/login
  if (isLoginPage && session) {
    if (session.must_change_password) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/change-password";
      return NextResponse.redirect(url);
    }
    const url = request.nextUrl.clone();
    url.pathname = "/admin/dashboard";
    return NextResponse.redirect(url);
  }

  // RBAC for authenticated users
  if (session && pathname.startsWith("/admin") && !isLoginPage && !isChangePasswordPage) {
    const role = session.role;

    if (role === "viewer") {
      if (pathname !== "/admin/dashboard" && !pathname.startsWith("/admin/content/database")) {
        const url = request.nextUrl.clone();
        url.pathname = "/admin/dashboard";
        return NextResponse.redirect(url);
      }
    }

    if (role === "editor") {
      if (pathname.startsWith("/admin/content/users")) {
        const url = request.nextUrl.clone();
        url.pathname = "/admin/dashboard";
        return NextResponse.redirect(url);
      }
    }
  }

  // Build response with security headers
  const response = NextResponse.next();

  // Prevent caching of authenticated pages
  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
  response.headers.set("Pragma", "no-cache");

  // Prevent clickjacking on admin pages
  response.headers.set("X-Frame-Options", "DENY");

  // Prevent MIME sniffing
  response.headers.set("X-Content-Type-Options", "nosniff");

  if (session) {
    response.headers.set("x-user-role", session.role);
    response.headers.set("x-user-id", session.id);
    response.headers.set("x-user-name", session.username);
    response.headers.set("x-must-change-password", String(session.must_change_password));
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
