/* eslint-disable @typescript-eslint/no-unused-vars */
import Sidebar from "@/components/Sidebar";
import { getChats } from "@/lib/chats-service";
import { redirect } from "next/navigation";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    const chats = await getChats();
    return (
      <div className="flex min-h-screen">
        <Sidebar chats={chats} />
        <main className="flex flex-col flex-1 p-6 max-h-screen overflow-hidden">
          {children}
        </main>
      </div>
    );
  } catch (error: unknown) {
    redirect("/login");
  }
}
