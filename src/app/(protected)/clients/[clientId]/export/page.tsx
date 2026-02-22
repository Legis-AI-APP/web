import type { Metadata } from "next";
import PrintButton from "@/components/PrintButton";
import { getClient, getClientCases, getClientFiles, getClientPersons } from "@/lib/clients-service";
import ClientPage from "../ClientPage";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ clientId: string }>;
}): Promise<Metadata> {
  const { clientId } = await params;
  const c = await getClient(clientId);
  const fullName = [c.first_name, c.last_name].filter(Boolean).join(" ") || c.id;
  return {
    title: `Export — ${fullName}`,
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;
  const [client, filesRaw, casesRaw, personsRaw] = await Promise.all([
    getClient(clientId),
    getClientFiles(clientId),
    getClientCases(clientId),
    getClientPersons(clientId),
  ]);

  const files = [...filesRaw].sort((a, b) => a.name.localeCompare(b.name));
  const cases = [...casesRaw].sort((a, b) => a.title.localeCompare(b.title));
  const persons = [...personsRaw].sort((a, b) => a.name.localeCompare(b.name));

  const fullName = [client.first_name, client.last_name].filter(Boolean).join(" ") || "(sin nombre)";

  return (
    <ClientPage
      client={client}
      files={[]}
      contextLabel="Export"
      rightPanelPadding={false}
      rightPanelContent={
        <div className="print-page max-w-3xl mx-auto space-y-6">
          <div className="print-hide flex items-center justify-end gap-3">
            <PrintButton />
          </div>

          <header className="space-y-1">
            <h1 className="text-2xl font-semibold">Export — Cliente</h1>
            <div className="text-sm text-muted-foreground">{fullName}</div>
          </header>

          <section className="space-y-2">
            <h2 className="text-sm font-semibold">Datos</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="rounded-standard border border-border p-3">
                <div className="text-xs text-muted-foreground">Email</div>
                <div>{client.email || "—"}</div>
              </div>
              <div className="rounded-standard border border-border p-3">
                <div className="text-xs text-muted-foreground">Teléfono</div>
                <div>{client.phone || "—"}</div>
              </div>
              <div className="rounded-standard border border-border p-3">
                <div className="text-xs text-muted-foreground">Documento</div>
                <div>
                  {[client.document_type, client.document].filter(Boolean).join(" ") || "—"}
                </div>
              </div>
              <div className="rounded-standard border border-border p-3">
                <div className="text-xs text-muted-foreground">Dirección</div>
                <div>{client.address || "—"}</div>
              </div>
            </div>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-semibold">Personas ({persons.length})</h2>
            {persons.length === 0 ? (
              <div className="text-sm text-muted-foreground">Sin personas asociadas.</div>
            ) : (
              <ul className="space-y-2">
                {persons.map((p) => (
                  <li key={p.id} className="rounded-standard border border-border p-3">
                    <div className="text-sm font-medium">{p.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {[p.role, p.relationship].filter(Boolean).join(" · ")}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {[p.email ?? undefined, p.phone ?? undefined].filter(Boolean).join(" · ")}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-semibold">Casos ({cases.length})</h2>
            {cases.length === 0 ? (
              <div className="text-sm text-muted-foreground">Sin casos asociados.</div>
            ) : (
              <ul className="space-y-2">
                {cases.map((c) => (
                  <li key={c.id} className="rounded-standard border border-border p-3">
                    <div className="text-sm font-medium">{c.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {[c.status, c.id].filter(Boolean).join(" · ")}
                    </div>
                  </li>
                ))}
              </ul>
            )}
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

          <footer className="pt-2 text-xs text-muted-foreground">
            Generado desde LEGIS AI · {new Date().toLocaleString()}
          </footer>
        </div>
      }
    />
  );
}
