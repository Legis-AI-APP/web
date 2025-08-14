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
  const upstream = new Headers(headersList);
  const { clientId } = await params;
  const [client, files] = await Promise.all([
    getClient(clientId, upstream),
    getClientFiles(clientId, upstream),
  ]);
  return <ClientPage client={client} files={files} />;
}
