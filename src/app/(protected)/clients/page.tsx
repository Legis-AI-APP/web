import { headers } from "next/headers";
import { getClients } from "@/lib/clients-service";
import ClientsPage from "./ClientsPage";

export default async function Page() {
  const headersList = await headers();
  const upstream = new Headers(headersList);
  const clients = await getClients(upstream);
  return <ClientsPage clients={clients} />;
}
