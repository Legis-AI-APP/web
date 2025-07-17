import { ReadonlyHeaders } from "next/dist/server/web/spec-extension/adapters/headers";
import { apiUrl } from "./api";

export interface Client {
  id: number;
  name: string;
  email: string;
  document: string;
}

export const getClients = async (headers: ReadonlyHeaders) => {
  const cookieHeader = headers.get("cookie") || "";

  const response = await fetch(`${apiUrl}/api/clients`, {
    headers: {
      Cookie: cookieHeader,
    },
  });
  if (!response.ok) throw new Error(await response.json());
  return response.json() as Promise<Client[]>;
};

export const createClient = async (client: Client) => {
  const response = await fetch(`${apiUrl}/api/clients`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(client),
  });
  if (!response.ok) throw new Error(await response.json());
  return response.json() as Promise<Client>;
};
