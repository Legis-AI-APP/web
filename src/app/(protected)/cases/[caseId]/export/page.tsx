import Link from "next/link";
import PrintButton from "@/components/PrintButton";
import { getCase, getCaseEvents, getCaseFiles } from "@/lib/cases-service";
import { getClient } from "@/lib/clients-service";

export default async function Page({
  params,
}: {
  params: Promise<{ caseId: string }>;
}) {
  const { caseId } = await params;
  const [c, files, events] = await Promise.all([
    getCase(caseId),
    getCaseFiles(caseId),
    getCaseEvents(caseId),
  ]);

  const client = c.client_id ? await getClient(c.client_id).catch(() => null) : null;
  const clientName = client
    ? [client.first_name, client.last_name].filter(Boolean).join(" ") || client.id
    : c.client_id || "—";

  return (
    <div className="print-page max-w-3xl mx-auto space-y-6">
      <div className="print-hide flex items-center justify-between gap-3">
        <Link href={`/cases/${caseId}/overview`} className="text-sm text-muted-foreground hover:underline">
          ← Volver al caso
        </Link>
        <PrintButton />
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
            <div>{clientName}</div>
            {client?.email && <div className="text-xs text-muted-foreground">{client.email}</div>}
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
                <a
                  href={f.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-muted-foreground break-all hover:underline"
                >
                  {f.url}
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold">Actividad ({events.length})</h2>
        {events.length === 0 ? (
          <div className="text-sm text-muted-foreground">Sin actividad registrada.</div>
        ) : (
          <ul className="space-y-2">
            {events.map((e) => (
              <li key={e.id} className="rounded-standard border border-border p-3">
                <div className="text-sm font-medium">{e.title}</div>
                {e.created_at && (
                  <div className="text-xs text-muted-foreground">
                    {new Date(e.created_at).toLocaleString()}
                  </div>
                )}
                {e.description && (
                  <div className="text-sm text-muted-foreground whitespace-pre-wrap mt-2">
                    {e.description}
                  </div>
                )}

                {e.file_urls?.length ? (
                  <div className="mt-2 space-y-1">
                    <div className="text-xs font-medium text-muted-foreground">Adjuntos</div>
                    <ul className="space-y-1">
                      {e.file_urls.map((u) => (
                        <li key={u} className="text-xs text-muted-foreground break-all">
                          <a
                            href={u}
                            target="_blank"
                            rel="noreferrer"
                            className="hover:underline"
                          >
                            {u}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
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
