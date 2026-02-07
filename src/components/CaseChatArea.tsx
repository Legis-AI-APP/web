"use client";

import { useState, useMemo } from "react";
import { motion, type Variants } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SuggestionBar } from "@/components/SuggestionBar";
import ChatInput from "@/components/chat/ChatInput";
import { useRouter } from "next/navigation";
import { createChat } from "@/lib/chats-service";
import { toast } from "sonner";
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
    const router = useRouter();
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

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        const prompt = message.trim();
        if (!prompt || submitting) return;

        setSubmitting(true);
        try {
            // Crear contexto del asunto para la IA
            const contextualPrompt = `[CONTEXTO DEL ASUNTO]
Caso: ${caseData.partyA} c/ ${caseData.partyB} s/ ${caseData.matter}
Cliente: ${caseData.clientName}
Estado: ${caseData.status}

[CONSULTA DEL USUARIO]
${prompt}`;

            const chat = await createChat();
            if (chat instanceof Response) {
                throw new Error(`Error creating chat: ${chat.statusText}`);
            }
            router.push(
                `/chat/${chat.chat_id}?scope=case&caseId=${encodeURIComponent(caseData.id)}&prompt=${encodeURIComponent(contextualPrompt)}`
            );
        } catch {
            toast.error("Error al crear la conversación");
        } finally {
            setSubmitting(false);
        }
    };

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
            <div className="flex-1 flex flex-col justify-center px-6 py-8">
                <div className="max-w-4xl mx-auto w-full space-y-8">
                    {/* Información del caso */}
                    <motion.div
                        className="text-center space-y-4"
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
                    </motion.div>

                    {/* Input del chat */}
                    <motion.div
                        className="max-w-4xl mx-auto w-full"
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
                        La IA tiene acceso al contexto completo del asunto. Puedes preguntar sobre estrategias legales,
                        documentos necesarios, próximos pasos o cualquier aspecto específico del caso.
                    </motion.p>
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
