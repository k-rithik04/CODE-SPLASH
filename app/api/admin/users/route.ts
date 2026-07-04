import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyUnlockToken, getSessionFromCookies } from "@/lib/auth";
import { sanitizeInput } from "@/lib/sanitize";

// GET — list all users (requires admin session cookie)
export async function GET() {
  try {
    const session = await getSessionFromCookies();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("id, username, full_name, role, created_at")
      .order("username");

    if (error) {
      return NextResponse.json({ error: "Failed to fetch users." }, { status: 500 });
    }

    return NextResponse.json({ users: data });
  } catch {
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

// POST — create a new user (requires admin session + unlock token)
export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromCookies();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unlock required." }, { status: 403 });
    }
    const unlockValid = await verifyUnlockToken(authHeader.slice(7));
    if (!unlockValid) {
      return NextResponse.json({ error: "Invalid or expired unlock. Please unlock again." }, { status: 403 });
    }

    const contentType = request.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      return NextResponse.json({ error: "Invalid request." }, { status: 415 });
    }

    const { username, full_name, password, role } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: "Username and password are required." }, { status: 400 });
    }

    const cleanUsername = sanitizeInput(String(username).slice(0, 50));
    const cleanFullName = full_name ? sanitizeInput(String(full_name).slice(0, 100)) : null;
    const cleanPassword = String(password).slice(0, 128);
    const cleanRole = ["admin", "editor", "viewer"].includes(role) ? role : "viewer";

    if (cleanPassword.length < 4) {
      return NextResponse.json({ error: "Password must be at least 4 characters." }, { status: 400 });
    }

    const adminClient = await createAdminClient();
    if (!adminClient) {
      return NextResponse.json(
        { error: "Service role key not configured. Add it to the keys table." },
        { status: 503 }
      );
    }

    const bcrypt = await import("bcryptjs");
    const hashedPassword = await bcrypt.hash(cleanPassword, 12);

    const { error: insertError } = await adminClient.from("profiles").insert({
      username: cleanUsername,
      full_name: cleanFullName,
      password: hashedPassword,
      role: cleanRole,
      must_change_password: true,
    });

    if (insertError) {
      if (insertError.code === "23505") {
        return NextResponse.json({ error: "Username already exists." }, { status: 409 });
      }
      console.error("[USERS] Insert failed");
      return NextResponse.json({ error: "Failed to create user." }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
