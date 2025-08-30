"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { Case } from "@/lib/cases-service";
import { Client } from "@/lib/clients-service";
import AddCaseDialog from "@/components/dialog/AddCaseDialog";
import EmptyState from "@/components/EmptyState";

import { Search, FolderOpen, Calendar, User } from 'lucide-react';
import { motion, Variants } from "framer-motion";

export default function CasesPage({
  cases,
  clients,
}: {
  cases: Case[];
  clients: Client[];
}) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCases = useMemo(() => {
    if (!searchTerm.trim()) return cases;

    return cases.filter(case_ =>
      case_.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      case_.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getMockCaseData(case_, clients).client.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [cases, clients, searchTerm]);

  // Mock data for fields that aren't in the current Case interface
  const getMockCaseData = (case_: Case, clients: Client[]) => {
    const client = clients.find(c => c.id === case_.client_id);
    const clientName = client ? `${client.first_name} ${client.last_name}` : 'Cliente no encontrado';

    // Generate mock data based on existing case data
    const statuses = ['En Progreso', 'Pendiente', 'Completado'];
    const specialties = ['Familia', 'Laboral', 'Comercial', 'Penal', 'Civil'];
    const mockStatus = statuses[Math.abs(case_.id.charCodeAt(0)) % statuses.length];
    const mockSpecialty = specialties[Math.abs(case_.id.charCodeAt(1)) % specialties.length];

    // Generate dates based on created_at with fallback to current date
    let startDate: Date;
    try {
      startDate = case_.created_at ? new Date(case_.created_at) : new Date();
      if (isNaN(startDate.getTime())) {
        startDate = new Date();
      }
    } catch {
      startDate = new Date();
    }

    const nextHearing = new Date(startDate);
    nextHearing.setDate(startDate.getDate() + 30);

    let endDate: string | undefined;
    if (mockStatus === 'Completado') {
      try {
        const endDateObj = new Date(startDate.getTime() + 60 * 24 * 60 * 60 * 1000);
        endDate = endDateObj.toISOString().split('T')[0];
      } catch {
        endDate = undefined;
      }
    }

    return {
      ...case_,
      client: clientName,
      status: mockStatus,
      specialty: mockSpecialty,
      startDate: startDate.toISOString().split('T')[0],
      nextHearing: nextHearing.toISOString().split('T')[0],
      endDate
    };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'En Progreso':
        return 'bg-blue-100 text-blue-800';
      case 'Completado':
        return 'bg-green-100 text-green-800';
      case 'Pendiente':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };



  // Animation variants
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
    <div className="min-h-screen bg-background">
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
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Asuntos</h1>
              <p className="text-muted-foreground mt-1 text-lg">Gestiona todos tus casos legales</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">

              <AddCaseDialog clients={clients} />
            </div>
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
              placeholder="Buscar asuntos por nombre, cliente o especialidad..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-12 text-base border-2 focus:border-primary/50 transition-colors"
            />
          </div>
        </motion.div>


        {/* Cases Grid */}
        {filteredCases.length > 0 ? (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-1 xl:grid-cols-2 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {filteredCases.map((case_) => {
              const mockCase = getMockCaseData(case_, clients);
              return (
                <motion.div
                  key={case_.id}
                  variants={cardVariants}
                  whileHover={{
                    y: -5,
                    transition: { duration: 0.2 }
                  }}
                >
                  <Card
                    className="group border-0 transition-all duration-300 cursor-pointer bg-card/80 hover:bg-card gap-0 flex flex-col"
                    onClick={() => router.push(`/cases/${case_.id}`)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-2.5">
                          <div className="w-8 h-8 bg-primary/15 rounded-lg flex items-center justify-center group-hover:bg-primary/25 transition-colors">
                            <FolderOpen className="h-4 w-4 text-primary" />
                          </div>
                          <div className="space-y-0.5">
                            <CardTitle className="text-base text-foreground font-semibold">
                              {case_.title}
                            </CardTitle>
                            <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                              {mockCase.specialty}
                            </Badge>
                          </div>
                        </div>
                        <Badge
                          variant="secondary"
                          className={getStatusColor(mockCase.status)}
                        >
                          {mockCase.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2 pt-0 flex-1 pb-4">
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <User className="h-3.5 w-3.5 flex-shrink-0" />
                        <span className="truncate text-xs">{mockCase.client}</span>
                      </div>
                      <div className="text-xs text-muted-foreground line-clamp-2">
                        {case_.description}
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                        <span className="text-xs">
                          {(() => {
                            try {
                              return new Date(mockCase.startDate).toLocaleDateString('es-AR');
                            } catch {
                              return 'Fecha no disponible';
                            }
                          })()}
                        </span>
                      </div>
                      {mockCase.nextHearing && (
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                          <span className="text-xs">
                            Próxima: {(() => {
                              try {
                                return new Date(mockCase.nextHearing).toLocaleDateString('es-AR');
                              } catch {
                                return 'Fecha no disponible';
                              }
                            })()}
                          </span>
                        </div>
                      )}
                    </CardContent>
                    <div className="px-4 pb-0 pt-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/cases/${case_.id}`);
                        }}
                        className="w-full h-8 hover:bg-primary hover:text-primary-foreground transition-colors text-xs"
                      >
                        <FolderOpen className="h-3.5 w-3.5 mr-1.5" />
                        Ver Detalles
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
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
                  ? "No se encontraron asuntos con esos criterios.\nIntenta con otros términos de búsqueda."
                  : "Todavía no hay Asuntos.\nUsá el botón de arriba para crear uno."
              }
            />
          </motion.div>
        )}
      </div>
    </div>
  );
}
