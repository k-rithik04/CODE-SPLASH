import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { createSession, setSessionCookie, verifyPassword } from "@/lib/auth";
import { checkRateLimit, resetRateLimit } from "@/lib/rate-limit";
import { getClientIp, sanitizeInput } from "@/lib/sanitize";

const LOGIN_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const LOGIN_MAX_ATTEMPTS = 8;

export async function POST(request: NextRequest) {
  try {
    // Rate limit by IP
    const ip = getClientIp(request);
    const rateLimitKey = `login:${ip}`;
    const { allowed, retryAfterMs } = checkRateLimit(
      rateLimitKey,
      LOGIN_MAX_ATTEMPTS,
      LOGIN_WINDOW_MS
    );

    if (!allowed) {
      return NextResponse.json(
        { error: "Too many login attempts. Please try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil(retryAfterMs / 1000)),
            "X-RateLimit-Limit": String(LOGIN_MAX_ATTEMPTS),
            "X-RateLimit-Remaining": "0",
          },
        }
      );
    }

    // Validate content type
    const contentType = request.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      return NextResponse.json({ error: "Invalid request." }, { status: 415 });
    }

    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required." },
        { status: 400 }
      );
    }

    // Sanitize username
    const cleanUsername = sanitizeInput(username);

    // Limit input length to prevent abuse
    if (cleanUsername.length > 50 || password.length > 128) {
      return NextResponse.json({ error: "Invalid credentials." }, { status: 400 });
    }

    const supabase = createServerClient();

    const { data, error } = await supabase
      .from("profiles")
      .select("id, username, full_name, role, password, must_change_password")
      .eq("username", cleanUsername)
      .maybeSingle();

    // Generic error message — never leak DB details
    if (error) {
      console.error("[AUTH] Login query failed");
      return NextResponse.json({ error: "Invalid username or password." }, { status: 401 });
    }

    if (!data) {
      return NextResponse.json({ error: "Invalid username or password." }, { status: 401 });
    }

    const valid = await verifyPassword(password, data.password);
    if (!valid) {
      return NextResponse.json({ error: "Invalid username or password." }, { status: 401 });
    }

    // Successful login — reset rate limit
    resetRateLimit(rateLimitKey);

    const token = await createSession({
      id: data.id,
      username: data.username,
      role: data.role as "admin" | "editor" | "viewer",
      full_name: data.full_name,
      must_change_password: data.must_change_password,
    });

    await setSessionCookie(token);

    return NextResponse.json({
      success: true,
      must_change_password: data.must_change_password,
      user: {
        id: data.id,
        username: data.username,
        full_name: data.full_name,
        role: data.role,
      },
    });
  } catch {
    // Never leak error details
    return NextResponse.json({ error: "Invalid username or password." }, { status: 401 });
  }
}
