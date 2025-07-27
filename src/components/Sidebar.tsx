/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Folder, Home, Menu, LogOut, MessageCircle, User } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { logout } from "@/lib/auth-service";
import { Chat } from "@/lib/chats-service";

type SidebarProps = {
  chats: Omit<Chat, "messages">[];
};

export default function Sidebar({ chats }: SidebarProps) {
  const [expanded, setExpanded] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const items = [
    { label: "Inicio", icon: Home, path: "/" },
    { label: "Casos", icon: Folder, path: "/cases" },
    { label: "Clientes", icon: User, path: "/clients" },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Sesión cerrada correctamente");
    } catch (err: any) {
      toast.error("No se pudo cerrar la sesión");
    }
  };

  return (
    <aside
      className={cn(
        "bg-muted h-screen border-r flex flex-col transition-all duration-300 ease-in-out",
        expanded ? "w-[200px]" : "w-[60px]"
      )}
    >
      {/* Parte superior */}
      <div className="p-2 flex flex-col flex-shrink-0">
        <div
          className={cn(
            "mb-4",
            expanded ? "flex justify-end" : "flex justify-center"
          )}
        >
          <Button variant="ghost" onClick={() => setExpanded(!expanded)}>
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex flex-col gap-2">
          {items.map(({ label, icon: Icon, path }) => (
            <Button
              key={path}
              onClick={() => router.push(path)}
              variant={pathname === path ? "default" : "ghost"}
              className="justify-start w-full"
            >
              <Icon className="mr-2 h-4 w-4" />
              {expanded && label}
            </Button>
          ))}
        </div>
      </div>

      {/* Chats recientes */}
      {expanded && (
        <div className="mt-4 pt-2 border-t flex-1 flex flex-col overflow-hidden">
          <p className="text-xs text-muted-foreground px-2 mb-1">
            Chats recientes
          </p>

          <div className="flex-1 overflow-y-auto px-2 flex flex-col gap-1 overflow-ellipsis">
            {chats.toReversed().map((chat) => (
              <Button
                key={chat.id}
                variant={pathname === `/chat/${chat.id}` ? "default" : "ghost"}
                onClick={() => router.push(`/chat/${chat.id}`)}
                className="justify-start w-full text-sm truncate overflow-ellipsis"
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                {`${chat.title}`}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Parte inferior */}
      <div className="p-2 flex-shrink-0">
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full justify-start text-sm"
        >
          <LogOut className="h-4 w-4 mr-2" />
          {expanded && "Cerrar sesión"}
        </Button>
      </div>
    </aside>
  );
}
