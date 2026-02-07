import ClientPage from "./ClientPage";
import { getClient, getClientFiles } from "@/lib/clients-service";

type PageProps = {
  params: Promise<{
    clientId: string;
  }>;
};

export default async function Page({ params }: PageProps) {
  const { clientId } = await params;
  const [client, files] = await Promise.all([
    getClient(clientId),
    getClientFiles(clientId),
  ]);
  return <ClientPage client={client} files={files} />;
}
