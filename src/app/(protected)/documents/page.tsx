import DocumentsPage, { buildDocsIndex } from "./DocumentsPage";
import { getCases, getCaseFiles } from "@/lib/cases-service";
import { getClients, getClientFiles } from "@/lib/clients-service";

export default async function Page() {
  const [cases, clients] = await Promise.all([getCases(), getClients()]);

  // MVP approach: aggregate all files.
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

  return <DocumentsPage docs={docs} />;
}
