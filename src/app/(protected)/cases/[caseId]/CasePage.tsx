"use client";

import type { Case } from "@/lib/cases-service";
import type { LegisFile } from "@/lib/legis-file";

import ScopedChatWorkspace from "@/components/ScopedChatWorkspace";
import CaseDetailPanel from "@/components/CaseDetailPanel";

export default function CasePage({
  oldCase,
  files: _files,
}: {
  oldCase: Case;
  files: LegisFile[];
}) {
  void _files;

  const caseData = {
    id: oldCase.id,
    title: oldCase.title,
    clientName: oldCase.client_id ? `Cliente (${oldCase.client_id})` : "Cliente",
    status: oldCase.status,
    partyA: "",
    partyB: "",
    matter: oldCase.title,
  };

  return (
    <div className="-m-6">
      <ScopedChatWorkspace
      scopeLabel="Asunto"
      scopeId={oldCase.id}
      headerTitle="IA Legal — Asunto"
      headerSubtitle={oldCase.title}
      listChatsPath={`/api/cases/${oldCase.id}/chats`}
      createChatPath={`/api/cases/${oldCase.id}/chats`}
      askPath={`/api/ai/ask/case/${oldCase.id}`}
      rightPanel={
        <div className="h-full">
          <CaseDetailPanel mode="sidebar" isOpen={true} onClose={() => {}} caseData={caseData} />
        </div>
      }
    />
    </div>
  );
}
