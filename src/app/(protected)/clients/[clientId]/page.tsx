import { headers } from "next/headers";
import ClientPage from "./ClientPage";
import { getClient, getClientFiles } from "@/lib/clients-service";

type PageProps = {
  params: Promise<{
    clientId: string;
  }>;
};

export default async function Page({ params }: PageProps) {
  const headersList = await headers();
  const { clientId } = await params;
  const [client, files] = await Promise.all([
    getClient(clientId, headersList),
    getClientFiles(clientId, headersList),
  ]);
  return <ClientPage client={client} files={files} />;
}
