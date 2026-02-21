import { getCase } from "@/lib/cases-service";
import { getClient } from "@/lib/clients-service";
import CasePage from "../CasePage";

export default async function Page({
  params,
}: {
  params: Promise<{ caseId: string }>;
}) {
  const { caseId } = await params;

  const oldCase = await getCase(caseId);
  const client = oldCase.client_id ? await getClient(oldCase.client_id).catch(() => null) : null;
  const clientName = client ? `${client.first_name} ${client.last_name}`.trim() : undefined;

  return (
    <CasePage
      oldCase={oldCase}
      clientName={clientName}
      initialPanelTab="movements"
      contextLabel="Resumen"
    />
  );
}
