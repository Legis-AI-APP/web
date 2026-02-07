"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, type Variants } from "framer-motion";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { ChatMessage } from "@/lib/chats-service";
import { askGeminiStream } from "@/lib/ask-gemini-stream";
import { Bot, Menu } from "lucide-react";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputButton,
} from "@/components/ai-elements/prompt-input";
import { useIsMobile } from "@/hooks/use-mobile";

interface CaseChatAreaProps {
  caseData: {
    id: string;
    title: string;
    clientName: string;
    status: string;
    partyA: string;
    partyB: string;
    matter: string;
  };
  onOpenPanel?: () => void;
}

export default function CaseChatArea({ caseData, onOpenPanel }: CaseChatAreaProps) {
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [chatId, setChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const bufferRef = useRef<string[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const isMobile = useIsMobile();

  const suggestions = useMemo(
    () => [
      `¿Analizamos la demanda de ${caseData.matter}?`,
      `¿Qué documentos faltan para ${caseData.partyA}?`,
      `¿Cuáles son los próximos pasos en este caso?`,
      `¿Revisamos la estrategia legal para ${caseData.matter}?`,
      `¿Necesitamos preparar algo para la próxima audiencia?`,
      `¿Hay algún riesgo legal en este caso?`,
    ],
    [caseData]
  );

  const ensureCaseChat = useCallback(async (): Promise<string> => {
    if (chatId) return chatId;

    const res = await fetch(`/api/cases/${caseData.id}/chats`, {
      method: "POST",
      credentials: "include",
    });
    if (!res.ok) throw new Error("No se pudo crear el chat del caso");
    const data = (await res.json()) as { chat_id: string };
    setChatId(data.chat_id);
    return data.chat_id;
  }, [caseData.id, chatId]);

  const handleSend = useCallback(
    async (prompt: string) => {
      const content = prompt.trim();
      if (!content || submitting) return;

      setSubmitting(true);
      bufferRef.current = [];

      const userMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content,
      };

      setMessages((prev) => [...prev, userMessage]);

      try {
        const activeChatId = await ensureCaseChat();
        await askGeminiStream(
          content,
          (chunk) => {
            bufferRef.current.push(chunk);
          },
          activeChatId,
          `/api/ai/ask/case/${caseData.id}`
        );
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Error al consultar la IA";
        toast.error(msg);
      } finally {
        setSubmitting(false);
      }
    },
    [caseData.id, ensureCaseChat, submitting]
  );

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
          }

          return [...prev, { id: crypto.randomUUID(), role: "assistant", content: next }];
        });
      }
    }, 15);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const fadeIn: Variants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      {/* Header */}
      <motion.div
        className="bg-background/80 backdrop-blur-sm border-b px-6 py-4"
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
              <h1 className="text-lg font-semibold text-foreground">IA Legal — Asunto</h1>
              <p className="text-sm text-muted-foreground">{caseData.partyA} c/ {caseData.partyB} — {caseData.matter}</p>
            </div>
          </div>

          {isMobile && onOpenPanel && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onOpenPanel}
              className="h-10 w-10"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
        </div>
      </motion.div>

      {/* Conversation */}
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full">
        <Conversation className="flex-1">
          <ConversationContent>
            {messages.length === 0 ? (
              <ConversationEmptyState
                title="¿Cómo puedo ayudarte con este caso?"
                description={suggestions[0]}
              />
            ) : (
              messages.map((m) => (
                <Message key={m.id} from={m.role}>
                  <MessageContent>
                    {m.role === "assistant" ? (
                      <MessageResponse>{m.content}</MessageResponse>
                    ) : (
                      m.content
                    )}
                  </MessageContent>
                </Message>
              ))
            )}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>

        {/* Input */}
        <div className="border-t bg-background px-4 py-3">
          <PromptInput
            onSubmit={({ text }) => {
              if (!text) return;
              setMessage("");
              return handleSend(text);
            }}
          >
            <PromptInputTextarea
              value={message}
              onChange={(e) => setMessage(e.currentTarget.value)}
              placeholder="Escribí tu consulta..."
              disabled={submitting}
            />
            <PromptInputFooter>
              <div className="flex-1" />
              <PromptInputButton type="submit" disabled={submitting || message.trim().length === 0}>
                Enviar
              </PromptInputButton>
            </PromptInputFooter>
          </PromptInput>
        </div>
      </div>
    </div>
  );
}
