import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.warn("[CSP Violation]", JSON.stringify(body, null, 2));
  } catch {
    // CSP reports may come as text/plain from some browsers
  }
  return new NextResponse(null, { status: 204 });
}
