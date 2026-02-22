"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { askGeminiStream } from "@/lib/ask-gemini-stream";

export default function SearchAskAi({ query }: { query: string }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [chatId, setChatId] = useState<string | null>(null);

  const storageKey = "legis.search.aiChatId";

  useEffect(() => {
    // avoid showing stale suggestions for a different query
    setResult("");
  }, [query]);

  const ensureChat = useMemo(
    () => async (): Promise<string | null> => {
      if (chatId) return chatId;

      try {
        const cached = window.localStorage.getItem(storageKey);
        if (cached) {
          setChatId(cached);
          return cached;
        }
      } catch {
        // ignore
      }

      const res = await fetch("/api/chats", { method: "POST", credentials: "include" });
      if (!res.ok) throw new Error("No se pudo crear chat para IA");
      const json = (await res.json()) as { chat_id: string };
      setChatId(json.chat_id);

      try {
        window.localStorage.setItem(storageKey, json.chat_id);
      } catch {
        // ignore
      }

      return json.chat_id;
    },
    [chatId]
  );

  const ask = useMemo(
    () => async () => {
      const q = query.trim();
      if (!q) return;

      setLoading(true);
      setResult("");

      try {
        const cid = await ensureChat();

        const prompt = [
          "Sos un asistente legal.",
          "Contexto: el usuario está usando una pantalla de búsqueda interna de casos y clientes.",
          "Ayudá con ideas de búsqueda, normalización de términos, sin inventar hechos.",
          "Si respondés con información legal (normas/jurisprudencia), marcá claramente que requiere verificación con fuentes.",
          "",
          `Consulta: ${q}`,
          "",
          "Devolvé:",
          "- 5-10 palabras clave / variantes (incluye sinónimos y errores comunes)",
          "- 3 filtros o estrategias (por ejemplo: por estado, por DNI, por email)",
          "- 1 disclaimer corto si corresponde",
        ].join("\n");

        await askGeminiStream(
          prompt,
          (chunk) => setResult((prev) => prev + chunk),
          cid ?? undefined,
          "/api/ai/ask"
        );
      } catch (e: unknown) {
        toast.error(e instanceof Error ? e.message : "No se pudo consultar a la IA");
      } finally {
        setLoading(false);
      }
    },
    [ensureChat, query]
  );

  return (
    <Card className="border-0" style={{ boxShadow: "none" }}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Preguntar a la IA (beta)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="text-xs text-muted-foreground">
          Te ayuda a mejorar la búsqueda. Si menciona normas/jurisprudencia: verificá fuentes.
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={() => void ask()} disabled={loading || query.trim().length < 2}>
            {loading ? "Consultando…" : "Preguntar"}
          </Button>
          <Button type="button" variant="outline" onClick={() => setResult("")} disabled={loading}>
            Limpiar
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={!result.trim() || loading}
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(result);
                toast.success("Copiado");
              } catch {
                toast.error("No se pudo copiar");
              }
            }}
          >
            Copiar
          </Button>
        </div>
        {result ? (
          <Textarea value={result} readOnly rows={8} className="text-sm" />
        ) : (
          <div className="text-xs text-muted-foreground">(respuesta acá)</div>
        )}
      </CardContent>
    </Card>
  );
}
