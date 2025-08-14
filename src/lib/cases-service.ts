import { ReadonlyHeaders } from "next/dist/server/web/spec-extension/adapters/headers";
import { LegisFile } from "./legis-file";
import { apiUrl } from "./api";

export interface Case {
  id: string;
  title: string;
  description: string;
  status: string;
  created_date: string;
  updated_date: string;
  client_id: string;
}

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
  data: Omit<Case, "id" | "created_date" | "updated_date" | "status">
) => {
  const response = await fetch(`/api/cases`, {
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

export const getCaseFiles = async (
  caseId: string,
  headers: ReadonlyHeaders
) => {
  const cookieHeader = headers.get("cookie") || "";
  const response = await fetch(`${apiUrl}/api/cases/${caseId}/files`, {
    headers: {
      Cookie: cookieHeader,
    },
  });
  if (!response.ok) throw new Error(await response.json());
  return response.json() as Promise<LegisFile[]>;
};

export const uploadCaseFile = async (caseId: string, file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await fetch(`/api/cases/${caseId}/upload`, {
    method: "POST",
    body: formData,
    credentials: "include",
  });
  if (!response.ok) throw new Error(await response.json());
  return response.json() as Promise<LegisFile>;
};
