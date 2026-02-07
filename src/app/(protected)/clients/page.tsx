import { getClients } from "@/lib/clients-service";
import ClientsPage from "./ClientsPage";

export default async function Page() {
  const clients = await getClients();
  return <ClientsPage clients={clients} />;
}
