import { getCases } from "@/lib/cases-service";
import CasesPage from "./CasesPage";
import { getClients } from "@/lib/clients-service";

export default async function Page() {
  const [cases, clients] = await Promise.all([
    getCases(),
    getClients(),
  ]);
  return <CasesPage cases={cases} clients={clients} />;
}
