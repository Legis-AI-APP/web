import Link from "next/link";
import DraftEditor from "@/components/DraftEditor";
import { getClient } from "@/lib/clients-service";

export default async function Page({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;
  const client = await getClient(clientId);

  const fullName = [client.first_name, client.last_name].filter(Boolean).join(" ") || "(sin nombre)";

  return (
    <div className="space-y-3">
      <div className="print-hide">
        <Link href={`/clients/${clientId}/overview`} className="text-sm text-muted-foreground hover:underline">
          ← Volver al cliente
        </Link>
      </div>
      <DraftEditor
        title="Borradores — Cliente"
        subtitle={fullName}
        storageKey={`draft:client:${clientId}`}
      />
    </div>
  );
}
