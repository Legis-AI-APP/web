import { NextRequest } from "next/server";
import { apiUrl } from "@/lib/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  const token = req.cookies.get("session")?.value;
  if (!token) return new Response("Missing session", { status: 401 });

  const { clientId } = await params;

  const upstream = await fetch(`${apiUrl}/api/clients/${clientId}`, {
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
