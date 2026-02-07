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

  const res = await fetch(`${apiUrl}/api/cases/${caseId}/files`, {
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
