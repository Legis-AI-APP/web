import { getFiles } from "@/lib/cases-service";
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
  const files = await getFiles(caseId, headersList);
  return <CasePage files={files} />;
}
