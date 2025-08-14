import { getCases } from "@/lib/cases-service";
import CasesPage from "./CasesPage";
import { headers } from "next/headers";
import { getClients } from "@/lib/clients-service";

export default async function Page() {
  const headersList = await headers();
  const upstream = new Headers(headersList);
  const result = await Promise.all([
    getCases(upstream),
    getClients(upstream),
  ]);
  const [cases, clients] = result;
  return <CasesPage cases={cases} clients={clients} />;
}
