import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSessionFromCookies } from "@/lib/auth";
import { hashPassword } from "@/lib/auth-shared";
import { validateOrigin } from "@/lib/csrf";

export async function GET() {
  const session = await getSessionFromCookies();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const supabase = await createAdminClient();
  if (!supabase) return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });

  const { data, error } = await supabase
    .from("profiles")
    .select("id, username, full_name, role, must_change_password, created_at")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ users: data });
}

export async function POST(request: Request) {
  const csrfError = validateOrigin(request);
  if (csrfError) return csrfError;

  const session = await getSessionFromCookies();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { username, full_name, role, password, must_change_password } = await request.json();

  if (!username || !password || !role) {
    return NextResponse.json({ error: "Username, password, and role are required" }, { status: 400 });
  }

  if (!must_change_password) {
    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }
    if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
      return NextResponse.json({ error: "Password must contain at least one letter and one number" }, { status: 400 });
    }
  }

  const supabase = await createAdminClient();
  if (!supabase) return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });

  const hashed = await hashPassword(password);

  const { data, error } = await supabase
    .from("profiles")
    .insert({
      username: username.toLowerCase().trim(),
      full_name: full_name || "",
      role,
      password: hashed,
      must_change_password: must_change_password ?? true,
    })
    .select("id, username, full_name, role, must_change_password, created_at")
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "Username already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ user: data });
}
