import HomeClient from "./HomeClient";
import { getCases } from "@/lib/cases-service";
import { getClients } from "@/lib/clients-service";

export default async function Page() {
  const [cases, clients] = await Promise.all([getCases(), getClients()]);

  const recentCases = [...cases]
    .sort((a, b) => {
      const at = a.updated_at ? Date.parse(a.updated_at) : 0;
      const bt = b.updated_at ? Date.parse(b.updated_at) : 0;
      return bt - at;
    })
    .slice(0, 5)
    .map((c) => ({ id: c.id, title: c.title }));

  const recentClients = [...clients]
    .slice(0, 5)
    .map((c) => ({
      id: c.id,
      name: `${c.first_name} ${c.last_name}`.trim() || "(sin nombre)",
    }));

  return (
    <HomeClient
      counts={{
        cases: cases.length,
        clients: clients.length,
      }}
      recent={{
        cases: recentCases,
        clients: recentClients,
      }}
    />
  );
}
