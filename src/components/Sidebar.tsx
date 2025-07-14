"use client";

import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Folder, Home, Menu } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function Sidebar() {
  const [expanded, setExpanded] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  const items = [
    { label: "Inicio", icon: Home, path: "/" },
    { label: "Casos", icon: Folder, path: "/cases" },
    { label: "Clientes", icon: Folder, path: "/clients" },
  ];

  return (
    <aside
      className={cn(
        "bg-muted h-screen p-2 border-r transition-all duration-300 ease-in-out",
        expanded ? "w-[200px]" : "w-[60px]"
      )}
    >
      <Button
        variant="ghost"
        className="w-full mb-4"
        onClick={() => setExpanded(!expanded)}
      >
        <Menu className="h-5 w-5" />
      </Button>

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
    </aside>
  );
}
