"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type StoredDraft = {
  type?: string;
  jurisdiction?: string;
  facts: string;
  goal: string;
  result: string;
  updatedAt: string;
};

export default function DraftEditor({
  title = "Redactor",
  subtitle = "MVP: plantilla + generación asistida (la IA integrada viene en el siguiente paso).",
  storageKey,
}: {
  title?: string;
  subtitle?: string;
  storageKey?: string;
}) {
  const [docType, setDocType] = useState("");
  const [jurisdiction, setJurisdiction] = useState("");
  const [facts, setFacts] = useState("");
  const [goal, setGoal] = useState("");
  const [result, setResult] = useState("");

  const canPersist = Boolean(storageKey);

  const load = useMemo(
    () => () => {
      if (!storageKey) return;
      const raw = localStorage.getItem(storageKey);
      if (!raw) return;
      try {
        const parsed = JSON.parse(raw) as StoredDraft;
        setDocType(parsed.type ?? "");
        setJurisdiction(parsed.jurisdiction ?? "");
        setFacts(parsed.facts ?? "");
        setGoal(parsed.goal ?? "");
        setResult(parsed.result ?? "");
      } catch {
        // ignore
      }
    },
    [storageKey]
  );

  const save = useMemo(
    () => () => {
      if (!storageKey) return;
      const payload: StoredDraft = {
        type: docType,
        jurisdiction,
        facts,
        goal,
        result,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem(storageKey, JSON.stringify(payload));
    },
    [docType, facts, goal, jurisdiction, result, storageKey]
  );

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!storageKey) return;
    const id = window.setTimeout(() => {
      save();
    }, 500);
    return () => window.clearTimeout(id);
  }, [docType, facts, goal, jurisdiction, result, save, storageKey]);

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">{title}</h1>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
        {canPersist && (
          <p className="text-xs text-muted-foreground mt-1">
            Guardado local automático (este dispositivo). Todavía no sincroniza.
          </p>
        )}
      </div>

      <Card className="border-0" style={{ boxShadow: "none" }}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Parámetros</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            placeholder="Tipo de escrito (demanda, contestación, apelación…)"
            value={docType}
            onChange={(e) => setDocType(e.currentTarget.value)}
          />
          <Input
            placeholder="Jurisdicción / fuero"
            value={jurisdiction}
            onChange={(e) => setJurisdiction(e.currentTarget.value)}
          />
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

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              onClick={() => {
                const draft = [
                  "ESCRITO — BORRADOR (MVP)",
                  "",
                  docType ? `Tipo: ${docType}` : null,
                  jurisdiction ? `Fuero: ${jurisdiction}` : null,
                  "",
                  "1) Objeto",
                  goal ? `- ${goal}` : "- (completar objetivo)",
                  "",
                  "2) Hechos",
                  facts ? facts : "(completar hechos)",
                  "",
                  "3) Derecho",
                  "(completar normativa/jurisprudencia)",
                  "",
                  "4) Petitorio",
                  "(completar)",
                ]
                  .filter((x): x is string => Boolean(x))
                  .join("\n");
                setResult(draft);
              }}
            >
              Generar borrador
            </Button>
            <Button type="button" variant="outline" onClick={() => setResult("")}> 
              Limpiar
            </Button>
            {canPersist && (
              <>
                <Button type="button" variant="outline" onClick={save}>
                  Guardar
                </Button>
                <Button type="button" variant="outline" onClick={load}>
                  Recargar
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="border-0" style={{ boxShadow: "none" }}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Borrador</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={result}
            onChange={(e) => setResult(e.currentTarget.value)}
            placeholder="Aparece acá…"
            rows={12}
          />
        </CardContent>
      </Card>
    </div>
  );
}
