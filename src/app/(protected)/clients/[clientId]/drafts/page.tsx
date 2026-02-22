import DraftEditor from "@/components/DraftEditor";
import { getClient } from "@/lib/clients-service";
import ClientPage from "../ClientPage";

export default async function Page({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;
  const client = await getClient(clientId);

  const fullName = [client.first_name, client.last_name].filter(Boolean).join(" ") || "(sin nombre)";

  return (
    <ClientPage
      client={client}
      files={[]}
      contextLabel="Borradores"
      rightPanelContent={
        <DraftEditor
          title="Borradores — Cliente"
          subtitle={fullName}
          storageKey={`draft:client:${clientId}`}
          context={{
            client: {
              name: fullName,
              document: client.document,
              documentType: client.document_type,
              email: client.email,
              phone: client.phone,
              address: client.address,
            },
          }}
          askEndpoint={`/api/ai/ask/client/${clientId}`}
          createChatPath={`/api/clients/${clientId}/chats`}
        />
      }
    />
  );
}
