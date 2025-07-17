"use client";

import { Card, CardContent } from "@/components/ui/card";
import AppBar from "@/components/layout/AppBar";
import { useRouter } from "next/navigation";
import { Case } from "@/lib/cases-service";
import { Client } from "@/lib/clients-service";
import AddCaseDialog from "@/components/dialog/AddCaseDialog";

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
      <AppBar title="Casos" actions={<AddCaseDialog clients={clients} />} />

      {cases.length > 0 ? (
        <div className="space-y-3">
          {cases.map((c) => (
            <Card
              key={c.id}
              onClick={() => router.push(`/cases/${c.id}`)}
              className="cursor-pointer hover:bg-muted transition-colors"
            >
              <CardContent className="pt-4 space-y-2">
                <h2 className="font-semibold">{c.title}</h2>
                <p className="text-sm text-muted-foreground">{c.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center min-h-[82vh] w-full text-center text-muted-foreground text-sm">
          Todavía no hay casos.
          <br />
          Usá el botón de arriba para crear uno.
        </div>
      )}
    </div>
  );
}
