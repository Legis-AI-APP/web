/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useRef, useEffect } from "react";
import { askGeminiStream } from "@/lib/ask-gemini-stream";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowUpIcon } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export default function Home() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasAsked, setHasAsked] = useState(false);

  const bufferRef = useRef<string[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      const next = bufferRef.current.shift();
      if (next) setAnswer((prev) => prev + next);
    }, 15);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const handleAsk = async () => {
    if (!question.trim()) return;

    setHasAsked(true);
    setLoading(true);
    setAnswer("");
    bufferRef.current = [];

    try {
      await askGeminiStream(question, (chunk) => {
        bufferRef.current.push(chunk);
      });
    } catch (err: any) {
      toast.error(err.message || "Error al pedir respuesta a la IA");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full max-w-4xl mx-auto relative">
      <AnimatePresence mode="wait">
        {!hasAsked && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
            className="flex flex-1 flex-col items-center justify-center text-center"
          >
            <h1 className="text-3xl font-semibold text-muted-foreground mb-6">
              Bienvenido/a
            </h1>
            <motion.div
              initial={{ y: 0 }}
              animate={{ y: 0 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="w-full max-w-xl mx-auto"
            >
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAsk();
                }}
                className="flex items-center rounded-full px-4 py-2 border bg-transparent"
              >
                <Input
                  placeholder="¿Qué vamos a hacer hoy?"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="flex-1 border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent py-3"
                />
                <Button
                  type="submit"
                  disabled={loading}
                  className="rounded-full w-10 h-10 p-2 ml-2"
                >
                  <ArrowUpIcon className="w-5 h-5" />
                </Button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {hasAsked && (
        <>
          <div className="flex-1 overflow-y-auto space-y-4 pb-32">
            <AnimatePresence>
              {answer && (
                <motion.div
                  key={answer}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="rounded-xl border-none shadow-none bg-transparent">
                    <CardContent className="pt-0 text-sm whitespace-pre-wrap text-muted-foreground">
                      {answer}
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <motion.div
            key="input"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="sticky bottom-0 left-0 w-full bg-transparent z-10"
          >
            <div className="w-full max-w-xl mx-auto">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAsk();
                }}
                className="flex items-center rounded-full px-4 py-2 border bg-transparent"
              >
                <Input
                  placeholder="Escribí tu pregunta..."
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="flex-1 border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent py-3"
                />
                <Button
                  type="submit"
                  disabled={loading}
                  className="rounded-full w-10 h-10 p-2 ml-2"
                >
                  <ArrowUpIcon className="w-5 h-5" />
                </Button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
}
