/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { ChatMessage } from "@/lib/chats-service";
import { askGeminiStream } from "@/lib/ask-gemini-stream";
import MessageBubble from "@/components/chat/MessageBubble";
import ChatInput from "@/components/chat/ChatInput";

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

  const searchParams = useSearchParams();
  const router = useRouter();

  const promptUsedRef = useRef(false);
  const initialPromptRef = useRef<string | null>(null);

  if (initialPromptRef.current === null) {
    initialPromptRef.current = searchParams.get("prompt");
  }

  const handleAsk = useCallback(
    async (input?: string) => {
      const content = input ?? question.trim();
      if (!content) return;

      setLoading(true);
      bufferRef.current = [];

      const userMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content,
      };

      setMessages((prev) => [...prev, userMessage]);
      if (!input) setQuestion("");

      try {
        const scope = searchParams.get("scope");
        const caseId = searchParams.get("caseId");
        const clientId = searchParams.get("clientId");

        const endpoint =
          scope === "case" && caseId
            ? `/api/ai/ask/case/${caseId}`
            : scope === "client" && clientId
              ? `/api/ai/ask/client/${clientId}`
              : "/api/ai/ask";

        const response = askGeminiStream(
          content,
          (chunk) => {
            bufferRef.current.push(chunk);
          },
          chatId,
          endpoint
        );
        await response;
      } catch (err: any) {
        toast.error(err.message || "Error al pedir respuesta a la IA");
      } finally {
        setLoading(false);
      }
    },
    [chatId, question]
  );

  useEffect(() => {
    if (!promptUsedRef.current && initialPromptRef.current) {
      promptUsedRef.current = true;
      handleAsk(initialPromptRef.current);
      router.replace(`/chat/${chatId}`);
    }
  }, [chatId, handleAsk, router]);

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

  return (
    <div className="flex flex-col h-screen overflow-hidden relative">
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} role={msg.role} content={msg.content} />
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
          <ChatInput
            value={question}
            onChange={setQuestion}
            onSubmit={(e) => {
              e.preventDefault();
              handleAsk();
            }}
            disabled={loading}
          />
        </div>
      </motion.div>
    </div>
  );
}
