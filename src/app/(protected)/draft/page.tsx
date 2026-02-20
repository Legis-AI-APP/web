"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function DraftPage() {
  const [facts, setFacts] = useState("");
  const [goal, setGoal] = useState("");
  const [result, setResult] = useState("");

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Redactor</h1>
        <p className="text-sm text-muted-foreground">
          MVP: plantilla + generación asistida (la IA integrada viene en el siguiente paso).
        </p>
      </div>

      <Card className="border-0" style={{ boxShadow: "none" }}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Parámetros</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input placeholder="Tipo de escrito (demanda, contestación, apelación…)" />
          <Input placeholder="Jurisdicción / fuero" />
          <Textarea
            value={facts}
            onChange={(e) => setFacts(e.currentTarget.value)}
            placeholder="Hechos relevantes (bullet points)"
            rows={5}
          />
          <Textarea
            value={goal}
            onChange={(e) => setGoal(e.currentTarget.value)}
            placeholder="Pretensión / objetivo"
            rows={3}
          />

          <div className="flex gap-2">
            <Button
              type="button"
              onClick={() => {
                // Placeholder: next step is AI generation.
                const draft = [
                  "ESCRITO — BORRADOR (MVP)",
                  "",
                  "1) Objeto",
                  goal ? `- ${goal}` : "- (completar objetivo)",
                  "",
                  "2) Hechos",
                  facts ? facts : "(completar hechos)",
                  "",
                  "3) Derecho",
                  "(completar normativa/jurisprudencia) ",
                  "",
                  "4) Petitorio",
                  "(completar)",
                ].join("\n");
                setResult(draft);
              }}
            >
              Generar borrador
            </Button>
            <Button type="button" variant="outline" onClick={() => setResult("")}>Limpiar</Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0" style={{ boxShadow: "none" }}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Borrador</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea value={result} readOnly placeholder="Aparece acá…" rows={12} />
        </CardContent>
      </Card>
    </div>
  );
}
