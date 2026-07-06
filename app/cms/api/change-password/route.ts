import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { verifyPassword, hashPassword, createSession } from "@/lib/auth-shared";
import { setSessionCookie, getSessionFromCookies } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const session = await getSessionFromCookies();
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "Current and new passwords are required" }, { status: 400 });
    }

    if (newPassword.length < 8 || newPassword.length > 128) {
      return NextResponse.json({ error: "New password must be between 8 and 128 characters" }, { status: 400 });
    }

    if (!/[a-zA-Z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      return NextResponse.json({ error: "New password must contain at least one letter and one number" }, { status: 400 });
    }

    const supabase = createServerClient();
    const { data: profile, error: fetchError } = await supabase
      .from("profiles")
      .select("id, password")
      .eq("id", session.id)
      .single();

    if (fetchError || !profile) {
      return NextResponse.json({ error: "Failed to verify current password" }, { status: 500 });
    }

    const profileData = profile as { id: string; password: string };
    let valid = false;
    if (profileData.password.startsWith("$2")) {
      valid = await verifyPassword(currentPassword, profileData.password);
    } else {
      valid = currentPassword === profileData.password;
    }

    if (!valid) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 401 });
    }

    if (currentPassword === newPassword) {
      return NextResponse.json({ error: "New password must be different from current password" }, { status: 400 });
    }

    const hashed = await hashPassword(newPassword);

    const { error: updateError } = await (supabase
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .from("profiles") as any)
      .update({
        password: hashed,
        must_change_password: false,
        updated_at: new Date().toISOString(),
      })
      .eq("id", session.id);

    if (updateError) {
      return NextResponse.json({ error: "Failed to update password" }, { status: 500 });
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
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
