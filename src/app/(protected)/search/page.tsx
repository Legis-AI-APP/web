import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getCases } from "@/lib/cases-service";
import { getClients } from "@/lib/clients-service";

function normalize(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim();
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const query = normalize(q);

  const [cases, clients] = await Promise.all([getCases(), getClients()]);

  const matchedCases = query
    ? cases
        .filter((c) =>
          normalize([c.title, c.description, c.status].filter(Boolean).join(" ")).includes(query),
        )
        .sort((a, b) => a.title.localeCompare(b.title))
    : [];

  const matchedClients = query
    ? clients
        .filter((c) =>
          normalize(
            [
              c.first_name,
              c.last_name,
              c.email,
              c.document,
              c.document_type,
              c.phone,
              c.address,
            ]
              .filter(Boolean)
              .join(" "),
          ).includes(query),
        )
        .sort((a, b) => {
          const an = normalize([a.first_name, a.last_name].filter(Boolean).join(" "));
          const bn = normalize([b.first_name, b.last_name].filter(Boolean).join(" "));
          return an.localeCompare(bn);
        })
    : [];

  const hasResults = matchedCases.length > 0 || matchedClients.length > 0;
  const totalResults = matchedCases.length + matchedClients.length;

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Buscar</h1>
        <p className="text-sm text-muted-foreground">
          MVP: busca dentro de tus <b>casos</b> y <b>clientes</b>. Normativa/jurisprudencia viene después,
          con fuentes verificables.
        </p>
      </div>

      <Card className="border-0" style={{ boxShadow: "none" }}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Consulta</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="flex gap-2" action="/search" method="GET">
            <Input
              name="q"
              placeholder="Caso, cliente, email, DNI, palabra clave…"
              defaultValue={q}
              autoComplete="off"
            />
            <Button type="submit">Buscar</Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-0" style={{ boxShadow: "none" }}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Resultados</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!query ? (
            <div className="text-sm text-muted-foreground">Escribí una consulta para buscar.</div>
          ) : !hasResults ? (
            <div className="text-sm text-muted-foreground">Sin resultados para “{q}”.</div>
          ) : (
            <>
              <div className="text-xs text-muted-foreground">{totalResults} resultado(s)</div>

              {matchedCases.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-medium text-muted-foreground">
                    Casos ({matchedCases.length})
                  </div>
                  <div className="space-y-2">
                    {matchedCases.map((c) => (
                      <Link
                        key={c.id}
                        href={`/cases/${c.id}/overview`}
                        className="block rounded-standard border border-border p-3 hover:bg-muted/40"
                      >
                        <div className="text-sm font-medium">{c.title}</div>
                        {c.description && (
                          <div className="text-xs text-muted-foreground line-clamp-2">
                            {c.description}
                          </div>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {matchedClients.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-medium text-muted-foreground">
                    Clientes ({matchedClients.length})
                  </div>
                  <div className="space-y-2">
                    {matchedClients.map((c) => (
                      <Link
                        key={c.id}
                        href={`/clients/${c.id}/overview`}
                        className="block rounded-standard border border-border p-3 hover:bg-muted/40"
                      >
                        <div className="text-sm font-medium">
                          {[c.first_name, c.last_name].filter(Boolean).join(" ") || "(sin nombre)"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {[c.email, c.document].filter(Boolean).join(" · ")}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
