import { NextRequest } from "next/server";
import { apiUrl } from "@/lib/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ chatId: string }> }
) {
  const token = req.cookies.get("session")?.value;
  if (!token) return new Response("Missing session", { status: 401 });

  const { chatId } = await params;

  const upstream = await fetch(`${apiUrl}/api/chats/${chatId}`, {
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
