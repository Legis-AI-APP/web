import Sidebar from "@/components/Sidebar";
import { getChats } from "@/lib/chats-service";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;
  const headersList = await headers();
  const upstream = new Headers(headersList);
  const chats = await getChats(upstream);

  if (chats instanceof Response) {
    if (chats.status === 401) {
      redirect("/login");
    } else {
      throw new Error(`Error fetching chats: ${chats.statusText}`);
    }
  }

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar chats={chats} />
      <main className="flex flex-col flex-1 p-6 max-h-screen overflow-hidden">
        {children}
      </main>
    </div>
  );
}
