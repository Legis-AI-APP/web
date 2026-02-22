import DocumentsPage, { buildDocsIndex } from "./DocumentsPage";
import { getCases, getCaseFiles } from "@/lib/cases-service";
import { getClients, getClientFiles } from "@/lib/clients-service";

export default async function Page() {
  const [casesAll, clientsAll] = await Promise.all([getCases(), getClients()]);

  // MVP safeguard: cap fan-out to avoid N+1 explosion on large accounts.
  // (Later: server endpoint to search documents without fetching everything.)
  const MAX_OWNERS = 50;

  const cases = [...casesAll]
    .sort((a, b) => {
      const at = a.updated_at ? Date.parse(a.updated_at) : 0;
      const bt = b.updated_at ? Date.parse(b.updated_at) : 0;
      return bt - at;
    })
    .slice(0, MAX_OWNERS);

  const clients = [...clientsAll].slice(0, MAX_OWNERS);

  const [caseFiles, clientFiles] = await Promise.all([
    Promise.all(
      cases.map(async (c) => ({
        caseId: c.id,
        files: await getCaseFiles(c.id).catch(() => []),
      })),
    ),
    Promise.all(
      clients.map(async (c) => ({
        clientId: c.id,
        files: await getClientFiles(c.id).catch(() => []),
      })),
    ),
  ]);

  const docs = buildDocsIndex({ cases, clients, caseFiles, clientFiles });

  return (
    <DocumentsPage
      docs={docs}
      note={
        casesAll.length > MAX_OWNERS || clientsAll.length > MAX_OWNERS
          ? `MVP: mostrando archivos de los primeros ${MAX_OWNERS} casos/clientes para performance.`
          : undefined
      }
    />
  );
}
