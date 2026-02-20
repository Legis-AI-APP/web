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
      <div className="flex h-[100dvh] overflow-hidden">
        <Sidebar chats={chats} />
        {/*
          Default shell spacing matches the general pages.
          Full-screen pages can opt-out by wrapping content with -m-6.
        */}
        <main className="flex flex-col flex-1 min-w-0 min-h-0 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    );
  } catch (error: unknown) {
    redirect("/login");
  }
}
