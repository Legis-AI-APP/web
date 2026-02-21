import { getCase, getCaseFiles } from "@/lib/cases-service";
import CasePage from "../CasePage";

export default async function Page({
  params,
}: {
  params: Promise<{ caseId: string }>;
}) {
  const { caseId } = await params;
  const [oldCase, files] = await Promise.all([getCase(caseId), getCaseFiles(caseId)]);
  return (
    <CasePage
      oldCase={oldCase}
      files={files}
      initialPanelTab="movements"
      contextLabel="Resumen"
    />
  );
}
