import Link from "next/link";
import DraftEditor from "@/components/DraftEditor";
import { getCase } from "@/lib/cases-service";
import { getClient } from "@/lib/clients-service";

export default async function Page({
  params,
}: {
  params: Promise<{ caseId: string }>;
}) {
  const { caseId } = await params;
  const c = await getCase(caseId);

  const client = c.client_id ? await getClient(c.client_id).catch(() => null) : null;

  return (
    <div className="space-y-3">
      <div className="print-hide">
        <Link href={`/cases/${caseId}/overview`} className="text-sm text-muted-foreground hover:underline">
          ← Volver al caso
        </Link>
      </div>
      <DraftEditor
        title="Borradores — Caso"
        subtitle={c.title}
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
            title: c.title,
            status: c.status,
            description: c.description,
          },
        }}
        askEndpoint={`/api/ai/ask/case/${caseId}`}
        createChatPath={`/api/cases/${caseId}/chats`}
      />
    </div>
  );
}
