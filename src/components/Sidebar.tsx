/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { logout } from "@/lib/auth-service";
import { Chat } from "@/lib/chats-service";
import {
  FolderOpen as Folder,
  Home,
  LogOut,
  Menu,
  MessageSquare as MessageCircle,
  Users as User,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";

type SidebarProps = {
  chats: Omit<Chat, "messages">[];
};

export default function Sidebar({ chats }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const [expanded, setExpanded] = useState(false); // solo desktop
  const [open, setOpen] = useState(false); // solo mobile (sheet)

  const items = useMemo(
    () => [
      { label: "Dashboard", icon: Home, path: "/" },
      { label: "Clientes", icon: User, path: "/clients" },
      { label: "Casos", icon: Folder, path: "/cases" },
      { label: "Documentos", icon: MessageCircle, path: "/documents" },
    ],
    []
  );

  const isActive = (path: string) => {
    if (path === "/") {
      return pathname === "/" || pathname === "/dashboard";
    }
    return pathname.startsWith(path);
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Sesión cerrada correctamente");
      router.push("/login");
    } catch (err: any) {
      toast.error("No se pudo cerrar la sesión");
    }
  };

  // ---- UI chunk reutilizable (lovable-style) ----
  const NavContent = (
    <div className="p-2 h-full flex flex-col">
      {/* Main Navigation */}
      <div>
        <div className="space-y-1">
          {items.map(({ label, icon: Icon, path }) => {
            const active = isActive(path);
            return (
              <button
                key={path}
                onClick={() => {
                  router.push(path);
                  if (isMobile) setOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-2 p-2 pt-1.5 pb-1.5 rounded-md text-sm transition-all duration-200",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent/50",
                  expanded ? null : "justify-center",
                  isMobile ? "justify-start" : null
                )}
              >
                <Icon className="h-4 w-4 min-w-4" />
                {(!isMobile && expanded) || isMobile ? (
                  <span>{label}</span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick Actions (opcional) */}
      {((!isMobile && expanded) || isMobile) && (
        <div className="mt-2 space-y-2" />
      )}

      {/* Chats recientes */}
      {((!isMobile && expanded) || isMobile) && (
        <div className="mt-5 pt-2 border-t flex-1 flex flex-col overflow-hidden">
          <p className="mt-1 mb-2 text-xs text-muted-foreground px-1.5">
            Chats recientes
          </p>

          <div className="flex-1 overflow-y-auto flex flex-col gap-1">
            {chats
              .toReversed()
              .slice(0, 30)
              .map((chat) => {
                const active = pathname === `/chat/${chat.id}`;
                return (
                  <button
                    key={chat.id}
                    onClick={() => {
                      router.push(`/chat/${chat.id}`);
                      if (isMobile) setOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center gap-2 pt-2 pb-2 rounded-md text-sm transition-all duration-200 truncate px-2",
                      active
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-accent/50"
                    )}
                    title={chat.title}
                  >
                    <span className="truncate text-[13px]">{chat.title}</span>
                  </button>
                );
              })}
          </div>
        </div>
      )}

      {/* Footer - Logout Button */}
      <div className="mt-auto pt-2">
        <Button
          variant="ghost"
          onClick={handleLogout}
          className={cn(
            "w-full justify-center text-sm",
            !isMobile && !expanded && "justify-center"
          )}
        >
          <LogOut className="h-4 w-4" />
          {((!isMobile && expanded) || isMobile) && (
            <span className="ml-2">Cerrar sesión</span>
          )}
        </Button>
      </div>
    </div>
  );

  // ======================
  // Mobile: Sheet
  // ======================
  if (isMobile) {
    return (
      <div className="md:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="fixed top-2 left-2 z-50 rounded-full bg-card/60 backdrop-blur-sm shadow-sm hover:bg-card"
              aria-label="Abrir menú"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="p-0 w-64 bg-background/80 backdrop-blur-sm border-r"
          >
            <div className="pt-16">
              {NavContent}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    );
  }

  // ======================
  // Desktop: Sidebar flotante (fixed) + espaciador invisible
  // ======================
  return (
    <>
      {/* Espaciador en el flujo: evita que el sidebar tape el contenido */}
      <div
        aria-hidden
        className={cn("hidden md:block", expanded ? "w-56" : "w-16")}
      />

      {/* Barra flotante al costado */}
      <aside
        role="navigation"
        aria-label="Sidebar"
        className={cn(
          "hidden md:flex fixed top-4 left-4 z-40",
          "h-[calc(100dvh-2rem)]", // alto flotante (con margen)
          "rounded-2xl border bg-background/85 backdrop-blur-md",
          "flex-col transition-all duration-300 ease-in-out",
          expanded ? "w-56" : "w-16"
        )}
        style={{
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.03)'
        }}
      >
        {/* Toggle */}
        <div
          className={cn(
            "pt-2 px-2",
            expanded ? "flex justify-end" : "flex justify-center"
          )}
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setExpanded((v) => !v)}
            className="rounded-full"
            aria-label="Colapsar/expandir menú"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        {/* Contenido con scroll interno si hace falta */}
        <div className="flex-1 overflow-hidden flex flex-col">{NavContent}</div>
      </aside>
    </>
  );
}
