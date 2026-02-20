"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Bot, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
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

import type { Chat, ChatMessage } from "@/lib/chats-service";
import { askGeminiStream } from "@/lib/ask-gemini-stream";
import { cn } from "@/lib/utils";

export type ScopedChatWorkspaceProps = {
  scopeLabel: "Asunto" | "Cliente";
  scopeBasePath: string; // e.g. /cases/:id or /clients/:id
  headerTitle: string;
  headerSubtitle: string;
  listChatsPath: string; // e.g. /api/cases/:id/chats
  createChatPath: string; // e.g. /api/cases/:id/chats
  askPath: string; // e.g. /api/ai/ask/case/:id
  rightPanel: React.ReactNode;
};

export default function ScopedChatWorkspace({
  scopeLabel,
  scopeBasePath,
  headerTitle,
  headerSubtitle,
  listChatsPath,
  createChatPath,
  askPath,
  rightPanel,
}: ScopedChatWorkspaceProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [chats, setChats] = useState<Array<{ id: string; title?: string | null }>>([]);
  const [chatId, setChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const bufferRef = useRef<string[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const suggestions = useMemo(() => {
    if (scopeLabel === "Asunto") {
      return [
        "¿Qué próximos pasos sugerís?",
        "Resumime los hechos clave del caso",
        "¿Qué documentos faltan?",
      ];
    }

    return [
      "Resumime el estado del cliente",
      "¿Qué documentos faltan?",
      "Armá un checklist de diligencias",
    ];
  }, [scopeLabel]);

  const titleForChat = useCallback(
    (id: string, title?: string | null) => {
      if (title && title.trim().length > 0) return title;
      const idx = chats.findIndex((c) => c.id === id);
      if (idx >= 0) return `Chat #${idx + 1}`;
      return `Chat ${id.slice(0, 6)}`;
    },
    [chats]
  );

  const refreshChats = useCallback(async () => {
    const res = await fetch(listChatsPath, { method: "GET", credentials: "include" });
    if (!res.ok) return;

    const json = (await res.json()) as Array<{ id: string; title?: string | null }>;
    setChats(json);

    const fromUrl = searchParams.get("chatId");
    if (!chatId) {
      if (fromUrl) setChatId(fromUrl);
      else if (json.length > 0) setChatId(json[0]!.id);
    }
  }, [listChatsPath, searchParams, chatId]);

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

  const createNewChat = useCallback(async (): Promise<string> => {
    const res = await fetch(createChatPath, {
      method: "POST",
      credentials: "include",
    });

    if (!res.ok) throw new Error(`No se pudo crear el chat del ${scopeLabel.toLowerCase()}`);
    const data = (await res.json()) as { chat_id: string };

    await refreshChats();

    setChatId(data.chat_id);
    setMessages([]);

    // canonical deep-link for shareability
    router.replace(`${scopeBasePath}?chatId=${data.chat_id}`);

    return data.chat_id;
  }, [createChatPath, refreshChats, router, scopeLabel, scopeBasePath]);

  const ensureChat = useCallback(async (): Promise<string> => {
    if (chatId) return chatId;
    return createNewChat();
  }, [chatId, createNewChat]);

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
        const activeChatId = await ensureChat();
        await askGeminiStream(
          content,
          (chunk) => {
            bufferRef.current.push(chunk);
          },
          activeChatId,
          askPath
        );
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Error al consultar la IA";
        toast.error(msg);
      } finally {
        setSubmitting(false);
      }
    },
    [askPath, ensureChat, submitting]
  );

  // stream buffer → messages
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

  // initial load
  useEffect(() => {
    void refreshChats();
  }, [refreshChats]);

  // follow url changes
  useEffect(() => {
    const fromUrl = searchParams.get("chatId");
    if (fromUrl && fromUrl !== chatId) setChatId(fromUrl);
  }, [searchParams, chatId]);

  useEffect(() => {
    if (chatId) void loadChatHistory(chatId);
  }, [chatId, loadChatHistory]);

  const ChatsList = (
    <div className="h-full flex flex-col">
      <div className="px-4 py-3 flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold">Chats</div>
          <div className="text-xs text-muted-foreground">{scopeLabel}</div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => void createNewChat().catch((e) => toast.error(String(e)))}
          disabled={submitting}
        >
          <Plus className="h-4 w-4 mr-1" />
          Nuevo
        </Button>
      </div>
      <Separator />
      <div className="flex-1 overflow-y-auto p-2">
        {chats.length === 0 ? (
          <div className="text-xs text-muted-foreground p-2">Sin chats todavía</div>
        ) : (
          <div className="flex flex-col gap-1">
            {chats.map((c) => {
              const active = c.id === chatId;
              const label = titleForChat(c.id, c.title);
              return (
                <button
                  key={c.id}
                  onClick={() => router.replace(`${scopeBasePath}?chatId=${c.id}`)}
                  className={cn(
                    "w-full text-left px-2 py-2 rounded-md text-sm transition",
                    active ? "bg-primary text-primary-foreground" : "hover:bg-accent/50"
                  )}
                  title={label}
                >
                  <span className="truncate block text-[13px]">{label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  const ChatMain = (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="px-4 py-3 border-b bg-background/80 backdrop-blur-sm shrink-0 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Bot className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold">{headerTitle}</div>
            <div className="text-xs text-muted-foreground truncate">{headerSubtitle}</div>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden">
        <Conversation className="h-full overflow-hidden">
          <ConversationContent>
            {messages.length === 0 ? (
              <ConversationEmptyState title="Arrancamos" description={suggestions[0]} />
            ) : (
              messages.map((m) => (
                <Message key={m.id} from={m.role}>
                  <MessageContent>
                    {m.role === "assistant" ? <MessageResponse>{m.content}</MessageResponse> : m.content}
                  </MessageContent>
                </Message>
              ))
            )}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>
      </div>

      <div className="border-t bg-background px-4 py-3 shrink-0">
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
            placeholder={loadingHistory ? "Cargando..." : "Escribí tu consulta..."}
            disabled={submitting || loadingHistory}
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
  );

  // Mobile-first: tabs. Desktop: 3-column workspace.
  return (
    <div className="h-[calc(100dvh-0px)] overflow-hidden">
      <div className="lg:hidden h-full overflow-hidden">
        <Tabs defaultValue="chat" className="h-full flex flex-col overflow-hidden">
          <TabsList className="grid grid-cols-3 rounded-none shrink-0 sticky top-0 z-10 bg-background">
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="chats">Chats</TabsTrigger>
            <TabsTrigger value="info">Info</TabsTrigger>
          </TabsList>
          <TabsContent value="chat" className="flex-1 min-h-0 m-0 overflow-hidden">{ChatMain}</TabsContent>
          <TabsContent value="chats" className="flex-1 min-h-0 m-0 overflow-hidden">{ChatsList}</TabsContent>
          <TabsContent value="info" className="flex-1 min-h-0 m-0 overflow-auto">{rightPanel}</TabsContent>
        </Tabs>
      </div>

      <div className="hidden lg:grid h-full grid-cols-[280px_minmax(0,1fr)_340px] overflow-hidden">
        <div className="border-r bg-sidebar overflow-hidden">{ChatsList}</div>
        <div className="min-w-0 overflow-hidden">{ChatMain}</div>
        <div className="border-l bg-sidebar overflow-auto">{rightPanel}</div>
      </div>
    </div>
  );
}
