"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";
import AddCaseEventDialog from "@/components/dialog/AddCaseEventDialog";
import {
    ArrowLeft,
    Calendar,
    Eye,
    Download,
    X
} from "lucide-react";
import type { CaseEventDto, CaseEventType } from "@/lib/case-events";
import type { LegisFile } from "@/lib/legis-file";

interface CaseDetailPanelProps {
    isOpen: boolean;
    onClose: () => void;
    mode?: "page" | "sidebar";
    caseData: {
        id: string;
        title: string;
        clientName: string;
        status: string;
        partyA: string;
        partyB: string;
        matter: string;
    };
    onBackToCases?: () => void;
    onBackToClient?: () => void;
    fromClient?: boolean;
}

const statusLabel = (s?: string | null) => {
    switch ((s ?? "").toUpperCase()) {
        case "DONE":
            return "Completado";
        case "SCHEDULED":
            return "Programada";
        case "URGENT":
            return "Urgente";
        case "PENDING":
            return "Pendiente";
        default:
            return s ?? "";
    }
};

const typeToTab: Record<CaseEventType, "movements" | "documents" | "dates" | "notes"> = {
    MOVEMENT: "movements",
    DOCUMENT: "documents",
    DATE: "dates",
    NOTE: "notes",
};

const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
        case 'completado':
        case 'procesado':
        case 'resuelto':
            return 'default'; // Verde
        case 'en progreso':
        case 'programada':
            return 'secondary'; // Azul
        case 'pendiente':
            return 'outline'; // Amarillo
        case 'urgente':
            return 'destructive'; // Rojo
        default:
            return 'outline';
    }
};

const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
        case 'completado':
        case 'procesado':
        case 'resuelto':
            return 'bg-green-100 text-green-800 border-green-200';
        case 'en progreso':
        case 'programada':
            return 'bg-blue-100 text-blue-800 border-blue-200';
        case 'pendiente':
            return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case 'urgente':
            return 'bg-red-100 text-red-800 border-red-200';
        default:
            return 'bg-gray-100 text-gray-800 border-gray-200';
    }
};

