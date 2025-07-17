import { getCases } from "@/lib/cases-service";
import CasesPage from "./CasesPage";
import { headers } from "next/headers";
import { getClients } from "@/lib/clients-service";

export default async function Page() {
  const headersList = await headers();
  const cases = await getCases(headersList);
  const clients = await getClients(headersList);
  return <CasesPage cases={cases} clients={clients} />;
}
