import { getCase, getCaseFiles } from "@/lib/cases-service";
import { getClient } from "@/lib/clients-service";
import CasePage from "../CasePage";

export default async function Page({
  params,
}: {
  params: Promise<{ caseId: string }>;
}) {
  const { caseId } = await params;

  const [oldCase, files] = await Promise.all([getCase(caseId), getCaseFiles(caseId)]);
  const client = oldCase.client_id ? await getClient(oldCase.client_id).catch(() => null) : null;
  const clientName = client ? `${client.first_name} ${client.last_name}`.trim() : undefined;

  return (
    <CasePage
      oldCase={oldCase}
      clientName={clientName}
      files={files}
      initialPanelTab="movements"
      contextLabel="Resumen"
    />
  );
}
