"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import type { Client } from "@/lib/clients-service";
import type { LegisFile } from "@/lib/legis-file";
import type { ClientPersonDto } from "@/lib/client-persons";
import type { Case } from "@/lib/cases-service";

import ScopedChatWorkspace from "@/components/ScopedChatWorkspace";
import ClientManagementPanel from "@/components/ClientManagementPanel";

export default function ClientPage({
  client,
  files,
}: {
  client: Client;
  files: LegisFile[];
}) {
  // Persons
  const [persons, setPersons] = useState<ClientPersonDto[]>([]);
  const [personsLoading, setPersonsLoading] = useState(false);

  const refreshPersons = useMemo(
    () => async () => {
      setPersonsLoading(true);
      try {
        const res = await fetch(`/api/clients/${client.id}/persons`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error(await res.text());
        const json = (await res.json()) as ClientPersonDto[];
        setPersons(json);
      } catch (e: unknown) {
        toast.error(e instanceof Error ? e.message : "No se pudo cargar personas");
      } finally {
        setPersonsLoading(false);
      }
    },
    [client.id]
  );

  useEffect(() => {
    void refreshPersons();
  }, [refreshPersons]);

  // Cases associated to client
  const [cases, setCases] = useState<Case[]>([]);
  const [casesLoading, setCasesLoading] = useState(false);

  const refreshCases = useMemo(
    () => async () => {
      setCasesLoading(true);
      try {
        const res = await fetch(`/api/cases`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error(await res.text());
        const json = (await res.json()) as Case[];
        setCases(json.filter((c) => c.client_id === client.id));
      } catch (e: unknown) {
        toast.error(e instanceof Error ? e.message : "No se pudo cargar casos");
      } finally {
        setCasesLoading(false);
      }
    },
    [client.id]
  );

  useEffect(() => {
    void refreshCases();
  }, [refreshCases]);

  const rightPanel = (
    <div className="h-full">
      <ClientManagementPanel client={client} persons={persons} files={files} cases={cases} />
      {(personsLoading || casesLoading) && (
        <div className="px-4 pb-4 text-xs text-muted-foreground">Actualizando…</div>
      )}
    </div>
  );

  return (
    <ScopedChatWorkspace
      scopeLabel="Cliente"
      scopeBasePath={`/clients/${client.id}`}
      headerTitle="IA Legal — Cliente"
      headerSubtitle={`${client.first_name} ${client.last_name}`}
      listChatsPath={`/api/clients/${client.id}/chats`}
      createChatPath={`/api/clients/${client.id}/chats`}
      askPath={`/api/ai/ask/client/${client.id}`}
      rightPanel={rightPanel}
    />
  );
}
