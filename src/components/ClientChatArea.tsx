"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, type Variants } from "framer-motion";
import { Button } from "@/components/ui/button";
import ChatInput from "@/components/chat/ChatInput";
import MessageBubble from "@/components/chat/MessageBubble";
import { SuggestionBar } from "@/components/SuggestionBar";
import { toast } from "sonner";
import { Bot, Menu, Users } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import type { ChatMessage } from "@/lib/chats-service";
import { askGeminiStream } from "@/lib/ask-gemini-stream";

interface ClientChatAreaProps {
  client: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    document: string;
    document_type: string;
  };
  onOpenPanel?: () => void;
}

export default function ClientChatArea({ client, onOpenPanel }: ClientChatAreaProps) {
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [chatId, setChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const bufferRef = useRef<string[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const isMobile = useIsMobile();

  const suggestions = useMemo(
    () => [
      `Resumime el estado del cliente ${client.first_name} ${client.last_name}`,
      "¿Qué documentos faltan para este cliente?",
      "¿Qué próximos pasos recomendarías?",
      "Armá un checklist de diligencias para este cliente",
    ],
    [client.first_name, client.last_name]
  );

  const ensureClientChat = useCallback(async (): Promise<string> => {
    if (chatId) return chatId;

    const res = await fetch(`/api/clients/${client.id}/chats`, {
      method: "POST",
      credentials: "include",
    });

    if (!res.ok) throw new Error("No se pudo crear el chat del cliente");
    const data = (await res.json()) as { chat_id: string };
    setChatId(data.chat_id);
    return data.chat_id;
  }, [chatId, client.id]);

  const handleSend = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();
      const prompt = message.trim();
      if (!prompt || submitting) return;

      setSubmitting(true);
      bufferRef.current = [];

      const userMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: prompt,
      };

      setMessages((prev) => [...prev, userMessage]);
      setMessage("");

      try {
        const activeChatId = await ensureClientChat();
        await askGeminiStream(
          prompt,
          (chunk) => {
            bufferRef.current.push(chunk);
          },
          activeChatId,
          `/api/ai/ask/client/${client.id}`
        );
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Error al consultar la IA";
        toast.error(msg);
      } finally {
        setSubmitting(false);
      }
    },
    [client.id, ensureClientChat, message, submitting]
  );

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      const next = bufferRef.current.shift();
      if (next) {
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last?.role === "assistant") {
            const updated = [...prev];
            updated[updated.length - 1] = { ...last, content: last.content + next };
            return updated;
          }
          return [...prev, { id: crypto.randomUUID(), role: "assistant", content: next }];
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
    <div className="flex flex-col h-[calc(100vh-260px)] min-h-[520px]">
      <motion.div
        className="bg-background/80 backdrop-blur-sm border-b px-4 py-3"
        initial="initial"
        animate="animate"
        variants={fadeIn}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Bot className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="text-sm font-semibold">IA Legal — Cliente</div>
              <div className="text-xs text-muted-foreground">
                {client.first_name} {client.last_name}
              </div>
            </div>
          </div>

          {isMobile && onOpenPanel && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onOpenPanel}
              className="h-9 w-9"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
        </div>
      </motion.div>

      <div className="flex-1 flex flex-col px-4 py-4">
        {messages.length === 0 ? (
          <motion.div
            className="flex-1 flex flex-col justify-center gap-6"
            initial="initial"
            animate="animate"
            variants={fadeIn}
          >
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>
                Consultas sobre el cliente y sus documentos ({client.document_type}: {client.document})
              </span>
            </div>

            <motion.div variants={upIn}>
              <SuggestionBar items={suggestions} onPick={setMessage} />
            </motion.div>
          </motion.div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-4">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} role={msg.role} content={msg.content} />
            ))}
            <div ref={bottomRef} />
          </div>
        )}

        <motion.div variants={upIn} className="mt-4">
          <ChatInput
            value={message}
            onChange={setMessage}
            onSubmit={handleSend}
            disabled={submitting}
          />
        </motion.div>
      </div>
    </div>
  );
}
