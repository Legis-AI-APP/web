import { apiUrl } from "./api";
import { ReadonlyHeaders } from "next/dist/server/web/spec-extension/adapters/headers";

export interface Case {
  id: string;
  title: string;
  description: string;
  status: string;
  createdDate: string;
  updatedDate: string;
  clientId: string;
}

export type CaseFile = {
  name: string;
  url: string;
};

export const getCases = async (headers: ReadonlyHeaders) => {
  const cookieHeader = headers.get("cookie") || "";
  const response = await fetch(`${apiUrl}/api/cases`, {
    headers: {
      Cookie: cookieHeader,
    },
  });
  if (!response.ok) throw new Error(await response.json());
  const data = await response.json();
  return data as Case[];
};

export const getCase = async (caseId: string, headers: ReadonlyHeaders) => {
  const cookieHeader = headers.get("cookie") || "";
  const response = await fetch(`${apiUrl}/api/cases/${caseId}`, {
    headers: {
      Cookie: cookieHeader,
    },
  });
  if (!response.ok) throw new Error(await response.json());
  return response.json() as Promise<Case>;
};

export const createCase = async (
  data: Omit<Case, "id" | "createdDate" | "updatedDate" | "status">
) => {
  const response = await fetch(`${apiUrl}/api/cases`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error(await response.json());
  return response.json() as Promise<Case>;
};

export const getFiles = async (caseId: string, headers: ReadonlyHeaders) => {
  const cookieHeader = headers.get("cookie") || "";
  const response = await fetch(`${apiUrl}/api/cases/${caseId}/files`, {
    headers: {
      Cookie: cookieHeader,
    },
  });
  if (!response.ok) throw new Error(await response.json());
  return response.json() as Promise<CaseFile[]>;
};

export const uploadFile = async (caseId: string, file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await fetch(`${apiUrl}/api/cases/${caseId}/upload`, {
    method: "POST",
    body: formData,
    credentials: "include",
  });
  if (!response.ok) throw new Error(await response.json());
  return response.json() as Promise<CaseFile>;
};
