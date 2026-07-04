import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  getSessionFromCookies,
  setSessionCookie,
  createSession,
  hashPassword,
  verifyPassword,
} from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";

const CHANGE_PW_WINDOW_MS = 15 * 60 * 1000;
const CHANGE_PW_MAX_ATTEMPTS = 5;

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromCookies();
    if (!session) {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    }

    const rateLimitKey = `change-pw:${session.id}`;
    const { allowed, retryAfterMs } = checkRateLimit(
      rateLimitKey,
      CHANGE_PW_MAX_ATTEMPTS,
      CHANGE_PW_WINDOW_MS
    );

    if (!allowed) {
      return NextResponse.json(
        { error: "Too many attempts. Please try again later." },
        {
          status: 429,
          headers: { "Retry-After": String(Math.ceil(retryAfterMs / 1000)) },
        }
      );
    }

    const contentType = request.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      return NextResponse.json({ error: "Invalid request." }, { status: 415 });
    }

    const { current_password, new_password } = await request.json();

    if (!current_password || !new_password) {
      return NextResponse.json(
        { error: "Current password and new password are required." },
        { status: 400 }
      );
    }

    if (new_password.length < 8 || new_password.length > 128) {
      return NextResponse.json(
        { error: "New password must be between 8 and 128 characters." },
        { status: 400 }
      );
    }

    if (!/[a-zA-Z]/.test(new_password) || !/[0-9]/.test(new_password)) {
      return NextResponse.json(
        { error: "New password must contain at least one letter and one number." },
        { status: 400 }
      );
    }

    // Service-role client — bypasses RLS for profile writes
    const supabase = await createAdminClient();
    if (!supabase) {
      return NextResponse.json(
        { error: "Service role key not configured. Contact administrator." },
        { status: 503 }
      );
    }

    const { data: profile, error: fetchError } = await supabase
      .from("profiles")
      .select("id, password")
      .eq("id", session.id)
      .single();

    if (fetchError || !profile) {
      return NextResponse.json({ error: "Failed to verify current password." }, { status: 500 });
    }

    const valid = await verifyPassword(current_password, profile.password);
    if (!valid) {
      return NextResponse.json({ error: "Current password is incorrect." }, { status: 401 });
    }

    if (current_password === new_password) {
      return NextResponse.json(
        { error: "New password must be different from your current password." },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(new_password);

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        password: hashedPassword,
        must_change_password: false,
        updated_at: new Date().toISOString(),
      })
      .eq("id", session.id);

    if (updateError) {
      console.error("[AUTH] Password update failed");
      return NextResponse.json({ error: "Failed to update password." }, { status: 500 });
    }

    const newToken = await createSession({
      id: session.id,
      username: session.username,
      role: session.role,
      full_name: session.full_name,
      must_change_password: false,
    });

    await setSessionCookie(newToken);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
