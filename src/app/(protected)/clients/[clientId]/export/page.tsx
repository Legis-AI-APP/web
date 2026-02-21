import Link from "next/link";
import { getClient, getClientFiles } from "@/lib/clients-service";

export default async function Page({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;
  const [client, files] = await Promise.all([getClient(clientId), getClientFiles(clientId)]);

  const fullName = [client.first_name, client.last_name].filter(Boolean).join(" ") || "(sin nombre)";

  return (
    <div className="print-page max-w-3xl mx-auto space-y-6">
      <div className="print-hide flex items-center justify-between gap-3">
        <Link
          href={`/clients/${clientId}/overview`}
          className="text-sm text-muted-foreground hover:underline"
        >
          ← Volver al cliente
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
