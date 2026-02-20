import ClientPage from "../ClientPage";
import { getClient, getClientFiles } from "@/lib/clients-service";

export default async function Page({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;
  const [client, files] = await Promise.all([getClient(clientId), getClientFiles(clientId)]);
  // MVP: persons live in the right panel; route exists for deep-linking.
  return <ClientPage client={client} files={files} />;
}
