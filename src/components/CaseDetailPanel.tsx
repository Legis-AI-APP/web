"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";
import {
    ArrowLeft,
    Plus,
    Calendar,
    Eye,
    Download,
    X
} from "lucide-react";

interface CaseDetailPanelProps {
    isOpen: boolean;
    onClose: () => void;
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

// Mock data para los diferentes tabs
const mockMovements = [
    {
        id: '1',
        date: '2024-01-15',
        description: 'Presentación de demanda',
        status: 'Completado'
    },
    {
        id: '2',
        date: '2024-01-20',
        description: 'Notificación a la contraparte',
        status: 'En Progreso'
    },
    {
        id: '3',
        date: '2024-02-01',
        description: 'Audiencia preliminar',
        status: 'Pendiente'
    }
];

const mockDocuments = [
    {
        id: '1',
        name: 'Demanda Principal.pdf',
        type: 'Demanda',
        status: 'Procesado',
        size: '2.4 MB'
    },
    {
        id: '2',
        name: 'Contrato Base.docx',
        type: 'Contrato',
        status: 'Pendiente',
        size: '1.8 MB'
    },
    {
        id: '3',
        name: 'Acta de Audiencia.pdf',
        type: 'Acta',
        status: 'Archivado',
        size: '1.2 MB'
    }
];

const mockDates = [
    {
        id: '1',
        type: 'audiencia',
        title: 'Audiencia Preliminar',
        date: '2024-02-15',
        time: '09:00',
        status: 'Pendiente'
    },
    {
        id: '2',
        type: 'vencimiento',
        title: 'Vencimiento de Pruebas',
        date: '2024-02-20',
        time: '23:59',
        status: 'Urgente'
    },
    {
        id: '3',
        type: 'audiencia',
        title: 'Audiencia de Pruebas',
        date: '2024-03-01',
        time: '10:30',
        status: 'Programada'
    }
];

const mockNotes = [
    {
        id: '1',
        content: 'Cliente muy colaborativo, proporcionó toda la documentación necesaria',
        author: 'Dr. García',
        date: '2024-01-15',
        time: '14:30'
    },
    {
        id: '2',
        content: 'Revisar cláusula 3.2 del contrato - posible ambigüedad',
        author: 'Dr. García',
        date: '2024-01-18',
        time: '11:15'
    }
];

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
    caseData,
    onBackToCases,
    onBackToClient,
    fromClient = false
}: CaseDetailPanelProps) {
    const isMobile = useIsMobile();
    const [isResizing, setIsResizing] = useState(false);
    const resizeRef = useRef<HTMLDivElement>(null);

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
                    <Button size="sm" variant="outline">
                        <Plus className="h-4 w-4 mr-1" />
                        Agregar
                    </Button>
                </div>
                <div className="space-y-2">
                    {mockMovements.map((movement) => (
                        <Card key={movement.id} className="p-3">
                            <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                    <p className="text-sm font-medium">{movement.description}</p>
                                    <p className="text-xs text-muted-foreground">{movement.date}</p>
                                </div>
                                <Badge
                                    variant={getStatusBadgeVariant(movement.status)}
                                    className={getStatusColor(movement.status)}
                                >
                                    {movement.status}
                                </Badge>
                            </div>
                        </Card>
                    ))}
                </div>
            </TabsContent>

            {/* Documentos */}
            <TabsContent value="documents" className="space-y-3 mt-4">
                <div className="flex justify-between items-center">
                    <h3 className="font-medium">Documentos del caso</h3>
                    <Button size="sm" variant="outline">
                        <Plus className="h-4 w-4 mr-1" />
                        Agregar
                    </Button>
                </div>
                <div className="space-y-2">
                    {mockDocuments.map((doc) => (
                        <Card key={doc.id} className="p-3">
                            <div className="flex justify-between items-start">
                                <div className="space-y-1 flex-1">
                                    <p className="text-sm font-medium">{doc.name}</p>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <span>{doc.type}</span>
                                        <span>•</span>
                                        <span>{doc.size}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge
                                        variant={getStatusBadgeVariant(doc.status)}
                                        className={getStatusColor(doc.status)}
                                    >
                                        {doc.status}
                                    </Badge>
                                    <div className="flex gap-1">
                                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                            <Download className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </TabsContent>

            {/* Fechas */}
            <TabsContent value="dates" className="space-y-3 mt-4">
                <div className="flex justify-between items-center">
                    <h3 className="font-medium">Audiencias y vencimientos</h3>
                    <Button size="sm" variant="outline">
                        <Plus className="h-4 w-4 mr-1" />
                        Agregar
                    </Button>
                </div>
                <div className="space-y-2">
                    {mockDates.map((date) => (
                        <Card key={date.id} className="p-3">
                            <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                    <p className="text-sm font-medium">{date.title}</p>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <Calendar className="h-3 w-3" />
                                        <span>{date.date} a las {date.time}</span>
                                    </div>
                                </div>
                                <Badge
                                    variant={getStatusBadgeVariant(date.status)}
                                    className={getStatusColor(date.status)}
                                >
                                    {date.status}
                                </Badge>
                            </div>
                        </Card>
                    ))}
                </div>
            </TabsContent>

            {/* Notas */}
            <TabsContent value="notes" className="space-y-3 mt-4">
                <div className="flex justify-between items-center">
                    <h3 className="font-medium">Notas del caso</h3>
                    <Button size="sm" variant="outline">
                        <Plus className="h-4 w-4 mr-1" />
                        Agregar
                    </Button>
                </div>
                <div className="space-y-2">
                    {mockNotes.map((note) => (
                        <Card key={note.id} className="p-3">
                            <div className="space-y-2">
                                <p className="text-sm">{note.content}</p>
                                <div className="flex justify-between items-center text-xs text-muted-foreground">
                                    <span>{note.author}</span>
                                    <span>{note.date} {note.time}</span>
                                </div>
                            </div>
                        </Card>
                    ))}
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

                    <div className="space-y-2">
                        <h1 className="text-lg font-semibold text-foreground">
                            {caseData.partyA} c/ {caseData.partyB} s/ {caseData.matter}
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

                {/* Resize Handle */}
                <div
                    ref={resizeRef}
                    onMouseDown={handleResizeStart}
                    className="absolute right-0 top-0 bottom-0 w-1 bg-border hover:bg-primary/50 cursor-col-resize transition-colors"
                />
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
                                {caseData.partyA} c/ {caseData.partyB} s/ {caseData.matter}
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