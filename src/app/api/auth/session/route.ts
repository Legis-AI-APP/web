import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const response = NextResponse.json({ status: "ok" });
  response.cookies.set("session", body.id_token, {
    httpOnly: true,
    sameSite: "lax",
  });
  return response;
}
