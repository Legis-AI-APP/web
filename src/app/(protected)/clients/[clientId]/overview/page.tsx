import ClientPage from "../ClientPage";
import { getClient, getClientFiles } from "@/lib/clients-service";

export default async function Page({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;
  const [client, files] = await Promise.all([getClient(clientId), getClientFiles(clientId)]);
  return <ClientPage client={client} files={files} contextLabel="Resumen" />;
}
