"use server";

import { LegisFile } from "./legis-file";
import { apiUrl } from "./api";
import { cookies } from "next/headers";

export interface Case {
  id: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
  updated_at: string;
  client_id: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  file_urls: string[];
  created_at: string;
}

export const getCases = async () => {
  const requestCookies = await cookies();
  const token = requestCookies.get("session")?.value || "";
  const response = await fetch(`${apiUrl}/api/cases`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error(await response.json());
  const data = await response.json();
  return data as Case[];
};

export const getCase = async (caseId: string) => {
  const requestCookies = await cookies();
  const token = requestCookies.get("session")?.value || "";
  const response = await fetch(`${apiUrl}/api/cases/${caseId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error(await response.json());
  return response.json() as Promise<Case>;
};

export const createCase = async (
  data: Omit<Case, "id" | "created_at" | "updated_at" | "status">,
) => {
  const requestCookies = await cookies();
  const token = requestCookies.get("session")?.value || "";
  const response = await fetch(`${apiUrl}/api/cases`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error(await response.json());
  return response.json() as Promise<Case>;
};

export const getCaseFiles = async (caseId: string) => {
  const requestCookies = await cookies();
  const token = requestCookies.get("session")?.value || "";
  const response = await fetch(`${apiUrl}/api/cases/${caseId}/files`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error(await response.json());
  return response.json() as Promise<LegisFile[]>;
};

export const uploadCaseFile = async (caseId: string, file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  const requestCookies = await cookies();
  const token = requestCookies.get("session")?.value || "";
  const response = await fetch(`${apiUrl}/api/cases/${caseId}/upload`, {
    method: "POST",
    body: formData,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error(await response.json());
  return response.json() as Promise<LegisFile>;
};

export const createCaseEvent = async (
  caseId: string,
  event: Omit<Event, "id" | "created_at">,
) => {
  const requestCookies = await cookies();
  const token = requestCookies.get("session")?.value || "";
  const response = await fetch(`${apiUrl}/api/cases/${caseId}/events`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(event),
  });
  if (!response.ok) throw new Error(await response.json());
  return response.json() as Promise<Event>;
};

export const getCaseEvents = async (caseId: string) => {
  const requestCookies = await cookies();
  const token = requestCookies.get("session")?.value || "";
  const response = await fetch(`${apiUrl}/api/cases/${caseId}/events`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error(await response.json());
  return response.json() as Promise<Event[]>;
};
