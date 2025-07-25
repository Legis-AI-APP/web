/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowUpIcon } from "lucide-react";
import { toast } from "sonner";
import { createChat } from "@/lib/chats-service";

export default function Home() {
  const [question, setQuestion] = useState("");
  const [hasAsked, setHasAsked] = useState(false);
  const router = useRouter();

  const handleAsk = async () => {
    const prompt = question.trim();
    if (!prompt) return;

    setHasAsked(true);
    setQuestion("");

    const animationDone = new Promise<void>((resolve) =>
      setTimeout(resolve, 600)
    );

    try {
      const chat = await createChat();
      if (chat instanceof Response) {
        throw new Error(`Error creating chat: ${chat.statusText}`);
      }

      await animationDone;
      router.push(`/chat/${chat.chat_id}?prompt=${encodeURIComponent(prompt)}`);
    } catch (err: any) {
      toast.error("Error al crear la conversación");
      setHasAsked(false);
    }
  };

  return (
    <div className="flex flex-col h-screen items-center justify-center px-4 text-center">
      <AnimatePresence mode="wait">
        {!hasAsked && (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="w-full max-w-xl"
          >
            <h1 className="text-3xl font-semibold text-muted-foreground mb-6">
              Bienvenido/a
            </h1>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAsk();
              }}
              className="flex items-center rounded-full px-4 py-2 border bg-card"
            >
              <Input
                placeholder="¿Qué vamos a hacer hoy?"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="flex-1 border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent py-3"
              />
              <Button
                type="submit"
                disabled={!question.trim()}
                className="rounded-full w-10 h-10 p-2 ml-2"
              >
                <ArrowUpIcon className="w-5 h-5" />
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
