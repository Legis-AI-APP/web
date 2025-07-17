/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Folder, Home, Menu, LogOut } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { logout } from "@/lib/auth-service";

export default function Sidebar() {
  const [expanded, setExpanded] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const items = [
    { label: "Inicio", icon: Home, path: "/" },
    { label: "Casos", icon: Folder, path: "/cases" },
    { label: "Clientes", icon: Folder, path: "/clients" },
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
        "bg-muted h-screen p-2 border-r flex flex-col justify-between transition-all duration-300 ease-in-out",
        expanded ? "w-[200px]" : "w-[60px]"
      )}
    >
      <div>
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
      </div>

      <Button
        variant="ghost"
        onClick={handleLogout}
        className="w-full justify-start mt-4 text-sm"
      >
        <LogOut className="h-4 w-4 mr-2" />
        {expanded && "Cerrar sesión"}
      </Button>
    </aside>
  );
}
