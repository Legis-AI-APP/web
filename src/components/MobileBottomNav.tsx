"use client";

import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { FolderOpen, Search, FilePenLine, LibraryBig } from "lucide-react";

const items = [
  { label: "Casos", icon: FolderOpen, path: "/cases" },
  { label: "Buscar", icon: Search, path: "/documents" },
  { label: "Redactor", icon: FilePenLine, path: "/chat" },
  { label: "Biblioteca", icon: LibraryBig, path: "/documents" },
] as const;

export default function MobileBottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (path: string) => {
    if (path === "/chat") return pathname.startsWith("/chat");
    return pathname === path || pathname.startsWith(path + "/");
  };

  return (
    <nav
      aria-label="Navegación"
      className={cn(
        "md:hidden fixed bottom-0 left-0 right-0 z-40",
        "border-t bg-background/85 backdrop-blur-md"
      )}
    >
      <div className="grid grid-cols-4 gap-1 p-2">
        {items.map(({ label, icon: Icon, path }) => {
          const active = isActive(path);
          return (
            <Button
              key={path}
              type="button"
              variant={active ? "default" : "ghost"}
              className="h-12 flex-col gap-1"
              onClick={() => router.push(path)}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[11px] leading-none">{label}</span>
            </Button>
          );
        })}
      </div>
    </nav>
  );
}
