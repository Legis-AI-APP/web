import { getChat } from "@/lib/chats-service";
import ChatPage from "./ChatPage";
import { headers } from "next/headers";

type PageProps = {
  params: Promise<{
    chatId: string;
  }>;
};

export default async function Page({ params }: PageProps) {
  const headersList = await headers();
  const { chatId } = await params;
  const chat = await getChat(chatId, headersList);
  return <ChatPage chatId={chatId} initialMessages={chat.messages} />;
}
