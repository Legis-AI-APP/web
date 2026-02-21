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
}: {
  counts: {
    cases: number;
    clients: number;
  };
}) {
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const suggestions = useMemo(
    () => [
      "¿Querés que analice un contrato?",
      "¿Redactamos una carta documento?",
      "¿Necesitás ayuda con un reclamo por daños?",
      "¿Tenés dudas sobre derechos del consumidor?",
      "Explicame una cláusula de confidencialidad",
      "Hacé un resumen legal de este PDF",
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
