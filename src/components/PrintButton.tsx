"use client";

import { Printer } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function PrintButton({
  label = "Imprimir / Guardar PDF",
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <Button
      type="button"
      variant="outline"
      className={className}
      onClick={() => {
        // Ensure we only print the intended export content (works even when embedded in the IA workspace)
        const root = document.documentElement;
        root.classList.add("print-mode");

        const cleanup = () => root.classList.remove("print-mode");
        window.addEventListener("afterprint", cleanup, { once: true });

        window.print();

        // Best-effort fallback cleanup
        window.setTimeout(cleanup, 3_000);
      }}
    >
      <Printer className="h-4 w-4 mr-2" />
      {label}
    </Button>
  );
}
