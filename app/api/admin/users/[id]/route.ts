import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyUnlockToken, getSessionFromCookies } from "@/lib/auth";
import { sanitizeInput } from "@/lib/sanitize";

interface RouteContext {
  params: Promise<{ id: string }>;
}

// PUT — update a user (requires admin session + unlock token)
export async function PUT(request: NextRequest, { params }: RouteContext) {
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

    const { id } = await params;

    const contentType = request.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      return NextResponse.json({ error: "Invalid request." }, { status: 415 });
    }

    const { full_name, role } = await request.json();

    const adminClient = await createAdminClient();
    if (!adminClient) {
      return NextResponse.json(
        { error: "Service role key not configured. Add it to the keys table." },
        { status: 503 }
      );
    }

    const updates: Record<string, unknown> = {};
    if (full_name !== undefined) updates.full_name = full_name ? sanitizeInput(String(full_name).slice(0, 100)) : null;
    if (role !== undefined) updates.role = ["admin", "editor", "viewer"].includes(role) ? role : "viewer";
    updates.updated_at = new Date().toISOString();

    const { error: updateError } = await adminClient
      .from("profiles")
      .update(updates)
      .eq("id", id);

    if (updateError) {
      console.error("[USERS] Update failed");
      return NextResponse.json({ error: "Failed to update user." }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

// DELETE — delete a user (requires admin session + unlock token)
export async function DELETE(request: NextRequest, { params }: RouteContext) {
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

    const { id } = await params;

    const adminClient = await createAdminClient();
    if (!adminClient) {
      return NextResponse.json(
        { error: "Service role key not configured. Add it to the keys table." },
        { status: 503 }
      );
    }

    if (id === session.id) {
      return NextResponse.json({ error: "Cannot delete your own account." }, { status: 400 });
    }

    const { error: deleteError } = await adminClient
      .from("profiles")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error("[USERS] Delete failed");
      return NextResponse.json({ error: "Failed to delete user." }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
