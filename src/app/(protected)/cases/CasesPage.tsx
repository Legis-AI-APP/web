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
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "final">("all");
  const [clientFilter, setClientFilter] = useState<string>("all");

  const clientNameForCase = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of clients) map.set(c.id, `${c.first_name} ${c.last_name}`.trim());
    return (case_: Case) => map.get(case_.client_id) || "Cliente";
  }, [clients]);

  const isFinalStatus = (statusRaw: string | null | undefined) => {
    const s = (statusRaw ?? "").toLowerCase();
    return (
      s.includes("final") ||
      s.includes("cerr") ||
      s.includes("closed") ||
      s.includes("done") ||
      s.includes("complet")
    );
  };

  const filteredCases = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return cases.filter((case_) => {
      if (statusFilter === "active" && isFinalStatus(case_.status)) return false;
      if (statusFilter === "final" && !isFinalStatus(case_.status)) return false;

      if (clientFilter !== "all" && case_.client_id !== clientFilter) return false;

      if (!term) return true;

      const clientName = clientNameForCase(case_).toLowerCase();
      return (
        case_.title.toLowerCase().includes(term) ||
        case_.description.toLowerCase().includes(term) ||
        clientName.includes(term)
      );
    });
  }, [cases, clientFilter, clientNameForCase, searchTerm, statusFilter]);

  const getStatusColor = (statusRaw: string) => {
    const s = (statusRaw || "").toLowerCase();
    if (isFinalStatus(statusRaw)) return "bg-green-100 text-green-800";
    if (s.includes("pend")) return "bg-yellow-100 text-yellow-800";
    if (s.includes("prog") || s.includes("open") || s.includes("activ")) return "bg-blue-100 text-blue-800";
    return "bg-gray-100 text-gray-800";
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
        {/* Search + Filters */}
        <motion.div
          className="max-w-2xl space-y-3"
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          transition={{ delay: 0.05 }}
        >
          <div className="relative bg-sidebar rounded-lg">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              placeholder="Buscar asuntos por nombre o cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-12 text-base border-2 focus:border-primary/50 transition-colors"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant={statusFilter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("all")}
            >
              Todos
            </Button>
            <Button
              type="button"
              variant={statusFilter === "active" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("active")}
            >
              Activos
            </Button>
            <Button
              type="button"
              variant={statusFilter === "final" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("final")}
            >
              Finalizados
            </Button>
          </div>

          <div className="max-w-lg">
            <div className="text-xs font-medium text-muted-foreground mb-1">Cliente</div>
            <select
              className="w-full h-10 rounded-standard border border-border bg-background px-3 text-sm"
              value={clientFilter}
              onChange={(e) => setClientFilter(e.currentTarget.value)}
            >
              <option value="all">Todos</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {`${c.first_name} ${c.last_name}`.trim() || c.id}
                </option>
              ))}
            </select>
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
              const clientName = clientNameForCase(case_);
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
                          </div>
                        </div>
                        <Badge variant="secondary" className={getStatusColor(case_.status)}>
                          {case_.status || "—"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2 pt-0 flex-1 pb-4">
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <User className="h-3.5 w-3.5 flex-shrink-0" />
                        <span className="truncate text-xs">{clientName}</span>
                      </div>
                      <div className="text-xs text-muted-foreground line-clamp-2">
                        {case_.description}
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                        <span className="text-xs">
                          {(() => {
                            try {
                              return case_.created_at
                                ? new Date(case_.created_at).toLocaleDateString("es-AR")
                                : "Fecha no disponible";
                            } catch {
                              return "Fecha no disponible";
                            }
                          })()}
                        </span>
                      </div>
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
