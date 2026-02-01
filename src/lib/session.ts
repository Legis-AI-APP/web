"use server";

import { cookies } from "next/headers";

export async function createSession(data: { idToken: string }) {
  const requestCookies = await cookies();
  requestCookies.set("session", data.idToken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
  });
}
