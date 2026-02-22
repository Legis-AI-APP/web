import type { Metadata } from "next";
import PrintButton from "@/components/PrintButton";
import { getCase, getCaseEvents, getCaseFiles } from "@/lib/cases-service";
import { getClient } from "@/lib/clients-service";
import CasePage from "../CasePage";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ caseId: string }>;
}): Promise<Metadata> {
  const { caseId } = await params;
  const c = await getCase(caseId);
  return {
    title: `Export — ${c.title}`,
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ caseId: string }>;
}) {
  const { caseId } = await params;

  const [oldCase, filesRaw, eventsRaw] = await Promise.all([
    getCase(caseId),
    getCaseFiles(caseId),
    getCaseEvents(caseId),
  ]);

  const files = [...filesRaw].sort((a, b) => a.name.localeCompare(b.name));
  const events = [...eventsRaw].sort((a, b) => {
    const at = a.created_at ? Date.parse(a.created_at) : 0;
    const bt = b.created_at ? Date.parse(b.created_at) : 0;
    return bt - at;
  });

  const client = oldCase.client_id ? await getClient(oldCase.client_id).catch(() => null) : null;
  const clientName = client ? `${client.first_name} ${client.last_name}`.trim() : undefined;

  return (
    <CasePage
      oldCase={oldCase}
      clientName={clientName}
      contextLabel="Export"
      rightPanelPadding={false}
      rightPanelContent={
        <div className="print-page max-w-3xl mx-auto space-y-6">
          <div className="print-hide flex items-center justify-end gap-3">
            <PrintButton />
          </div>

          <header className="space-y-1">
            <h1 className="text-2xl font-semibold">Export — Caso</h1>
            <div className="text-sm text-muted-foreground">{oldCase.title}</div>
          </header>

          <section className="space-y-2">
            <h2 className="text-sm font-semibold">Datos</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="rounded-standard border border-border p-3">
                <div className="text-xs text-muted-foreground">Estado</div>
                <div>{oldCase.status || "—"}</div>
              </div>
              <div className="rounded-standard border border-border p-3">
                <div className="text-xs text-muted-foreground">Cliente</div>
                <div>
                  {client
                    ? [client.first_name, client.last_name].filter(Boolean).join(" ") || client.id
                    : oldCase.client_id || "—"}
                </div>
                {client?.email && (
                  <div className="text-xs text-muted-foreground">{client.email}</div>
                )}
              </div>
              <div className="rounded-standard border border-border p-3">
                <div className="text-xs text-muted-foreground">Creado</div>
                <div>
                  {oldCase.created_at ? new Date(oldCase.created_at).toLocaleString() : "—"}
                </div>
              </div>
              <div className="rounded-standard border border-border p-3">
                <div className="text-xs text-muted-foreground">Actualizado</div>
                <div>
                  {oldCase.updated_at ? new Date(oldCase.updated_at).toLocaleString() : "—"}
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-semibold">Descripción</h2>
            <div className="rounded-standard border border-border p-3 text-sm whitespace-pre-wrap">
              {oldCase.description || "(sin descripción)"}
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
      }
    />
  );
}
