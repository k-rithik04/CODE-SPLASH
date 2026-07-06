import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyPassword, createSession } from "@/lib/auth-shared";
import { setSessionCookie } from "@/lib/auth";

const loginAttempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = loginAttempts.get(ip);
  if (!entry || now > entry.resetAt) {
    loginAttempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  if (entry.count >= MAX_ATTEMPTS) return false;
  entry.count++;
  return true;
}

const DUMMY_HASH = "$2b$12$2gcbillES.3X4dTnU8tkruZsMJFfacx2s5qsixa42vB0aV3S3gDFi";

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 }
      );
    }

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "Too many login attempts. Please try again later." },
        { status: 429 }
      );
    }

    const supabase = await createAdminClient();
    if (!supabase) {
      return NextResponse.json(
        { error: "Server misconfiguration: admin client unavailable" },
        { status: 500 }
      );
    }
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("username", username)
      .single();

    if (error || !profile) {
      await verifyPassword("dummy", DUMMY_HASH);
      return NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401 }
      );
    }

    let valid = false;
    if (profile.password.startsWith("$2")) {
      valid = await verifyPassword(password, profile.password);
    } else {
      valid = password === profile.password;
    }
    if (!valid) {
      try {
        await supabase.from("audit_log").insert({
          action: "login_failed",
          entity_type: "profile",
          entity_id: profile.id,
          details: { username, ip },
        });
      } catch {}
      return NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401 }
      );
    }

    loginAttempts.delete(ip);

    const token = await createSession({
      id: profile.id,
      username: profile.username,
      role: profile.role,
      full_name: profile.full_name,
      must_change_password: profile.must_change_password,
    });

    await setSessionCookie(token);

    try {
      await supabase.from("audit_log").insert({
        action: "login_success",
        entity_type: "profile",
        entity_id: profile.id,
        details: { username, ip },
      });
    } catch {}

    return NextResponse.json({
      success: true,
      user: {
        username: profile.username,
        role: profile.role,
        full_name: profile.full_name,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
