import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { apiUrl } from "@/lib/api";

export async function GET(
  _request: Request,
  props: { params: Promise<{ caseId: string }> }
) {
  const { caseId } = await props.params;
  const requestCookies = await cookies();
  const token = requestCookies.get("session")?.value || "";

  const url = new URL(`${apiUrl}/api/cases/${caseId}/events`);
  const type = new URL(_request.url).searchParams.get("type");
  if (type) url.searchParams.set("type", type);

  const res = await fetch(url.toString(), {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const text = await res.text();
  return new NextResponse(text, {
    status: res.status,
    headers: {
      "Content-Type": res.headers.get("Content-Type") ?? "application/json",
    },
  });
}

export async function POST(
  request: Request,
  props: { params: Promise<{ caseId: string }> }
) {
  const { caseId } = await props.params;
  const requestCookies = await cookies();
  const token = requestCookies.get("session")?.value || "";

  const body = await request.text();

  const res = await fetch(`${apiUrl}/api/cases/${caseId}/events`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body,
  });

  const text = await res.text();
  return new NextResponse(text, {
    status: res.status,
    headers: {
      "Content-Type": res.headers.get("Content-Type") ?? "application/json",
    },
  });
}
