import { NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/auth";

export async function GET() {
  const session = await getSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  return NextResponse.json({
    user: {
      id: session.id,
      username: session.username,
      role: session.role,
      full_name: session.full_name,
      must_change_password: session.must_change_password,
    },
  });
}
