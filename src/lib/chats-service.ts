import { ReadonlyHeaders } from "next/dist/server/web/spec-extension/adapters/headers";
import { apiUrl } from "./api";

export type Chat = {
  id: string;
  messages: ChatMessage[];
};

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export const getChats = async (
  headers: ReadonlyHeaders
): Promise<Omit<Chat, "messages">[]> => {
  const response = await fetch(`${apiUrl}/api/chats`, {
    headers,
  });
    console.log("Fetching chats from:", `${apiUrl}/api/chats`);
    console.log(response.status, response.statusText);

  if (!response.ok) throw new Error(await response.json());
  return response.json();
};

export const getChat = async (
  chatId: string,
  headers: ReadonlyHeaders
): Promise<Chat> => {
  const response = await fetch(`${apiUrl}/api/chats/${chatId}`, {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    throw new Error("Error al obtener el chat");
  }

  return response.json();
};
