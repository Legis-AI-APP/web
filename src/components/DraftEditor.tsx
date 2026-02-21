"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { askGeminiStream } from "@/lib/ask-gemini-stream";

type StoredDraft = {
  templateId?: string;
  type?: string;
  jurisdiction?: string;

  // common content
  facts: string;
  goal: string;
  result: string;

  // template-specific doc fields
  docDatePlace?: string;
  docRecipient?: string;
  docRecipientAddress?: string;
  docBody?: string;
  docSubject?: string;
  docSummary?: string;
  docPending?: string;
  docNextSteps?: string;
  docSignature?: string;

  updatedAt: string;
};

type DraftTemplate = {
  id: string;
  name: string;
  systemInstruction: string;
  templateText: string;
};

const DEFAULT_TEMPLATES: DraftTemplate[] = [
  {
    id: "escrito-generico",
    name: "Escrito genérico",
    systemInstruction:
      "Redactá un escrito jurídico en español (Argentina). Tono profesional, claro y sobrio. No inventes hechos ni normas. Si falta info, dejá placeholders.",
    templateText: [
      "ESCRITO — {{doc.type}}",
      "",
      "JURISDICCIÓN/FUERO: {{doc.jurisdiction}}",
      "",
      "CLIENTE: {{client.name}} ({{client.document}})",
      "EMAIL/TEL: {{client.email}} / {{client.phone}}",
      "DOMICILIO: {{client.address}}",
      "",
      "CASO/ASUNTO: {{case.title}}",
      "ESTADO: {{case.status}}",
      "DESCRIPCIÓN: {{case.description}}",
      "",
      "1) Objeto",
      "{{doc.goal}}",
      "",
      "2) Hechos",
      "{{doc.facts}}",
      "",
      "3) Derecho",
      "(completar normas aplicables; no inventar)",
      "",
      "4) Petitorio",
      "(completar)",
    ].join("\n"),
  },
  {
    id: "carta-documento",
    name: "Carta documento (borrador)",
    systemInstruction:
      "Redactá un borrador de carta documento (Argentina). Sé conciso, preciso y formal. No inventes hechos; usá placeholders.",
    templateText: [
      "CARTA DOCUMENTO — BORRADOR",
      "",
      "FECHA/LUGAR: {{doc.datePlace}}",
      "",
      "REMITENTE: {{client.name}} ({{client.document}})",
      "DOMICILIO: {{client.address}}",
      "",
      "DESTINATARIO: {{doc.recipient}}",
      "DOMICILIO: {{doc.recipientAddress}}",
      "",
      "TEXTO:",
      "{{doc.body}}",
    ].join("\n"),
  },
  {
    id: "email-cliente",
    name: "Email al cliente",
    systemInstruction:
      "Redactá un email profesional al cliente (Argentina). Claro, con lista de pendientes y próximos pasos. No inventes datos.",
    templateText: [
      "ASUNTO: {{doc.subject}}",
      "",
      "Hola {{client.name}},",
      "",
      "Te escribo por el asunto: {{case.title}}.",
      "",
      "Resumen:",
      "{{doc.summary}}",
      "",
      "Pendientes / lo que necesito de vos:",
      "{{doc.pending}}",
      "",
      "Próximos pasos:",
      "{{doc.nextSteps}}",
      "",
      "Saludos,",
      "{{doc.signature}}",
    ].join("\n"),
  },
];

