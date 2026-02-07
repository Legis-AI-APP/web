import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function apiUrl() {
  return process.env.API_URL || "http://localhost:8080";
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get("session")?.value;
  if (!token) {
    return new Response("Missing session", { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const upstream = await fetch(`${apiUrl()}/api/ai/ask`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      Accept: "text/event-stream",
    },
    body: JSON.stringify(body),
    // @ts-expect-error - duplex is required for streaming in some Node fetch implementations
    duplex: "half",
  });

  if (!upstream.ok) {
    const text = await upstream.text().catch(() => "");
    return new Response(text || "Upstream error", { status: upstream.status });
  }

  return new Response(upstream.body, {
    status: 200,
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
