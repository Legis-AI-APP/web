"use client";

import { Case } from "@/lib/cases-service";
import { LegisFile } from "@/lib/legis-file";
import CaseChatArea from "@/components/CaseChatArea";

export default function CasePage({
  oldCase,
  files: _files,
}: {
  oldCase: Case;
  files: LegisFile[];
}) { void _files;

  // Datos del caso formateados para el panel
  const caseData = {
    id: oldCase.id,
    title: oldCase.title,
    clientName: oldCase.client_id ? `Cliente (${oldCase.client_id})` : "Cliente",
    status: oldCase.status,
    // Mientras no exista el modelo/endpoint para carátula/partes/materia, caemos a título.
    partyA: "",
    partyB: "",
    matter: oldCase.title,
  };

  // Navigation + panel toggles are handled by the contextual Sidebar.

  return (
    <div className="min-h-full">
      {/*
        Sidebar contextual: cuando estás dentro de /cases/[caseId], la barra izquierda ya muestra
        el panel del caso + la lista de chats del asunto. Evitamos duplicar el panel acá
        (que dejaba el layout partido en 3).

        En mobile el acceso al panel/chat list queda vía el Sheet del Sidebar.
      */}
      <div className="h-full">
        <CaseChatArea caseData={caseData} />
      </div>
    </div>
  );
}
