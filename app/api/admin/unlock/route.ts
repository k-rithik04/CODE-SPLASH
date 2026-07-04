import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { verifyPassword, createUnlockToken, getSessionFromCookies } from "@/lib/auth";
import { checkRateLimit, resetRateLimit } from "@/lib/rate-limit";
import { getClientIp, sanitizeInput } from "@/lib/sanitize";

const UNLOCK_WINDOW_MS = 15 * 60 * 1000;
const UNLOCK_MAX_ATTEMPTS = 5;

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromCookies();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const ip = getClientIp(request);
    const rateLimitKey = `unlock:${ip}`;
    const { allowed, retryAfterMs } = checkRateLimit(
      rateLimitKey,
      UNLOCK_MAX_ATTEMPTS,
      UNLOCK_WINDOW_MS
    );

    if (!allowed) {
      return NextResponse.json(
        { error: "Too many attempts. Please try again later." },
        { status: 429, headers: { "Retry-After": String(Math.ceil(retryAfterMs / 1000)) } }
      );
    }

    const contentType = request.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      return NextResponse.json({ error: "Invalid request." }, { status: 415 });
    }

    const { password } = await request.json();
    if (!password || typeof password !== "string") {
      return NextResponse.json({ error: "Password is required." }, { status: 400 });
    }

    const cleanPassword = sanitizeInput(password);
    if (cleanPassword.length > 128) {
      return NextResponse.json({ error: "Invalid password." }, { status: 400 });
    }

    const supabase = createServerClient();

    const { data: keyRow, error: fetchError } = await supabase
      .from("keys")
      .select("id, password_hash")
      .limit(1)
      .maybeSingle();

    if (fetchError || !keyRow) {
      console.error("[UNLOCK] No key row found or query failed");
      return NextResponse.json(
        { error: "Unlock not configured. Contact administrator." },
        { status: 503 }
      );
    }

    const valid = await verifyPassword(cleanPassword, keyRow.password_hash);
    if (!valid) {
      return NextResponse.json({ error: "Invalid password." }, { status: 401 });
    }

    resetRateLimit(rateLimitKey);

    const token = await createUnlockToken();

    return NextResponse.json({ success: true, token });
  } catch {
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
