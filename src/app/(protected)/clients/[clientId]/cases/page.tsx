import ClientPage from "../ClientPage";
import { getClient } from "@/lib/clients-service";

export default async function Page({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;
  const client = await getClient(clientId);
  // MVP: associated cases are shown in the right panel; route exists for deep-linking.
  // Perf: avoid fetching client files server-side on this route.
  return <ClientPage client={client} files={[]} contextLabel="Casos" />;
}
