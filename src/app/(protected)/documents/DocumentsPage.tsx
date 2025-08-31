"use client";

import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, FileText, Download, Eye, Calendar, User, FolderOpen } from "lucide-react";
import { motion, Variants } from "framer-motion";
import EmptyState from "@/components/EmptyState";

// Mock data - en el futuro esto vendrá de un servicio
const documents = [
    {
        id: '1',
        name: 'Demanda de Divorcio - González.pdf',
        type: 'Demanda',
        size: '2.4 MB',
        uploadDate: '2024-01-10',
        client: 'María González',
        case: 'Divorcio Consensuado - González',
        status: 'Procesado'
    },
    {
        id: '2',
        name: 'Contrato de Compraventa - Silva.docx',
        type: 'Contrato',
        size: '1.8 MB',
        uploadDate: '2024-01-12',
        client: 'Roberto Silva',
        case: 'Compraventa Inmueble - Silva',
        status: 'Pendiente'
    },
    {
        id: '3',
        name: 'Acta de Matrimonio - González.pdf',
        type: 'Documento',
        size: '1.2 MB',
        uploadDate: '2024-01-10',
        client: 'María González',
        case: 'Divorcio Consensuado - González',
        status: 'Archivado'
    },
    {
        id: '4',
        name: 'Reclamo Laboral - Martínez.pdf',
        type: 'Reclamo',
        size: '3.1 MB',
        uploadDate: '2024-01-15',
        client: 'Ana Martínez',
        case: 'Despido Injustificado - Martínez',
        status: 'Procesado'
    }
];

export default function DocumentsPage() {
    const [searchTerm, setSearchTerm] = useState("");

    const filteredDocuments = useMemo(() => {
        if (!searchTerm.trim()) return documents;

        return documents.filter(doc =>
            doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doc.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doc.case.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doc.type.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Procesado':
                return 'bg-green-100 text-green-800';
            case 'Pendiente':
                return 'bg-yellow-100 text-yellow-800';
            case 'Archivado':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-blue-100 text-blue-800';
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'Demanda':
                return 'border-red-200 text-red-800';
            case 'Contrato':
                return 'border-blue-200 text-blue-800';
            case 'Documento':
                return 'border-green-200 text-green-800';
            case 'Reclamo':
                return 'border-orange-200 text-orange-800';
            default:
                return 'border-gray-200 text-gray-800';
        }
    };

    // Animation variants - consistentes con clientes y asuntos
    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    };

    const cardVariants: Variants = {
        hidden: {
            opacity: 0,
            y: 20,
            scale: 0.95,
            filter: "blur(2px)"
        },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            filter: "blur(0px)",
            transition: {
                type: "spring",
                stiffness: 100,
                damping: 15
            }
        }
    };

    const fadeInUp: Variants = {
        hidden: { opacity: 0, y: 10 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5, ease: "easeOut" }
        }
    };

    return (
        <div className="bg-background">
            {/* Header Section */}
            <motion.div
                className="bg-background"
                initial="hidden"
                animate="visible"
                variants={fadeInUp}
            >
                <div className="px-6 pt-6 pb-4 sm:px-8 sm:pt-8 sm:pb-4 max-w-7xl mx-auto">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Documentos</h1>
                            <p className="text-muted-foreground mt-1 text-lg">Gestiona y busca documentos de casos</p>
                        </div>
                        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg">
                            <Plus className="h-4 w-4 mr-2" />
                            Subir Documento
                        </Button>
                    </div>
                </div>
            </motion.div>

            {/* Main Content */}
            <div className="px-6 pb-6 sm:px-8 sm:pb-8 max-w-7xl mx-auto space-y-6">
                {/* Search Section */}
                <motion.div
                    className="max-w-lg"
                    initial="hidden"
                    animate="visible"
                    variants={fadeInUp}
                    transition={{ delay: 0.05 }}
                >
                    <div className="relative bg-sidebar rounded-lg">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                        <Input
                            placeholder="Buscar documentos por nombre, cliente o caso..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-12 h-12 text-base border-2 focus:border-primary/50 transition-colors"
                        />
                    </div>
                </motion.div>

                {/* Documents List */}
                {filteredDocuments.length > 0 ? (
                    <motion.div
                        className="space-y-4"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        {filteredDocuments.map((doc) => (
                            <motion.div
                                key={doc.id}
                                variants={cardVariants}
                                whileHover={{
                                    y: -5,
                                    transition: { duration: 0.2 }
                                }}
                            >
                                <Card className="group border-0 transition-all duration-300 bg-card/80 hover:bg-card rounded-xl shadow-none">
                                    <CardContent className="px-4 py-0">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0">
                                            <div className="flex items-start space-x-3">
                                                <div className="w-8 h-8 bg-primary/15 rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-primary/25 transition-colors">
                                                    <FileText className="h-4 w-4 text-primary" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-medium text-foreground truncate text-sm">{doc.name}</h3>
                                                    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 mt-1.5 space-y-0.5 sm:space-y-0">
                                                        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                                                            <User className="h-3 w-3" />
                                                            <span>{doc.client}</span>
                                                        </div>
                                                        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                                                            <Calendar className="h-3 w-3" />
                                                            <span>{new Date(doc.uploadDate).toLocaleDateString('es-AR')}</span>
                                                        </div>
                                                        <span className="text-xs text-muted-foreground">{doc.size}</span>
                                                    </div>
                                                    <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-1">
                                                        <FolderOpen className="h-3 w-3" />
                                                        <span className="truncate">{doc.case}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                                                <div className="flex space-x-1.5">
                                                    <Badge variant="outline" className={`${getTypeColor(doc.type)} text-xs px-2 py-0.5`}>
                                                        {doc.type}
                                                    </Badge>
                                                    <Badge className={`${getStatusColor(doc.status)} text-xs px-2 py-0.5`}>
                                                        {doc.status}
                                                    </Badge>
                                                </div>
                                                <div className="flex space-x-1.5">
                                                    <Button variant="outline" size="sm" className="border-muted-foreground/20 hover:bg-accent/50 rounded-lg h-7 w-7 p-0">
                                                        <Eye className="h-3.5 w-3.5" />
                                                    </Button>
                                                    <Button variant="outline" size="sm" className="border-muted-foreground/20 hover:bg-accent/50 rounded-lg h-7 w-7 p-0">
                                                        <Download className="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                    >
                        <EmptyState
                            message={
                                searchTerm
                                    ? "No se encontraron documentos con esos criterios.\nIntenta con otros términos de búsqueda."
                                    : "Todavía no hay documentos.\nUsá el botón de arriba para subir uno."
                            }
                        />
                    </motion.div>
                )}
            </div>
        </div>
    );
}
