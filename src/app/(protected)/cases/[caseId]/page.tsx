import { redirect } from "next/navigation";

type PageProps = {
  params: Promise<{
    caseId: string;
  }>;
};

export default async function Page({ params }: PageProps) {
  const { caseId } = await params;
  redirect(`/cases/${caseId}/overview`);
}
