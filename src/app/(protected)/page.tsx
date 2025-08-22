/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import { toast } from "sonner";
import { createChat } from "@/lib/chats-service";
import { cn } from "@/lib/utils";
import { SuggestionBar } from "@/components/SuggestionBar";
import { motion, Variants } from "framer-motion";

export default function Home() {
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

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
      <div className="w-full max-w-2xl space-y-6">
        {/* Hero */}
        <motion.div
          className="text-center"
          initial="initial"
          animate="animate"
          variants={fadeIn}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <h1 className="text-3xl sm:text-4xl font-medium mb-10 text-foreground">
            ¿Qué vamos a hacer hoy?
          </h1>
        </motion.div>

        {/* Input con botón adentro */}
        <motion.form
          onSubmit={handleSend}
          className="relative max-w-3xl mx-auto w-full"
          initial="initial"
          animate="animate"
          variants={upIn}
          transition={{ delay: 0.05 }}
        >
          <div className="bg-card/60 backdrop-blur-sm border border-border rounded-full shadow-sm">
            <div className="relative flex items-center">
              <Input
                ref={inputRef}
                placeholder="Escribí tu consulta legal aquí..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className={cn(
                  "h-12 px-5 pr-14 w-full rounded-full text-base bg-transparent border-0 shadow-none",
                  "focus-visible:ring-0 focus-visible:ring-offset-0"
                )}
                disabled={submitting}
              />
              <div className="absolute right-1.5">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.15 }}
                >
                  <Button
                    type="submit"
                    size="icon"
                    className="h-9 w-9 rounded-full"
                    disabled={submitting || !message.trim()}
                    aria-label="Enviar"
                    asChild={false}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.form>

        {/* Sugerencias: UNA SOLA FILA, solo completas (con animaciones) */}
        <SuggestionBar items={suggestions} onPick={handleSuggestionClick} />

        {/* Nota breve */}
        <motion.p
          className="text-center text-xs text-muted-foreground"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.35 }}
        >
          Pegá un resumen o pedí que redacte un documento. También podés
          adjuntar archivos en el chat.
        </motion.p>
      </div>
    </div>
  );
}
