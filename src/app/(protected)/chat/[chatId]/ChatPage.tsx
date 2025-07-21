/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowUpIcon } from "lucide-react";
import { motion } from "framer-motion";
import { ChatMessage } from "@/lib/chats-service";
import { askGeminiStream } from "@/lib/ask-gemini-stream";

type Props = {
  chatId: string;
  initialMessages: ChatMessage[];
};

export default function ChatPage({ chatId, initialMessages }: Props) {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [loading, setLoading] = useState(false);
  const bufferRef = useRef<string[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      const next = bufferRef.current.shift();
      if (next) {
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last?.role === "assistant") {
            const updated = [...prev];
            updated[updated.length - 1] = {
              ...last,
              content: last.content + next,
            };
            return updated;
          } else {
            return [
              ...prev,
              { id: crypto.randomUUID(), role: "assistant", content: next },
            ];
          }
        });
      }
    }, 15);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleAsk = async () => {
    if (!question.trim()) return;

    setLoading(true);
    bufferRef.current = [];

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: question,
    };

    setMessages((prev) => [...prev, userMessage]);

    try {
      const response = askGeminiStream(
        question,
        (chunk) => {
          bufferRef.current.push(chunk);
        },
        chatId
      );
      setQuestion("");
      await response;
    } catch (err: any) {
      toast.error(err.message || "Error al pedir respuesta a la IA");
    } finally {
      setLoading(false);
      setQuestion("");
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden relative">
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`w-full flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <Card
              className={`${
                msg.role === "user"
                  ? "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white py-1 px-0"
                  : "bg-transparent shadow-none border-none text-muted-foreground"
              } ${msg.role === "user" ? "max-w-[60%]" : "w-full"} rounded-xl`}
            >
              <CardContent
                className={`text-sm whitespace-pre-wrap px-3 ${
                  msg.role === "user" ? "text-right" : ""
                }`}
              >
                {msg.content}
              </CardContent>
            </Card>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <motion.div
        key="input"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="sticky bottom-0 left-0 w-full bg-background z-10 border-t"
      >
        <div className="w-full max-w-4xl mx-auto px-4 py-2">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAsk();
            }}
            className="flex items-center rounded-full px-4 py-2 border bg-card"
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
    </div>
  );
}
