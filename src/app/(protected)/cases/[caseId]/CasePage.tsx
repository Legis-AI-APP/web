"use client";

import type { Case } from "@/lib/cases-service";

import ScopedChatWorkspace from "@/components/ScopedChatWorkspace";
import CaseDetailPanel from "@/components/CaseDetailPanel";
import EntitySubnav from "@/components/EntitySubnav";

export default function CasePage({
  oldCase,
  clientName,
  initialPanelTab,
  contextLabel,
  rightPanelContent,
  rightPanelPadding = true,
}: {
  oldCase: Case;
  clientName?: string;
  initialPanelTab?: "movements" | "documents" | "dates" | "notes";
  contextLabel?: string;
  rightPanelContent?: React.ReactNode;
  rightPanelPadding?: boolean;
}) {

  const caseData = {
    id: oldCase.id,
    title: oldCase.title,
    clientName: clientName ?? (oldCase.client_id ? `Cliente (${oldCase.client_id})` : "Cliente"),
    status: oldCase.status,
    partyA: "",
    partyB: "",
    matter: oldCase.title,
  };

  return (
    <div className="-m-6 h-[calc(100dvh-0px)]">
      <ScopedChatWorkspace
        scopeLabel="Asunto"
        scopeBasePath={`/cases/${oldCase.id}`}
        headerTitle="IA Legal — Asunto"
        headerSubtitle={oldCase.title}
        contextLabel={contextLabel}
        listChatsPath={`/api/cases/${oldCase.id}/chats`}
        createChatPath={`/api/cases/${oldCase.id}/chats`}
        askPath={`/api/ai/ask/case/${oldCase.id}`}
        rightPanel={
          <div className="h-full flex flex-col">
            <div className="p-3 border-b bg-sidebar/60 backdrop-blur-sm sticky top-0 z-10">
              <EntitySubnav
                items={[
                  { label: "Resumen", href: `/cases/${oldCase.id}/overview` },
                  { label: "Docs", href: `/cases/${oldCase.id}/files` },
                  { label: "Actividad", href: `/cases/${oldCase.id}/activity` },
                  { label: "Borradores", href: `/cases/${oldCase.id}/drafts` },
                  { label: "Export", href: `/cases/${oldCase.id}/export` },
                ]}
              />
            </div>
            <div className="flex-1 min-h-0 overflow-auto">
              {rightPanelContent ? (
                rightPanelPadding ? (
                  <div className="p-4">{rightPanelContent}</div>
                ) : (
                  rightPanelContent
                )
              ) : (
                <CaseDetailPanel
                  mode="sidebar"
                  isOpen={true}
                  onClose={() => {}}
                  caseData={caseData}
                  initialTab={initialPanelTab}
                />
              )}
            </div>
          </div>
        }
      />
    </div>
  );
}
