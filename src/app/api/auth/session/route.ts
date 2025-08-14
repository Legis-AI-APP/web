import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.json();

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/auth/session`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    }
  );

  const data = await response.json();
  const nextResponse = NextResponse.json(data, { status: response.status });

  const setCookie = response.headers.get("set-cookie");
  if (setCookie) {
    const m = /(?:^|;\s*)session=([^;]+)/i.exec(setCookie);
    const maxAge = /max-age=([^;]+)/i.exec(setCookie)?.[1];
    if (m) {
      nextResponse.headers.append(
        "Set-Cookie",
        `session=${m[1]}; Path=/; HttpOnly; Secure; SameSite=Lax${
          maxAge ? `; Max-Age=${maxAge}` : ""
        }`
      );
    }
  }

  return nextResponse;
}
