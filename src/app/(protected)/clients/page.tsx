import { headers } from "next/headers";
import { getClients } from "@/lib/clients-service";
import ClientsPage from "./ClientsPage";

export default async function Page() {
  const headersList = await headers();
  const clients = await getClients(headersList);
  return <ClientsPage clients={clients} />;
}
