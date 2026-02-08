"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, type Variants } from "framer-motion";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { Bot, Menu } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import type { Chat, ChatMessage } from "@/lib/chats-service";
import { askGeminiStream } from "@/lib/ask-gemini-stream";
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
  const [loadingHistory, setLoadingHistory] = useState(false);

  void loadingHistory;
  const bufferRef = useRef<string[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const isMobile = useIsMobile();
  const router = useRouter();
  const searchParams = useSearchParams();

  const suggestions = useMemo(
    () => [
      `Resumime el estado del cliente ${client.first_name} ${client.last_name}`,
      "¿Qué documentos faltan para este cliente?",
      "¿Qué próximos pasos recomendarías?",
      "Armá un checklist de diligencias para este cliente",
    ],
    [client.first_name, client.last_name]
  );

  const loadChatHistory = useCallback(async (id: string) => {
    setLoadingHistory(true);
    try {
      const res = await fetch(`/api/chats/${id}`, {
        method: "GET",
        credentials: "include",
      });
      if (!res.ok) throw new Error("No se pudo cargar el historial del chat");
      const json = (await res.json()) as Chat;
      setMessages(json.messages ?? []);
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  const createNewClientChat = useCallback(async (): Promise<string> => {
    const res = await fetch(`/api/clients/${client.id}/chats`, {
      method: "POST",
      credentials: "include",
    });

    if (!res.ok) throw new Error("No se pudo crear el chat del cliente");
    const data = (await res.json()) as { chat_id: string };

    // deep link
    router.replace(`/clients/${client.id}?chatId=${data.chat_id}`);
    setChatId(data.chat_id);
    setMessages([]);

    return data.chat_id;
  }, [client.id, router]);

  const ensureClientChat = useCallback(async (): Promise<string> => {
    if (chatId) return chatId;
    return createNewClientChat();
  }, [chatId, createNewClientChat]);

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
        const activeChatId = await ensureClientChat();
        await askGeminiStream(
          content,
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
    [client.id, ensureClientChat, submitting]
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
    const fromUrl = searchParams.get("chatId");
    if (fromUrl && fromUrl !== chatId) {
      setChatId(fromUrl);
    }
  }, [searchParams, chatId]);

  useEffect(() => {
    if (chatId) void loadChatHistory(chatId);
  }, [chatId, loadChatHistory]);

  const fadeIn: Variants = { initial: { opacity: 0 }, animate: { opacity: 1 } };

  return (
    <div className="flex flex-col h-[calc(100vh-260px)] min-h-[520px]">
      {/* Header */}
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
            <Button variant="ghost" size="icon" onClick={onOpenPanel} className="h-9 w-9">
              <Menu className="h-5 w-5" />
            </Button>
          )}
        </div>
      </motion.div>

      {/* Conversation */}
      <div className="flex-1 flex flex-col">
        <Conversation className="flex-1">
          <ConversationContent>
            {messages.length === 0 ? (
              <ConversationEmptyState
                title="¿Qué querés revisar de este cliente?"
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
