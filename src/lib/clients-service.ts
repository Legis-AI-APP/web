"use server";

import { LegisFile } from "./legis-file";
import type { Case } from "./cases-service";
import type { ClientPersonDto } from "./client-persons";
import { apiUrl } from "./api";
import { cookies } from "next/headers";

export interface Client {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  document: string;
  document_type: string;
  phone: string;
  address: string;
}

export const getClients = async () => {
  const requestCookies = await cookies();
  const token = requestCookies.get("session")?.value || "";
  const response = await fetch(`${apiUrl}/api/clients`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!response.ok) throw new Error(await response.json());
  return response.json() as Promise<Client[]>;
};

export const getClient = async (clientId: string) => {
  const requestCookies = await cookies();
  const token = requestCookies.get("session")?.value || "";
  const response = await fetch(`${apiUrl}/api/clients/${clientId}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!response.ok) throw new Error(await response.json());
  return response.json() as Promise<Client>;
};

export const createClient = async (client: Omit<Client, "id">) => {
  const requestCookies = await cookies();
  const token = requestCookies.get("session")?.value || "";
  const response = await fetch(`${apiUrl}/api/clients`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(client),
  });
  if (!response.ok) throw new Error(await response.json());
  return response.json() as Promise<Client>;
};

export const getClientFiles = async (clientId: string) => {
  const requestCookies = await cookies();
  const token = requestCookies.get("session")?.value || "";
  const response = await fetch(`${apiUrl}/api/clients/${clientId}/files`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!response.ok) throw new Error(await response.json());
  return response.json() as Promise<LegisFile[]>;
};

export const getClientCases = async (clientId: string) => {
  const requestCookies = await cookies();
  const token = requestCookies.get("session")?.value || "";
  const response = await fetch(`${apiUrl}/api/clients/${clientId}/cases`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!response.ok) throw new Error(await response.json());
  const json = (await response.json()) as Array<Record<string, unknown>>;

  const pickString = (obj: Record<string, unknown>, key: string): string | undefined => {
    const v = obj[key];
    return typeof v === "string" ? v : undefined;
  };

  // Support both snake_case (web legacy) and camelCase (api contract)
  const normalized = json.map((c) => {
    const client_id = pickString(c, "client_id") ?? pickString(c, "clientId") ?? "";
    const created_at = pickString(c, "created_at") ?? pickString(c, "createdAt") ?? "";
    const updated_at = pickString(c, "updated_at") ?? pickString(c, "updatedAt") ?? "";

    return {
      ...(c as unknown as Case),
      client_id,
      created_at,
      updated_at,
    };
  });

  return normalized as Case[];
};

export const getClientPersons = async (clientId: string) => {
  const requestCookies = await cookies();
  const token = requestCookies.get("session")?.value || "";
  const response = await fetch(`${apiUrl}/api/clients/${clientId}/persons`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!response.ok) throw new Error(await response.json());
  const json = (await response.json()) as ClientPersonDto[];
  return json;
};

export async function uploadClientFile(clientId: string, file: File) {
  const requestCookies = await cookies();
  const token = requestCookies.get("session")?.value || "";
  const form = new FormData();
  form.append("file", file);
  await fetch(`${apiUrl}/api/clients/${clientId}/upload`, {
    method: "POST",
    body: form,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
}
