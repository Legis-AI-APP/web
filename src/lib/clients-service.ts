import { ReadonlyHeaders } from "next/dist/server/web/spec-extension/adapters/headers";
import { LegisFile } from "./legis-file";
import { apiUrl } from "./api";

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

export const getClient = async (clientId: string, headers: ReadonlyHeaders) => {
  const cookieHeader = headers.get("cookie") || "";
  const response = await fetch(`${apiUrl}/api/clients/${clientId}`, {
    headers: {
      Cookie: cookieHeader,
    },
  });
  if (!response.ok) throw new Error(await response.json());
  return response.json() as Promise<Client>;
};

export const createClient = async (client: Omit<Client, "id">) => {
  const response = await fetch(`/api/clients`, {
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

export const getClientFiles = async (
  caseId: string,
  headers: ReadonlyHeaders
) => {
  const cookieHeader = headers.get("cookie") || "";
  const response = await fetch(`${apiUrl}/api/clients/${caseId}/files`, {
    headers: {
      Cookie: cookieHeader,
    },
  });
  if (!response.ok) throw new Error(await response.json());
  return response.json() as Promise<LegisFile[]>;
};

export async function uploadClientFile(clientId: string, file: File) {
  const form = new FormData();
  form.append("file", file);
  await fetch(`/api/clients/${clientId}/upload`, {
    method: "POST",
    body: form,
    credentials: "include",
  });
}
