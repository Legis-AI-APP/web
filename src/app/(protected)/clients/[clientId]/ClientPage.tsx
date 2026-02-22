"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import type { Client } from "@/lib/clients-service";
import type { LegisFile } from "@/lib/legis-file";
import type { ClientPersonDto } from "@/lib/client-persons";
import type { Case } from "@/lib/cases-service";

import ScopedChatWorkspace from "@/components/ScopedChatWorkspace";
import ClientManagementPanel from "@/components/ClientManagementPanel";
import EntitySubnav from "@/components/EntitySubnav";

export default function ClientPage({
  client,
  files,
  contextLabel,
  rightPanelContent,
}: {
  client: Client;
  files: LegisFile[];
  contextLabel?: string;
  rightPanelContent?: React.ReactNode;
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
    if (rightPanelContent) return;
    void refreshPersons();
  }, [refreshPersons, rightPanelContent]);

  // Cases associated to client
  const [cases, setCases] = useState<Case[]>([]);
  const [casesLoading, setCasesLoading] = useState(false);

  const refreshCases = useMemo(
    () => async () => {
      setCasesLoading(true);
      try {
        const res = await fetch(`/api/clients/${client.id}/cases`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error(await res.text());
        const json = (await res.json()) as Array<Record<string, unknown>>;
        // Support both snake_case (web legacy) and camelCase (api contract)
        const normalized = json.map((c) => ({
          ...c,
          client_id: c.client_id ?? c.clientId,
          created_at: c.created_at ?? c.createdAt,
          updated_at: c.updated_at ?? c.updatedAt,
        })) as Case[];
        setCases(normalized);
      } catch (e: unknown) {
        toast.error(e instanceof Error ? e.message : "No se pudo cargar casos");
      } finally {
        setCasesLoading(false);
      }
    },
    [client.id]
  );

  useEffect(() => {
    if (rightPanelContent) return;
    void refreshCases();
  }, [refreshCases, rightPanelContent]);

  const rightPanel = (
    <div className="h-full flex flex-col">
      <div className="p-3 border-b bg-sidebar/60 backdrop-blur-sm sticky top-0 z-10">
        <EntitySubnav
          items={[
            { label: "Resumen", href: `/clients/${client.id}/overview` },
            { label: "Personas", href: `/clients/${client.id}/persons` },
            { label: "Casos", href: `/clients/${client.id}/cases` },
            { label: "Docs", href: `/clients/${client.id}/files` },
            { label: "Borradores", href: `/clients/${client.id}/drafts` },
            { label: "Export", href: `/clients/${client.id}/export` },
          ]}
        />
      </div>

      <div className="flex-1 min-h-0 overflow-auto">
        {rightPanelContent ? (
          <div className="p-4">{rightPanelContent}</div>
        ) : (
          <>
            <ClientManagementPanel client={client} persons={persons} files={files} cases={cases} />
            {(personsLoading || casesLoading) && (
              <div className="px-4 pb-4 text-xs text-muted-foreground">Actualizando…</div>
            )}
          </>
        )}
      </div>
    </div>
  );

  return (
    <div className="-m-6 h-[calc(100dvh-0px)]">
      <ScopedChatWorkspace
        scopeLabel="Cliente"
        scopeBasePath={`/clients/${client.id}`}
        headerTitle="IA Legal — Cliente"
        headerSubtitle={`${client.first_name} ${client.last_name}`}
        contextLabel={contextLabel}
        listChatsPath={`/api/clients/${client.id}/chats`}
        createChatPath={`/api/clients/${client.id}/chats`}
        askPath={`/api/ai/ask/client/${client.id}`}
        rightPanel={rightPanel}
      />
    </div>
  );
}
