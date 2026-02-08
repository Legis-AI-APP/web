"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Case } from "@/lib/cases-service";
import { LegisFile } from "@/lib/legis-file";
import CaseDetailPanel from "@/components/CaseDetailPanel";
import CaseChatArea from "@/components/CaseChatArea";
import { useIsMobile } from "@/hooks/use-mobile";

export default function CasePage({
  oldCase,
  files: _files,
}: {
  oldCase: Case;
  files: LegisFile[];
}) { void _files;
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const router = useRouter();
  const isMobile = useIsMobile();

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

  const handleBackToCases = () => {
    router.push("/cases");
  };

  const handleBackToClient = () => {
    // Esto debería navegar al cliente específico
    router.push("/clients");
  };

  const handleClosePanel = () => {
    if (isMobile) {
      setIsPanelOpen(false);
    }
  };

  const handleOpenPanel = () => {
    if (isMobile) {
      setIsPanelOpen(true);
    }
  };

  return (
    <div className="h-screen overflow-hidden">
      {/* En desktop: layout de dos columnas */}
      <div className="hidden md:flex h-full">
        {/* Panel de detalles del asunto - siempre visible en desktop */}
        <div className="flex-shrink-0" style={{ width: '40%' }}>
          <CaseDetailPanel
            isOpen={true}
            onClose={() => { }} // No se puede cerrar en desktop
            caseData={caseData}
            onBackToCases={handleBackToCases}
            onBackToClient={handleBackToClient}
            fromClient={false}
          />
        </div>

        {/* Área principal con chat de IA */}
        <div className="flex-1">
          <CaseChatArea
            caseData={caseData}
            onOpenPanel={handleOpenPanel}
          />
        </div>
      </div>

      {/* En mobile: overlay */}
      <div className="md:hidden h-full">
        {/* Panel de detalles del asunto - overlay en mobile */}
        <CaseDetailPanel
          isOpen={isPanelOpen}
          onClose={handleClosePanel}
          caseData={caseData}
          onBackToCases={handleBackToCases}
          onBackToClient={handleBackToClient}
          fromClient={false}
        />

        {/* Área principal con chat de IA */}
        <div className="h-full">
          <CaseChatArea
            caseData={caseData}
            onOpenPanel={handleOpenPanel}
          />
        </div>
      </div>
    </div>
  );
}
