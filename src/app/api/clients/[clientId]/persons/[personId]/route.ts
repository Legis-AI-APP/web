import { NextRequest } from "next/server";
import { apiUrl } from "@/lib/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ clientId: string; personId: string }> }
) {
  const token = req.cookies.get("session")?.value;
  if (!token) return new Response("Missing session", { status: 401 });

  const { clientId, personId } = await params;
  const body = await req.text();

  const upstream = await fetch(`${apiUrl}/api/clients/${clientId}/persons/${personId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body,
  });

  const text = await upstream.text();
  return new Response(text, {
    status: upstream.status,
    headers: {
      "Content-Type": upstream.headers.get("content-type") || "application/json",
    },
  });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ clientId: string; personId: string }> }
) {
  const token = req.cookies.get("session")?.value;
  if (!token) return new Response("Missing session", { status: 401 });

  const { clientId, personId } = await params;

  const upstream = await fetch(`${apiUrl}/api/clients/${clientId}/persons/${personId}`, {
    method: "DELETE",
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
