import { getFiles } from "@/lib/cases-service";
import { headers } from "next/headers";
import CasePage from "./CasePage";

type PageProps = {
  params: {
    caseId: number;
  };
};

export default async function Page({ params }: PageProps) {
  const headersList = await headers();
  const files = await getFiles(params.caseId, headersList);
  return <CasePage files={files} />;
}
