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
    <Button type="button" variant="outline" className={className} onClick={() => window.print()}>
      <Printer className="h-4 w-4 mr-2" />
      {label}
    </Button>
  );
}
