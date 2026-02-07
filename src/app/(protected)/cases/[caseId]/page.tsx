import { getCase, getCaseFiles } from "@/lib/cases-service";
import CasePage from "./CasePage";

type PageProps = {
  params: Promise<{
    caseId: string;
  }>;
};

export default async function Page({ params }: PageProps) {
  const { caseId } = await params;
  const [oldCase, files] = await Promise.all([
    getCase(caseId),
    getCaseFiles(caseId),
  ]);
  return <CasePage oldCase={oldCase} files={files} />;
}
