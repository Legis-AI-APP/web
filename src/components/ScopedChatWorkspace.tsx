"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Bot, Plus, PanelLeft, X, Sparkles } from "lucide-react";

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

  const [showChat, setShowChat] = useState(true);

  // Persist per scope so the UI feels intentional ("if I hide chat, keep it hidden")
  useEffect(() => {
    try {
      const key = `legis.scopedWorkspace.showChat:${scopeBasePath}`;
      const raw = window.localStorage.getItem(key);
      if (raw === null) return;
      setShowChat(raw === "true");
    } catch {
      // ignore
    }
  }, [scopeBasePath]);

  useEffect(() => {
    try {
      const key = `legis.scopedWorkspace.showChat:${scopeBasePath}`;
      window.localStorage.setItem(key, String(showChat));
    } catch {
      // ignore
    }
  }, [scopeBasePath, showChat]);

  const [chats, setChats] = useState<Array<{ id: string; title?: string | null }>>([]);
  const [loadingChats, setLoadingChats] = useState(false);
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
    setLoadingChats(true);
    try {
      const res = await fetch(listChatsPath, { method: "GET", credentials: "include" });
      if (!res.ok) return;

      const json = (await res.json()) as Array<{ id: string; title?: string | null }>;
      setChats(json);

      const fromUrl = searchParams.get("chatId");

      // Canonical behavior:
      // - if URL has chatId -> follow it
      // - else if we have chats -> redirect to first chat (deep-link)
      // - else -> stay without chatId until user creates one
      if (fromUrl) {
        setChatId(fromUrl);
      } else if (json.length > 0) {
        const first = json[0]!.id;
        setChatId(first);
        router.replace(`${scopeBasePath}?chatId=${first}`);
      }
    } finally {
      setLoadingChats(false);
    }
  }, [listChatsPath, router, scopeBasePath, searchParams]);

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

  // follow url changes (back/forward, manual edit)
  useEffect(() => {
    const fromUrl = searchParams.get("chatId");
    if (fromUrl && fromUrl !== chatId) setChatId(fromUrl);
  }, [searchParams, chatId]);

  useEffect(() => {
    if (chatId) void loadChatHistory(chatId);
  }, [chatId, loadChatHistory]);

  const ChatsList = (
    <div className="h-full flex flex-col">
      <div className="px-4 py-3 flex items-center justify-between shrink-0">
        <div>
          <div className="text-sm font-semibold">Chats</div>
          <div className="text-xs text-muted-foreground">{scopeLabel}</div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => void createNewChat().catch((e) => toast.error(String(e)))}
          disabled={submitting || loadingChats}
        >
          <Plus className="h-4 w-4 mr-1" />
          Nuevo
        </Button>
      </div>
      <Separator />
      <div className="flex-1 overflow-y-auto p-2">
        {loadingChats ? (
          <div className="text-xs text-muted-foreground p-2">Cargando chats…</div>
        ) : chats.length === 0 ? (
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
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold">{headerTitle}</div>
            <div className="text-xs text-muted-foreground truncate">{headerSubtitle}</div>
          </div>

          {/* Desktop: collapse chat so you can focus on panels */}
          <div className="hidden lg:flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowChat(false)}
            >
              <X className="h-4 w-4 mr-1" />
              Ocultar chat
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden">
        <Conversation className="h-full overflow-hidden">
          <ConversationContent>
            {loadingHistory ? (
              <ConversationEmptyState title="Cargando…" description="Trayendo historial del chat" />
            ) : messages.length === 0 ? (
              <div className="space-y-4">
                <ConversationEmptyState title="Arrancamos" description={suggestions[0]} />
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((s) => (
                    <Button
                      key={s}
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={submitting}
                      onClick={() => void handleSend(s)}
                    >
                      {s}
                    </Button>
                  ))}
                </div>
              </div>
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

  // Mobile-first: tabs. Desktop: panels-left + expandable/collapsible chat.
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

      <div className="hidden lg:block h-full overflow-hidden relative">
        <div
          className={cn(
            "h-full overflow-hidden grid",
            showChat ? "grid-cols-[380px_minmax(0,1fr)]" : "grid-cols-[minmax(0,1fr)]"
          )}
        >
          {/* Left: panels (always) */}
          <div className={cn("bg-sidebar overflow-hidden", showChat ? "border-r" : "")}
          >
            <div className="h-full flex flex-col overflow-hidden">
              <div className="p-2 border-b bg-sidebar/80 backdrop-blur-sm sticky top-0 z-10 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <PanelLeft className="h-4 w-4" />
                  Panel
                </div>
                <Button
                  type="button"
                  variant={showChat ? "secondary" : "default"}
                  size="icon"
                  onClick={() => setShowChat((v) => !v)}
                  aria-label={showChat ? "Ocultar asistente IA" : "Mostrar asistente IA"}
                  title={showChat ? "Ocultar IA" : "Mostrar IA"}
                >
                  {showChat ? <X className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
                </Button>
              </div>

              <Tabs defaultValue="info" className="flex-1 min-h-0 flex flex-col overflow-hidden">
                <TabsList className="grid grid-cols-2 rounded-none shrink-0">
                  <TabsTrigger value="info" className="gap-2">Panel</TabsTrigger>
                  <TabsTrigger value="chats" className="gap-2">Chats</TabsTrigger>
                </TabsList>
                <TabsContent value="info" className="flex-1 min-h-0 m-0 overflow-auto">
                  {rightPanel}
                </TabsContent>
                <TabsContent value="chats" className="flex-1 min-h-0 m-0 overflow-hidden">
                  {ChatsList}
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* Right: chat (optional) */}
          {showChat ? <div className="min-w-0 overflow-hidden">{ChatMain}</div> : null}
        </div>

        {/* When hidden, keep a visual entrypoint to open IA */}
        {!showChat ? (
          <Button
            type="button"
            onClick={() => setShowChat(true)}
            size="icon"
            className="absolute bottom-4 right-4 rounded-full shadow-lg"
            aria-label="Abrir asistente IA"
            title="Abrir IA"
          >
            <Sparkles className="h-5 w-5" />
          </Button>
        ) : null}
      </div>
    </div>
  );
}
