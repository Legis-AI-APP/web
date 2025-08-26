"use client";

import { Card, CardContent } from "@/components/ui/card";
import AppBar from "@/components/layout/AppBar";
import { useRouter } from "next/navigation";
import { Case } from "@/lib/cases-service";
import { Client } from "@/lib/clients-service";
import AddCaseDialog from "@/components/dialog/AddCaseDialog";
import CardGrid from "@/components/CardGrid";
import EmptyState from "@/components/EmptyState";

export default function CasesPage({
  cases,
  clients,
}: {
  cases: Case[];
  clients: Client[];
}) {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <AppBar title="Asuntos" actions={<AddCaseDialog clients={clients} />} />

      {cases.length > 0 ? (
        <CardGrid>
          {cases.map((c) => (
            <Card
              key={c.id}
              onClick={() => router.push(`/cases/${c.id}`)}
              className="w-[300px] cursor-pointer hover:bg-muted transition-colors"
            >
              <CardContent className="p-4 text-sm space-y-1">
                <h2 className="font-semibold">{c.title}</h2>
                <p className="text-muted-foreground">{c.description}</p>
              </CardContent>
            </Card>
          ))}
        </CardGrid>
      ) : (
        <EmptyState message="Todavía no hay Asuntos.\nUsá el botón de arriba para crear uno." />
      )}
    </div>
  );
}
