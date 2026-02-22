/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createChat } from "@/lib/chats-service";
import { SuggestionBar } from "@/components/SuggestionBar";
import { motion, Variants } from "framer-motion";
import ChatInput from "@/components/chat/ChatInput";
import { Button } from "@/components/ui/button";

export default function HomeClient({
  counts,
  recent,
}: {
  counts: {
    cases: number;
    clients: number;
  };
  recent: {
    cases: Array<{ id: string; title: string }>;
    clients: Array<{ id: string; name: string }>;
  };
}) {
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const suggestions = useMemo(
    () => [
      "Sos abogado/a en Argentina. Hacé un resumen ejecutivo del caso en 10 bullets",
      "Redactá una carta documento (Argentina) con placeholders",
      "Checklist de próximos pasos para este asunto",
      "Explicame una cláusula de confidencialidad en criollo",
      "Revisá este texto y marcá riesgos legales",
      "Borrador de email al cliente pidiendo documentación",
    ],
    []
  );

  const handleSuggestionClick = (s: string) => setMessage(s);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const prompt = message.trim();
    if (!prompt || submitting) return;

    setSubmitting(true);
    try {
      const chat = await createChat();
      if (chat instanceof Response) {
        throw new Error(`Error creating chat: ${chat.statusText}`);
      }
      router.push(`/chat/${chat.chat_id}?prompt=${encodeURIComponent(prompt)}`);
    } catch (err: any) {
      toast.error("Error al crear la conversación");
      setSubmitting(false);
    }
  };

  // Variants suaves y consistentes
  const fadeIn: Variants = { initial: { opacity: 0 }, animate: { opacity: 1 } };
  const upIn: Variants = {
    initial: { opacity: 0, y: 8, filter: "blur(2px)" },
    animate: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { type: "spring", stiffness: 160, damping: 18 },
    },
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pb-22 pt-8">
      <div className="w-full max-w-3xl space-y-6">
        {/* Hero */}
        <motion.div
          className="text-center"
          initial="initial"
          animate="animate"
          variants={fadeIn}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <h1 className="text-3xl sm:text-4xl font-medium mb-4 text-foreground">
            ¿Qué vamos a hacer hoy?
          </h1>
          <div className="text-sm text-muted-foreground">
            {counts.cases} asunto(s) · {counts.clients} cliente(s)
          </div>
        </motion.div>

        {/* Input usando el componente ChatInput */}
        <motion.div
          className="max-w-3xl mx-auto w-full"
          initial="initial"
          animate="animate"
          variants={upIn}
          transition={{ delay: 0.05 }}
        >
          <ChatInput value={message} onChange={setMessage} onSubmit={handleSend} disabled={submitting} />
        </motion.div>

        {/* Sugerencias */}
        <SuggestionBar items={suggestions} onPick={handleSuggestionClick} />

        {/* Quick links */}
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-3 gap-2"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18, duration: 0.35 }}
        >
          <Button asChild variant="outline" className="justify-start">
            <Link href="/cases">Asuntos</Link>
          </Button>
          <Button asChild variant="outline" className="justify-start">
            <Link href="/clients">Clientes</Link>
          </Button>
          <Button asChild variant="outline" className="justify-start">
            <Link href="/documents">Documentos</Link>
          </Button>
          <Button asChild variant="outline" className="justify-start">
            <Link href="/search">Buscar</Link>
          </Button>
          <Button asChild variant="outline" className="justify-start">
            <Link href="/draft">Redactor</Link>
          </Button>
        </motion.div>

        {/* Recent */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 gap-3"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22, duration: 0.35 }}
        >
          <div className="rounded-standard border border-border p-3">
            <div className="text-xs font-medium text-muted-foreground mb-2">Recientes — Asuntos</div>
            {recent.cases.length === 0 ? (
              <div className="text-xs text-muted-foreground">Sin asuntos todavía.</div>
            ) : (
              <div className="space-y-1">
                {recent.cases.map((c) => (
                  <Link
                    key={c.id}
                    href={`/cases/${c.id}/overview`}
                    className="block text-sm truncate hover:underline"
                    title={c.title}
                  >
                    {c.title}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-standard border border-border p-3">
            <div className="text-xs font-medium text-muted-foreground mb-2">Recientes — Clientes</div>
            {recent.clients.length === 0 ? (
              <div className="text-xs text-muted-foreground">Sin clientes todavía.</div>
            ) : (
              <div className="space-y-1">
                {recent.clients.map((c) => (
                  <Link
                    key={c.id}
                    href={`/clients/${c.id}/overview`}
                    className="block text-sm truncate hover:underline"
                    title={c.name}
                  >
                    {c.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Nota breve */}
        <motion.p
          className="text-center text-xs text-muted-foreground"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.35 }}
        >
          Pegá un resumen o pedí que redacte un documento. También podés adjuntar archivos en el chat.
        </motion.p>
      </div>
    </div>
  );
}
