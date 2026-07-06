import { NextResponse } from "next/server";

const ALLOWED_ORIGINS = [
  process.env.NEXT_PUBLIC_SITE_URL || "https://codesplash.cssa.lk",
  "https://codesplash.cssa.lk",
];

if (process.env.NODE_ENV !== "production") {
  ALLOWED_ORIGINS.push("http://localhost:3000", "http://127.0.0.1:3000");
}

export function validateOrigin(request: Request): NextResponse | null {
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");

  const source = origin || referer;
  if (!source) {
    return NextResponse.json({ error: "Missing origin" }, { status: 403 });
  }

  try {
    const url = new URL(source);
    const isAllowed = ALLOWED_ORIGINS.some(
      (allowed) => url.origin === allowed || url.hostname === new URL(allowed).hostname
    );
    if (!isAllowed) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  } catch {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  }

  return null;
}
