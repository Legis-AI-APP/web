import { apiUrl } from "@/lib/api";
import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  const token = req.cookies.get("session")?.value;
  if (!token) return new Response("Missing session", { status: 401 });

  const { clientId } = await params;

  const upstream = await fetch(`${apiUrl}/api/clients/${clientId}/chats`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const text = await upstream.text();
  return new Response(text, {
    status: upstream.status,
    headers: {
      "Content-Type": upstream.headers.get("content-type") || "application/json",
    },
  });
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  const token = req.cookies.get("session")?.value;
  if (!token) return new Response("Missing session", { status: 401 });

  const { clientId } = await params;

  const upstream = await fetch(`${apiUrl}/api/clients/${clientId}/chats`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const text = await upstream.text();
  return new Response(text, {
    status: upstream.status,
    headers: {
      "Content-Type": upstream.headers.get("content-type") || "application/json",
    },
  });
}
