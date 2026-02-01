import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { apiUrl } from "./lib/api";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("session")?.value || null;
  const targetUrl = `${apiUrl}${request.nextUrl.pathname}${request.nextUrl.search}`;
  const headers = new Headers(request.headers);
  headers.set("Authorization", `Bearer ${token}`);
  headers.delete("host");
  headers.delete("cookie");
  return NextResponse.rewrite(new URL(targetUrl), {
    request: {
      headers,
    },
  });
}

export const config = {
  matcher: "/api/:path*",
};
