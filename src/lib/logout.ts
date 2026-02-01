"use server";

import { cookies } from "next/headers";

export async function logout() {
  const requestCookies = await cookies();
  requestCookies.delete("session");
}
