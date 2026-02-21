"use client";

export default function PrintButton({
  label = "Imprimir / Guardar PDF",
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      className={
        className ??
        "rounded-standard border border-border px-3 py-2 text-sm hover:bg-muted/40"
      }
      onClick={() => window.print()}
    >
      {label}
    </button>
  );
}
