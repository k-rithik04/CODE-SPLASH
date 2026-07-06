import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/auth";
import { validateOrigin } from "@/lib/csrf";

export async function POST(request: Request) {
  const csrfError = validateOrigin(request);
  if (csrfError) return csrfError;

  await clearSessionCookie();
  return NextResponse.json({ success: true });
}
