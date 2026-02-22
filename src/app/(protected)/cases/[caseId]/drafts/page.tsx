import DraftEditor from "@/components/DraftEditor";
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
      contextLabel="Borradores"
      rightPanelContent={
        <DraftEditor
          title="Borradores — Caso"
          subtitle={oldCase.title}
          storageKey={`draft:case:${caseId}`}
          context={{
            client: client
              ? {
                  name: [client.first_name, client.last_name].filter(Boolean).join(" ") || client.id,
                  documentType: client.document_type,
                  document: client.document,
                  email: client.email,
                  phone: client.phone,
                  address: client.address,
                }
              : undefined,
            case: {
              title: oldCase.title,
              status: oldCase.status,
              description: oldCase.description,
            },
          }}
          askEndpoint={`/api/ai/ask/case/${caseId}`}
          createChatPath={`/api/cases/${caseId}/chats`}
        />
      }
    />
  );
}
