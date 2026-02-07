import { getChat } from "@/lib/chats-service";
import ChatPage from "./ChatPage";

type PageProps = {
  params: Promise<{
    chatId: string;
  }>;
};

export default async function Page({ params }: PageProps) {
  const { chatId } = await params;
  const chat = await getChat(chatId);
  return <ChatPage chatId={chatId} initialMessages={chat.messages} />;
}
