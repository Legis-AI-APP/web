import { getCase, getFiles } from "@/lib/cases-service";
import { headers } from "next/headers";
import CasePage from "./CasePage";

type PageProps = {
  params: Promise<{
    caseId: string;
  }>;
};

export default async function Page({ params }: PageProps) {
  const headersList = await headers();
  const { caseId } = await params;
  const [oldCase, files] = await Promise.all([
    getCase(caseId, headersList),
    getFiles(caseId, headersList),
  ]);
  return <CasePage oldCase={oldCase} files={files} />;
}
