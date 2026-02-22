"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

export type EntitySubnavItem = {
  label: string;
  href: string;
};

export default function EntitySubnav({
  items,
}: {
  items: EntitySubnavItem[];
}) {
  const pathname = usePathname();

  return (
    <div className="flex gap-2 overflow-x-auto whitespace-nowrap pb-1">
      {items.map((it) => {
        const active = pathname === it.href || pathname.startsWith(it.href + "/");
        return (
          <Link
            key={it.href}
            href={it.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs border transition",
              active
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background hover:bg-accent/40 border-border"
            )}
          >
            {it.label}
          </Link>
        );
      })}
    </div>
  );
}
