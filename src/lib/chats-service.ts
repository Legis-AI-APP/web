"use server";

import { apiUrl } from "./api";
import { cookies } from "next/headers";

export type Chat = {
  id: string;
  title: string;
  messages: ChatMessage[];
};

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export const getChats = async () => {
  const requestCookies = await cookies();
  const token = requestCookies.get("session")?.value || "";

  const response = await fetch(`${apiUrl}/api/chats`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) throw new Error(await response.json());
  return response.json() as Promise<Omit<Chat, "messages">[]>;
};

export const getChat = async (chatId: string) => {
  const requestCookies = await cookies();
  const token = requestCookies.get("session")?.value || "";

  const response = await fetch(`${apiUrl}/api/chats/${chatId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(await response.json());
  }

  return response.json() as Promise<Chat>;
};

export const createChat = async () => {
  const requestCookies = await cookies();
  const token = requestCookies.get("session")?.value || "";

  const response = await fetch(`${apiUrl}/api/chats`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) throw new Error(await response.json());
  return response.json() as Promise<{ chat_id: string }>;
};
