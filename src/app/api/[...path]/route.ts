import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function handler(request: NextRequest) {
  const path = request.nextUrl.pathname.replace(/^\/api\//, "");
  const url = `${process.env.NEXT_PUBLIC_API_URL}/api/${path}${request.nextUrl.search}`;

  const headers = new Headers(request.headers);
  const init: RequestInit = {
    method: request.method,
    headers,
    body: ["GET", "HEAD"].includes(request.method)
      ? undefined
      : await request.arrayBuffer(),
  };

  const upstream = await fetch(url, init);

  const response = new NextResponse(upstream.body, { status: upstream.status });
  upstream.headers.forEach((v, k) => response.headers.set(k, v));
  return response;
}

export {
  handler as GET,
  handler as POST,
  handler as PUT,
  handler as PATCH,
  handler as DELETE,
  handler as OPTIONS,
};
