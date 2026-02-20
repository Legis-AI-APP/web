import { getCase, getCaseFiles } from "@/lib/cases-service";
import CasePage from "../CasePage";

export default async function Page({
  params,
}: {
  params: Promise<{ caseId: string }>;
}) {
  const { caseId } = await params;
  const [oldCase, files] = await Promise.all([getCase(caseId), getCaseFiles(caseId)]);
  // MVP: drafts section lives in Panel for now; route exists for deep-linking.
  return <CasePage oldCase={oldCase} files={files} initialPanelTab="notes" />;
}
