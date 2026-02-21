import Link from "next/link";
import { getCase, getCaseFiles } from "@/lib/cases-service";

export default async function Page({
  params,
}: {
  params: Promise<{ caseId: string }>;
}) {
  const { caseId } = await params;
  const [c, files] = await Promise.all([getCase(caseId), getCaseFiles(caseId)]);

  return (
    <div className="print-page max-w-3xl mx-auto space-y-6">
      <div className="print-hide flex items-center justify-between gap-3">
        <Link href={`/cases/${caseId}/overview`} className="text-sm text-muted-foreground hover:underline">
          ← Volver al caso
        </Link>
        <button
          type="button"
          className="rounded-standard border border-border px-3 py-2 text-sm hover:bg-muted/40"
          onClick={() => window.print()}
        >
          Imprimir / Guardar PDF
        </button>
      </div>

      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">Export — Caso</h1>
        <div className="text-sm text-muted-foreground">{c.title}</div>
      </header>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold">Datos</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div className="rounded-standard border border-border p-3">
            <div className="text-xs text-muted-foreground">Estado</div>
            <div>{c.status || "—"}</div>
          </div>
          <div className="rounded-standard border border-border p-3">
            <div className="text-xs text-muted-foreground">Cliente</div>
            <div>{c.client_id || "—"}</div>
          </div>
          <div className="rounded-standard border border-border p-3">
            <div className="text-xs text-muted-foreground">Creado</div>
            <div>{c.created_at ? new Date(c.created_at).toLocaleString() : "—"}</div>
          </div>
          <div className="rounded-standard border border-border p-3">
            <div className="text-xs text-muted-foreground">Actualizado</div>
            <div>{c.updated_at ? new Date(c.updated_at).toLocaleString() : "—"}</div>
          </div>
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold">Descripción</h2>
        <div className="rounded-standard border border-border p-3 text-sm whitespace-pre-wrap">
          {c.description || "(sin descripción)"}
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold">Documentos ({files.length})</h2>
        {files.length === 0 ? (
          <div className="text-sm text-muted-foreground">Sin documentos.</div>
        ) : (
          <ul className="space-y-2">
            {files.map((f) => (
              <li key={f.url || f.name} className="rounded-standard border border-border p-3">
                <div className="text-sm font-medium">{f.name}</div>
                <div className="text-xs text-muted-foreground break-all">{f.url}</div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <footer className="pt-2 text-xs text-muted-foreground">
        Generado desde LEGIS AI · {new Date().toLocaleString()}
      </footer>
    </div>
  );
}
