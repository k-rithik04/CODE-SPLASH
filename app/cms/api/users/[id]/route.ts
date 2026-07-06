import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSessionFromCookies } from "@/lib/auth";
import { hashPassword } from "@/lib/auth-shared";
import { validateOrigin } from "@/lib/csrf";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const csrfError = validateOrigin(request);
  if (csrfError) return csrfError;

  const session = await getSessionFromCookies();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();

  const supabase = await createAdminClient();
  if (!supabase) return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });

  const update: Record<string, unknown> = {};
  if (body.username !== undefined) update.username = body.username.toLowerCase().trim();
  if (body.full_name !== undefined) update.full_name = body.full_name;
  if (body.role !== undefined) {
    const allowedRoles = ["admin", "editor", "viewer"];
    if (!allowedRoles.includes(body.role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }
    update.role = body.role;
  }
  if (body.must_change_password !== undefined) update.must_change_password = body.must_change_password;
  if (body.password) {
    if (!body.must_change_password) {
      if (body.password.length < 8) {
        return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
      }
      if (!/[a-zA-Z]/.test(body.password) || !/[0-9]/.test(body.password)) {
        return NextResponse.json({ error: "Password must contain at least one letter and one number" }, { status: 400 });
      }
    }
    update.password = await hashPassword(body.password);
  }

  const { data, error } = await supabase
    .from("profiles")
    .update(update)
    .eq("id", id)
    .select("id, username, full_name, role, must_change_password, created_at")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ user: data });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const csrfError = validateOrigin(request);
  if (csrfError) return csrfError;

  const session = await getSessionFromCookies();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  if (id === session.id) {
    return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 });
  }

  const supabase = await createAdminClient();
  if (!supabase) return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });

  const { error } = await supabase.from("profiles").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
