import HomeClient from "./HomeClient";
import { getCases } from "@/lib/cases-service";
import { getClients } from "@/lib/clients-service";

export default async function Page() {
  const [cases, clients] = await Promise.all([getCases(), getClients()]);

  return (
    <HomeClient
      counts={{
        cases: cases.length,
        clients: clients.length,
      }}
    />
  );
}