export default function CaseDetailPanel({
    isOpen,
    onClose,
    mode = "page",
    caseData,
    onBackToCases,
    onBackToClient,
    fromClient = false
}: CaseDetailPanelProps) {
    const isMobile = useIsMobile();
    const [isResizing, setIsResizing] = useState(false);
    const resizeRef = useRef<HTMLDivElement>(null);

    const [events, setEvents] = useState<CaseEventDto[]>([]);

    const handleEventCreated = (created: CaseEventDto) => {
        setEvents((prev) => [created, ...prev]);
    };
    const [files, setFiles] = useState<LegisFile[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        let cancelled = false;
        const run = async () => {
            setLoading(true);
            try {
                const [eventsRes, filesRes] = await Promise.all([
                    fetch(`/api/cases/${caseData.id}/events`, { credentials: "include" }),
                    fetch(`/api/cases/${caseData.id}/files`, { credentials: "include" }),
                ]);

                if (!eventsRes.ok) throw new Error("No se pudieron cargar los eventos del caso");
                if (!filesRes.ok) throw new Error("No se pudieron cargar los documentos del caso");

                const eventsJson = (await eventsRes.json()) as CaseEventDto[];
                const filesJson = (await filesRes.json()) as LegisFile[];

                if (!cancelled) {
                    setEvents(eventsJson);
                    setFiles(filesJson);
                }
            } catch { 
                // Mantener UI usable aunque falle
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        void run();
        return () => {
            cancelled = true;
        };
    }, [caseData.id]);

    const eventsByTab = useMemo(() => {
        const acc: Record<string, CaseEventDto[]> = {
            movements: [],
            documents: [],
            dates: [],
            notes: [],
        };
        for (const e of events) {
            const t = e.type ?? null;
            if (t && typeToTab[t]) {
                acc[typeToTab[t]].push(e);
            }
        }
        return acc;
    }, [events]);

    const fileCards = files.map((f, idx) => ({
        id: `${idx}-${f.name}`,
        name: f.name,
        url: f.url,
    }));

    // Manejar redimensionamiento
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isResizing || isMobile) return;

            void e;
        };

        const handleMouseUp = () => {
            setIsResizing(false);
        };

        if (isResizing) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isResizing, isMobile]);

    const handleResizeStart = () => {
        if (!isMobile) {
            setIsResizing(true);
        }
    };

    // Función para renderizar el contenido de los tabs
    const renderTabContent = () => (
        <>
            {/* Movimientos */}
            <TabsContent value="movements" className="space-y-3 mt-4">
                <div className="flex justify-between items-center">
                    <h3 className="font-medium">Movimientos del caso</h3>
                    <AddCaseEventDialog
                        caseId={caseData.id}
                        type="MOVEMENT"
                        triggerText="Agregar"
                        onCreated={handleEventCreated}
                    />
                </div>
                <div className="space-y-2">
                    {eventsByTab.movements.length === 0 ? (
                        <Card className="p-3">
                            <p className="text-sm text-muted-foreground">
                                {loading ? "Cargando..." : "No hay movimientos aún"}
                            </p>
                        </Card>
                    ) : (
                        eventsByTab.movements.map((movement) => (
                            <Card key={movement.id} className="p-3">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium">{movement.title}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {movement.event_at ? new Date(movement.event_at).toLocaleString("es-AR") : movement.created_at}
                                        </p>
                                    </div>
                                    <Badge
                                        variant={getStatusBadgeVariant(statusLabel(movement.status))}
                                        className={getStatusColor(statusLabel(movement.status))}
                                    >
                                        {statusLabel(movement.status) || "-"}
                                    </Badge>
                                </div>
                            </Card>
                        ))
                    )}
                </div>
            </TabsContent>

            {/* Documentos */}
            <TabsContent value="documents" className="space-y-3 mt-4">
                <div className="flex justify-between items-center">
                    <h3 className="font-medium">Documentos del caso</h3>
                    <AddCaseEventDialog
                        caseId={caseData.id}
                        type="DOCUMENT"
                        triggerText="Agregar"
                        onCreated={handleEventCreated}
                    />
                </div>
                <div className="space-y-2">
                    {fileCards.length === 0 ? (
                        <Card className="p-3">
                            <p className="text-sm text-muted-foreground">
                                {loading ? "Cargando..." : "No hay documentos aún"}
                            </p>
                        </Card>
                    ) : (
                        fileCards.map((doc) => (
                            <Card key={doc.id} className="p-3">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1 flex-1">
                                        <p className="text-sm font-medium">{doc.name}</p>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <span>Archivo</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="secondary">Disponible</Badge>
                                        <div className="flex gap-1">
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="h-8 w-8 p-0"
                                                onClick={() => window.open(doc.url, "_blank")}
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="h-8 w-8 p-0"
                                                onClick={() => window.open(doc.url, "_blank")}
                                            >
                                                <Download className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))
                    )}
                </div>
            </TabsContent>

            {/* Fechas */}
            <TabsContent value="dates" className="space-y-3 mt-4">
                <div className="flex justify-between items-center">
                    <h3 className="font-medium">Audiencias y vencimientos</h3>
                    <AddCaseEventDialog
                        caseId={caseData.id}
                        type="DATE"
                        triggerText="Agregar"
                        onCreated={handleEventCreated}
                    />
                </div>
                <div className="space-y-2">
                    {eventsByTab.dates.length === 0 ? (
                        <Card className="p-3">
                            <p className="text-sm text-muted-foreground">
                                {loading ? "Cargando..." : "No hay fechas aún"}
                            </p>
                        </Card>
                    ) : (
                        eventsByTab.dates.map((date) => (
                            <Card key={date.id} className="p-3">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium">{date.title}</p>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <Calendar className="h-3 w-3" />
                                            <span>
                                                {date.event_at
                                                    ? new Date(date.event_at).toLocaleString("es-AR")
                                                    : new Date(date.created_at).toLocaleString("es-AR")}
                                            </span>
                                        </div>
                                    </div>
                                    <Badge
                                        variant={getStatusBadgeVariant(statusLabel(date.status))}
                                        className={getStatusColor(statusLabel(date.status))}
                                    >
                                        {statusLabel(date.status) || "-"}
                                    </Badge>
                                </div>
                            </Card>
                        ))
                    )}
                </div>
            </TabsContent>

            {/* Notas */}
            <TabsContent value="notes" className="space-y-3 mt-4">
                <div className="flex justify-between items-center">
                    <h3 className="font-medium">Notas del caso</h3>
                    <AddCaseEventDialog
                        caseId={caseData.id}
                        type="NOTE"
                        triggerText="Agregar"
                        onCreated={handleEventCreated}
                    />
                </div>
                <div className="space-y-2">
                    {eventsByTab.notes.length === 0 ? (
                        <Card className="p-3">
                            <p className="text-sm text-muted-foreground">
                                {loading ? "Cargando..." : "No hay notas aún"}
                            </p>
                        </Card>
                    ) : (
                        eventsByTab.notes.map((note) => (
                            <Card key={note.id} className="p-3">
                                <div className="space-y-2">
                                    <p className="text-sm">{note.description || note.title}</p>
                                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                                        <span>{note.title}</span>
                                        <span>
                                            {new Date(note.created_at).toLocaleString("es-AR")}
                                        </span>
                                    </div>
                                </div>
                            </Card>
                        ))
                    )}
                </div>
            </TabsContent>
        </>
    );

    if (!isOpen) return null;

    // En desktop, renderizar como sidebar normal
    if (!isMobile) {
        return (
            <div className="bg-background border-r shadow-sm flex flex-col h-full relative">
                {/* Header */}
                <div className="p-4 border-b bg-sidebar/50">
                    {mode === "page" && (
                        <div className="flex items-center justify-between mb-4">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={fromClient ? onBackToClient : onBackToCases}
                                className="text-muted-foreground hover:text-foreground"
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                {fromClient ? 'Volver a Cliente' : 'Volver a Asuntos'}
                            </Button>
                        </div>
                    )}

                    <div className="space-y-2">
                        <h1 className="text-lg font-semibold text-foreground">
                            {caseData.partyA || caseData.partyB
                                ? `${caseData.partyA} c/ ${caseData.partyB} s/ ${caseData.matter}`
                                : caseData.title}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {caseData.clientName}
                        </p>
                        <Badge
                            variant={getStatusBadgeVariant(caseData.status)}
                            className={getStatusColor(caseData.status)}
                        >
                            {caseData.status}
                        </Badge>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex-1 overflow-hidden">
                    <Tabs defaultValue="movements" className="h-full flex flex-col">
                        <div className="px-4 pt-4">
                            <TabsList className="grid w-full grid-cols-4 bg-sidebar rounded-lg">
                                <TabsTrigger value="movements" className="text-xs">
                                    Movimientos
                                </TabsTrigger>
                                <TabsTrigger value="documents" className="text-xs">
                                    Documentos
                                </TabsTrigger>
                                <TabsTrigger value="dates" className="text-xs">
                                    Fechas
                                </TabsTrigger>
                                <TabsTrigger value="notes" className="text-xs">
                                    Notas
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        <div className="flex-1 overflow-y-auto px-4 pb-4">
                            {renderTabContent()}
                        </div>
                    </Tabs>
                </div>

                {mode === "page" && (
                    <>
                        {/* Resize Handle */}
                        <div
                            ref={resizeRef}
                            onMouseDown={handleResizeStart}
                            className="absolute right-0 top-0 bottom-0 w-1 bg-border hover:bg-primary/50 cursor-col-resize transition-colors"
                        />
                    </>
                )}
            </div>
        );
    }

    // En mobile, renderizar como overlay
    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/50"
                onClick={onClose}
            >
                <motion.div
                    initial={{ x: "-100%" }}
                    animate={{ x: 0 }}
                    exit={{ x: "-100%" }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="bg-background border-r shadow-xl flex flex-col h-full w-full max-w-sm"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="p-4 border-b bg-sidebar/50">
                        <div className="flex items-center justify-between mb-4">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={fromClient ? onBackToClient : onBackToCases}
                                className="text-muted-foreground hover:text-foreground"
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                {fromClient ? 'Volver a Cliente' : 'Volver a Asuntos'}
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={onClose}
                                className="h-8 w-8"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="space-y-2">
                            <h1 className="text-lg font-semibold text-foreground">
                                {caseData.partyA || caseData.partyB
                                    ? `${caseData.partyA} c/ ${caseData.partyB} s/ ${caseData.matter}`
                                    : caseData.title}
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                {caseData.clientName}
                            </p>
                            <Badge
                                variant={getStatusBadgeVariant(caseData.status)}
                                className={getStatusColor(caseData.status)}
                            >
                                {caseData.status}
                            </Badge>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex-1 overflow-hidden">
                        <Tabs defaultValue="movements" className="h-full flex flex-col">
                            <div className="px-4 pt-4">
                                <TabsList className="grid w-full grid-cols-4 bg-sidebar rounded-lg">
                                    <TabsTrigger value="movements" className="text-xs">
                                        Movimientos
                                    </TabsTrigger>
                                    <TabsTrigger value="documents" className="text-xs">
                                        Documentos
                                    </TabsTrigger>
                                    <TabsTrigger value="dates" className="text-xs">
                                        Fechas
                                    </TabsTrigger>
                                    <TabsTrigger value="notes" className="text-xs">
                                        Notas
                                    </TabsTrigger>
                                </TabsList>
                            </div>

                            <div className="flex-1 overflow-y-auto px-4 pb-4">
                                {renderTabContent()}
                            </div>
                        </Tabs>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}