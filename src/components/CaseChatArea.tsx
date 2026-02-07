"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, type Variants } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SuggestionBar } from "@/components/SuggestionBar";
import ChatInput from "@/components/chat/ChatInput";
import { toast } from "sonner";
import MessageBubble from "@/components/chat/MessageBubble";
import type { ChatMessage } from "@/lib/chats-service";
import { askGeminiStream } from "@/lib/ask-gemini-stream";
import {
    MessageSquare,
    Bot,
    FileText,
    Calendar,
    Users,
    Menu
} from "lucide-react";
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
    const bottomRef = useRef<HTMLDivElement | null>(null);

    const isMobile = useIsMobile();

    // Sugerencias contextualizadas al asunto
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

    const handleSuggestionClick = (s: string) => setMessage(s);

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

    const handleSend = useCallback(async (e?: React.FormEvent) => {
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
            const activeChatId = await ensureCaseChat();
            await askGeminiStream(
                prompt,
                (chunk) => {
                    bufferRef.current.push(chunk);
                },
                activeChatId,
                `/api/ai/ask/case/${caseData.id}`
            );
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Error al consultar la IA";
            toast.error(message);
        } finally {
            setSubmitting(false);
        }
    }, [caseData.id, ensureCaseChat, message, submitting]);

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

                    return [
                        ...prev,
                        { id: crypto.randomUUID(), role: "assistant", content: next },
                    ];
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

    const fadeIn: Variants = {
        initial: { opacity: 0 },
        animate: { opacity: 1 }
    };

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
        <div className="flex-1 flex flex-col min-h-screen">
            {/* Header contextualizado */}
            <motion.div
                className="bg-background/80 backdrop-blur-sm border-b px-6 py-4"
                initial="initial"
                animate="animate"
                variants={fadeIn}
                transition={{ duration: 0.6, ease: "easeOut" }}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                            <Bot className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-lg font-semibold text-foreground">
                                IA Legal — Contexto del Asunto
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                Asistente especializado en {caseData.matter}
                            </p>
                        </div>
                    </div>

                    {/* Botón para abrir panel en mobile */}
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

            {/* Área principal del chat */}
            <div className="flex-1 flex flex-col px-6 py-6">
                <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col">
                    {messages.length === 0 ? (
                        <motion.div
                            className="text-center space-y-8 flex-1 flex flex-col justify-center"
                            initial="initial"
                            animate="animate"
                            variants={fadeIn}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                        >
                            <div className="space-y-2">
                                <h2 className="text-2xl sm:text-3xl font-medium text-foreground">
                                    ¿Cómo puedo ayudarte con este caso?
                                </h2>
                                <p className="text-muted-foreground text-lg">
                                    {caseData.partyA} c/ {caseData.partyB} s/ {caseData.matter}
                                </p>
                            </div>

                            {/* Cards de información rápida */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
                                <Card className="p-4">
                                    <CardContent className="p-0">
                                        <div className="flex items-center gap-2 text-sm">
                                            <Users className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-muted-foreground">Cliente:</span>
                                            <span className="font-medium">{caseData.clientName}</span>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="p-4">
                                    <CardContent className="p-0">
                                        <div className="flex items-center gap-2 text-sm">
                                            <FileText className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-muted-foreground">Materia:</span>
                                            <span className="font-medium">{caseData.matter}</span>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="p-4">
                                    <CardContent className="p-0">
                                        <div className="flex items-center gap-2 text-sm">
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-muted-foreground">Estado:</span>
                                            <span className="font-medium">{caseData.status}</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Sugerencias contextualizadas */}
                            <motion.div
                                initial="initial"
                                animate="animate"
                                variants={upIn}
                                transition={{ delay: 0.2 }}
                            >
                                <SuggestionBar
                                    items={suggestions}
                                    onPick={handleSuggestionClick}
                                    className="max-w-4xl mx-auto"
                                />
                            </motion.div>

                            {/* Nota informativa */}
                            <motion.p
                                className="text-center text-xs text-muted-foreground max-w-2xl mx-auto"
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3, duration: 0.35 }}
                            >
                                La IA usa el contexto del caso y tus documentos. Preguntá por estrategias legales,
                                próximos pasos o riesgos.
                            </motion.p>
                        </motion.div>
                    ) : (
                        <div className="flex-1 overflow-y-auto px-0 py-2 space-y-4">
                            {messages.map((msg) => (
                                <MessageBubble key={msg.id} role={msg.role} content={msg.content} />
                            ))}
                            <div ref={bottomRef} />
                        </div>
                    )}

                    {/* Input del chat */}
                    <motion.div
                        className="w-full mt-4"
                        initial="initial"
                        animate="animate"
                        variants={upIn}
                        transition={{ delay: 0.1 }}
                    >
                        <ChatInput
                            value={message}
                            onChange={setMessage}
                            onSubmit={handleSend}
                            disabled={submitting}
                        />
                    </motion.div>
                </div>
            </div>

            {/* Historial de mensajes (placeholder para futuras implementaciones) */}
            <div className="px-6 py-4 border-t bg-muted/20">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MessageSquare className="h-4 w-4" />
                        <span>Historial de conversaciones del asunto</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                        Las conversaciones se guardan automáticamente y están vinculadas a este caso.
                    </p>
                </div>
            </div>
        </div>
    );
}
