import Link from "next/link";
import DraftEditor from "@/components/DraftEditor";
import { getCase } from "@/lib/cases-service";

export default async function Page({
  params,
}: {
  params: Promise<{ caseId: string }>;
}) {
  const { caseId } = await params;
  const c = await getCase(caseId);

  return (
    <div className="space-y-3">
      <div className="print-hide">
        <Link href={`/cases/${caseId}/overview`} className="text-sm text-muted-foreground hover:underline">
          ← Volver al caso
        </Link>
      </div>
      <DraftEditor
        title="Borradores — Caso"
        subtitle={c.title}
        storageKey={`draft:case:${caseId}`}
      />
    </div>
  );
}
