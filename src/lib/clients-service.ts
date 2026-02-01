"use server";

import { LegisFile } from "./legis-file";
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
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
  });
  if (!response.ok) throw new Error(await response.json());
  return response.json() as Promise<Client[]>;
};

export const getClient = async (clientId: string) => {
  const requestCookies = await cookies();
  const token = requestCookies.get("session")?.value || "";
  const response = await fetch(`${apiUrl}/api/clients/${clientId}`, {
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
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
      Authorization: token ? `Bearer ${token}` : "",
    },
    body: JSON.stringify(client),
  });
  if (!response.ok) throw new Error(await response.json());
  return response.json() as Promise<Client>;
};

export const getClientFiles = async (caseId: string) => {
  const requestCookies = await cookies();
  const token = requestCookies.get("session")?.value || "";
  const response = await fetch(`${apiUrl}/api/clients/${caseId}/files`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error(await response.json());
  return response.json() as Promise<LegisFile[]>;
};

export async function uploadClientFile(clientId: string, file: File) {
  const requestCookies = await cookies();
  const token = requestCookies.get("session")?.value || "";
  const form = new FormData();
  form.append("file", file);
  await fetch(`${apiUrl}/api/clients/${clientId}/upload`, {
    method: "POST",
    body: form,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
