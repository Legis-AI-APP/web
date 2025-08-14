import { NextResponse } from "next/server";
export const runtime = "nodejs";
export async function POST() {
  const response = NextResponse.json({ status: "ok" });
  response.headers.append(
    "Set-Cookie",
    "session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0"
  );
  return response;
}