export default function DraftEditor({
  title = "Redactor",
  subtitle = "MVP: plantilla + generación asistida (la IA integrada viene en el siguiente paso).",
  storageKey,
  context,
  askEndpoint,
  createChatPath,
  templates = DEFAULT_TEMPLATES,
}: {
  title?: string;
  subtitle?: string;
  storageKey?: string;
  context?: {
    client?: {
      name?: string;
      document?: string;
      documentType?: string;
      email?: string;
      phone?: string;
      address?: string;
    };
    case?: {
      title?: string;
      status?: string;
      description?: string;
    };
  };
  askEndpoint?: string;
  createChatPath?: string;
  templates?: DraftTemplate[];
}) {
  const [docType, setDocType] = useState("");
  const [jurisdiction, setJurisdiction] = useState("");
  const [facts, setFacts] = useState("");
  const [goal, setGoal] = useState("");

  // Template-specific doc fields (MVP)
  const [docDatePlace, setDocDatePlace] = useState("");
  const [docRecipient, setDocRecipient] = useState("");
  const [docRecipientAddress, setDocRecipientAddress] = useState("");
  const [docBody, setDocBody] = useState("");

  const [docSubject, setDocSubject] = useState("");
  const [docSummary, setDocSummary] = useState("");
  const [docPending, setDocPending] = useState("");
  const [docNextSteps, setDocNextSteps] = useState("");
  const [docSignature, setDocSignature] = useState("");
  const [result, setResult] = useState("");
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);

  const [templateId, setTemplateId] = useState<string>(templates[0]?.id ?? "");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiChatId, setAiChatId] = useState<string | null>(null);

  const canPersist = Boolean(storageKey);

  const load = useMemo(
    () => () => {
      if (!storageKey) return;
      const raw = localStorage.getItem(storageKey);
      if (!raw) return;
      try {
        const parsed = JSON.parse(raw) as StoredDraft;
        if (parsed.templateId) setTemplateId(parsed.templateId);
        setDocType(parsed.type ?? "");
        setJurisdiction(parsed.jurisdiction ?? "");
        setFacts(parsed.facts ?? "");
        setGoal(parsed.goal ?? "");
        setResult(parsed.result ?? "");

        setDocDatePlace(parsed.docDatePlace ?? "");
        setDocRecipient(parsed.docRecipient ?? "");
        setDocRecipientAddress(parsed.docRecipientAddress ?? "");
        setDocBody(parsed.docBody ?? "");
        setDocSubject(parsed.docSubject ?? "");
        setDocSummary(parsed.docSummary ?? "");
        setDocPending(parsed.docPending ?? "");
        setDocNextSteps(parsed.docNextSteps ?? "");
        setDocSignature(parsed.docSignature ?? "");

        setLastSavedAt(parsed.updatedAt ?? null);
      } catch {
        // ignore
      }
    },
    [storageKey]
  );

  const save = useMemo(
    () => () => {
      if (!storageKey) return;
      const updatedAt = new Date().toISOString();
      const payload: StoredDraft = {
        templateId,
        type: docType,
        jurisdiction,
        facts,
        goal,
        result,
        docDatePlace,
        docRecipient,
        docRecipientAddress,
        docBody,
        docSubject,
        docSummary,
        docPending,
        docNextSteps,
        docSignature,
        updatedAt,
      };
      localStorage.setItem(storageKey, JSON.stringify(payload));
      setLastSavedAt(updatedAt);
    },
    [
      docBody,
      docDatePlace,
      docNextSteps,
      docPending,
      docRecipient,
      docRecipientAddress,
      docSignature,
      docSubject,
      docSummary,
      docType,
      facts,
      goal,
      jurisdiction,
      result,
      storageKey,
      templateId,
    ]
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
  }, [
    docBody,
    docDatePlace,
    docNextSteps,
    docPending,
    docRecipient,
    docRecipientAddress,
    docSignature,
    docSubject,
    docSummary,
    docType,
    facts,
    goal,
    jurisdiction,
    result,
    save,
    storageKey,
    templateId,
  ]);

  const selectedTemplate = useMemo(
    () => templates.find((t) => t.id === templateId) ?? templates[0] ?? null,
    [templateId, templates]
  );

  const canUseAi = Boolean(askEndpoint);

  const missingRequiredForTemplate = useMemo(() => {
    if (!selectedTemplate) return [] as string[];
    const missing: string[] = [];

    if (selectedTemplate.id === "carta-documento") {
      if (!docRecipient.trim()) missing.push("Destinatario");
      if (!docBody.trim()) missing.push("Cuerpo");
    }

    if (selectedTemplate.id === "email-cliente") {
      if (!docSubject.trim()) missing.push("Asunto");
      if (!docSignature.trim()) missing.push("Firma");
    }

    return missing;
  }, [docBody, docRecipient, docSignature, docSubject, selectedTemplate]);

  const ensureAiChat = useMemo(
    () => async (): Promise<string | null> => {
      if (aiChatId) return aiChatId;
      if (!createChatPath) return null;

      const res = await fetch(createChatPath, {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) throw new Error("No se pudo crear el chat para IA");
      const json = (await res.json()) as { chat_id: string };
      setAiChatId(json.chat_id);
      return json.chat_id;
    },
    [aiChatId, createChatPath]
  );

  const placeholderMap = useMemo(() => {
    const clientName = context?.client?.name ?? "{{client.name}}";
    const clientDoc =
      [context?.client?.documentType, context?.client?.document].filter(Boolean).join(" ") ||
      "{{client.document}}";

    return {
      "{{client.name}}": clientName,
      "{{client.document}}": clientDoc,
      "{{client.email}}": context?.client?.email ?? "{{client.email}}",
      "{{client.phone}}": context?.client?.phone ?? "{{client.phone}}",
      "{{client.address}}": context?.client?.address ?? "{{client.address}}",

      "{{case.title}}": context?.case?.title ?? "{{case.title}}",
      "{{case.status}}": context?.case?.status ?? "{{case.status}}",
      "{{case.description}}": context?.case?.description ?? "{{case.description}}",

      "{{doc.type}}": docType || "{{doc.type}}",
      "{{doc.jurisdiction}}": jurisdiction || "{{doc.jurisdiction}}",
      "{{doc.goal}}": goal || "{{doc.goal}}",
      "{{doc.facts}}": facts || "{{doc.facts}}",

      // Optional placeholders for specific templates
      "{{doc.datePlace}}": docDatePlace || "{{doc.datePlace}}",
      "{{doc.recipient}}": docRecipient || "{{doc.recipient}}",
      "{{doc.recipientAddress}}": docRecipientAddress || "{{doc.recipientAddress}}",
      "{{doc.body}}": docBody || "{{doc.body}}",
      "{{doc.subject}}": docSubject || "{{doc.subject}}",
      "{{doc.summary}}": docSummary || "{{doc.summary}}",
      "{{doc.pending}}": docPending || "{{doc.pending}}",
      "{{doc.nextSteps}}": docNextSteps || "{{doc.nextSteps}}",
      "{{doc.signature}}": docSignature || "{{doc.signature}}",
    } as const;
  }, [
    context,
    docBody,
    docDatePlace,
    docNextSteps,
    docPending,
    docRecipient,
    docRecipientAddress,
    docSignature,
    docSubject,
    docSummary,
    docType,
    facts,
    goal,
    jurisdiction,
  ]);

  const renderTemplate = useMemo(
    () => (text: string) => {
      let out = text;
      for (const [k, v] of Object.entries(placeholderMap)) {
        out = out.split(k).join(v);
      }
      return out;
    },
    [placeholderMap]
  );

  const seededTemplate = useMemo(() => {
    if (!selectedTemplate) return "";
    return renderTemplate(selectedTemplate.templateText);
  }, [renderTemplate, selectedTemplate]);

  const generateWithAi = useMemo(
    () => async () => {
      if (!askEndpoint) return;
      if (!selectedTemplate) {
        toast.error("Elegí un template");
        return;
      }

      setAiLoading(true);
      try {
        const chatId = await ensureAiChat();

        const prompt = [
          "Sos un asistente legal para abogados en Argentina.",
          "IMPORTANTE: no inventes hechos ni normas; usá placeholders si faltan datos.",
          "",
          `TEMPLATE: ${selectedTemplate.name}`,
          selectedTemplate.systemInstruction,
          "",
          "PLANTILLA (con placeholders a completar):",
          seededTemplate,
          "",
          "Tareas:",
          "1) Completá la plantilla con el mejor texto posible usando la info disponible.",
          "2) Si falta información, dejá placeholders claros (no inventes).",
          "3) Mantené formato y títulos.",
          "",
          "Entregá SOLO el borrador final (sin preámbulos).",
        ].join("\n");

        setResult("");
        await askGeminiStream(
          prompt,
          (chunk) => {
            setResult((prev) => prev + chunk);
          },
          chatId ?? undefined,
          askEndpoint
        );
      } catch (e: unknown) {
        toast.error(e instanceof Error ? e.message : "No se pudo generar con IA");
      } finally {
        setAiLoading(false);
      }
    },
    [askEndpoint, ensureAiChat, seededTemplate, selectedTemplate]
  );

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {title || subtitle ? (
        <div>
          {title ? <h1 className="text-2xl font-semibold">{title}</h1> : null}
          {subtitle ? <p className="text-sm text-muted-foreground">{subtitle}</p> : null}
          {canPersist && (
            <p className="text-xs text-muted-foreground mt-1">
              Guardado local automático (este dispositivo). Todavía no sincroniza.
              {lastSavedAt ? ` Último guardado: ${new Date(lastSavedAt).toLocaleString()}` : ""}
            </p>
          )}
        </div>
      ) : null}

      <Card className="border-0" style={{ boxShadow: "none" }}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Parámetros</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {templates.length > 0 ? (
            <label className="block">
              <div className="text-xs font-medium text-muted-foreground mb-1">Template</div>
              <select
                className="w-full h-10 rounded-standard border border-border bg-background px-3 text-sm"
                value={templateId}
                onChange={(e) => setTemplateId(e.currentTarget.value)}
              >
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
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

          {/* Template-specific fields */}
          {selectedTemplate?.id === "carta-documento" ? (
            <>
              <Input
                placeholder="Fecha / lugar (ej: CABA, 21/02/2026)"
                value={docDatePlace}
                onChange={(e) => setDocDatePlace(e.currentTarget.value)}
              />
              <Input
                placeholder="Destinatario"
                value={docRecipient}
                onChange={(e) => setDocRecipient(e.currentTarget.value)}
              />
              <Input
                placeholder="Domicilio del destinatario"
                value={docRecipientAddress}
                onChange={(e) => setDocRecipientAddress(e.currentTarget.value)}
              />
              <Textarea
                value={docBody}
                onChange={(e) => setDocBody(e.currentTarget.value)}
                placeholder="Cuerpo de la carta documento"
                rows={5}
              />
            </>
          ) : null}

          {selectedTemplate?.id === "email-cliente" ? (
            <>
              <Input
                placeholder="Asunto"
                value={docSubject}
                onChange={(e) => setDocSubject(e.currentTarget.value)}
              />
              <Textarea
                value={docSummary}
                onChange={(e) => setDocSummary(e.currentTarget.value)}
                placeholder="Resumen"
                rows={3}
              />
              <Textarea
                value={docPending}
                onChange={(e) => setDocPending(e.currentTarget.value)}
                placeholder="Pendientes / lo que necesito del cliente"
                rows={3}
              />
              <Textarea
                value={docNextSteps}
                onChange={(e) => setDocNextSteps(e.currentTarget.value)}
                placeholder="Próximos pasos"
                rows={3}
              />
              <Input
                placeholder="Firma (ej: Dr/a. X - Estudio Y)"
                value={docSignature}
                onChange={(e) => setDocSignature(e.currentTarget.value)}
              />
            </>
          ) : null}

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

          {missingRequiredForTemplate.length > 0 ? (
            <div className="text-xs text-muted-foreground">
              Para usar IA en este template faltan: {missingRequiredForTemplate.join(", ")}.
            </div>
          ) : null}

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
              Generar (manual)
            </Button>

            {canUseAi ? (
              <Button
                type="button"
                disabled={aiLoading || missingRequiredForTemplate.length > 0}
                onClick={() => void generateWithAi()}
                title={
                  missingRequiredForTemplate.length > 0
                    ? `Faltan campos: ${missingRequiredForTemplate.join(", ")}`
                    : undefined
                }
              >
                {aiLoading
                  ? "Generando…"
                  : missingRequiredForTemplate.length > 0
                    ? "Completá campos"
                    : "Generar con IA"}
              </Button>
            ) : null}
            <Button type="button" variant="outline" onClick={() => setResult("")}> 
              Limpiar
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={result.trim().length === 0}
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(result);
                  toast.success("Borrador copiado");
                } catch {
                  toast.error("No se pudo copiar");
                }
              }}
            >
              Copiar
            </Button>

            <Button
              type="button"
              variant="outline"
              disabled={result.trim().length === 0}
              onClick={() => {
                try {
                  const stamp = new Date().toISOString().slice(0, 10);
                  const base = (docType || title || "borrador")
                    .toLowerCase()
                    .replace(/[^a-z0-9\- _]/g, "")
                    .trim()
                    .replace(/\s+/g, "-")
                    .slice(0, 48);

                  const filename = `${base || "borrador"}-${stamp}.txt`;
                  const blob = new Blob([result], { type: "text/plain;charset=utf-8" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = filename;
                  document.body.appendChild(a);
                  a.click();
                  a.remove();
                  URL.revokeObjectURL(url);
                  toast.success("Descarga iniciada");
                } catch {
                  toast.error("No se pudo descargar");
                }
              }}
            >
              Descargar .txt
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

      {selectedTemplate ? (
        <Card className="border-0" style={{ boxShadow: "none" }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Plantilla</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-xs text-muted-foreground">
              Vista previa de la plantilla con datos disponibles (lo que falte queda como placeholder).
            </div>
            <Textarea value={seededTemplate} readOnly rows={10} />
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setResult(seededTemplate);
                  toast.success("Plantilla insertada en el borrador");
                }}
              >
                Insertar plantilla
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

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
