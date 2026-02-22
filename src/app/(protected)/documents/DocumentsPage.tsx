"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { Search, FileText, FolderOpen, User, ExternalLink } from "lucide-react";

import type { Case } from "@/lib/cases-service";
import type { Client } from "@/lib/clients-service";
import type { LegisFile } from "@/lib/legis-file";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import EmptyState from "@/components/EmptyState";

type DocRow = {
  key: string;
  name: string;
  url: string;
  kind: "case" | "client";
  ownerId: string;
  ownerLabel: string;
};

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

export default function DocumentsPage({
  docs,
  note,
}: {
  docs: DocRow[];
  note?: string;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [kindFilter, setKindFilter] = useState<"all" | "case" | "client">("all");

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();

    return docs.filter((d) => {
      if (kindFilter !== "all" && d.kind !== kindFilter) return false;
      if (!q) return true;

      return d.name.toLowerCase().includes(q) || d.ownerLabel.toLowerCase().includes(q);
    });
  }, [docs, kindFilter, searchTerm]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
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
              <p className="text-muted-foreground mt-1 text-lg">
                MVP: buscá por nombre de archivo. (Búsqueda dentro del contenido viene después.)
              </p>
            </div>
            <div className="text-sm text-muted-foreground">
              {filtered.length} / {docs.length} archivo(s)
              {note ? <div className="text-xs mt-1">{note}</div> : null}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Content */}
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
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              placeholder="Buscar por archivo o por caso/cliente…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-12 text-base border-2 focus:border-primary/50 transition-colors"
              autoFocus
            />
          </div>

          {searchTerm ? (
            <div>
              <Button type="button" variant="outline" size="sm" onClick={() => setSearchTerm("")}> 
                Limpiar búsqueda
              </Button>
            </div>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant={kindFilter === "all" ? "default" : "outline"}
              onClick={() => setKindFilter("all")}
            >
              Todos
            </Button>
            <Button
              type="button"
              size="sm"
              variant={kindFilter === "case" ? "default" : "outline"}
              onClick={() => setKindFilter("case")}
            >
              Casos
            </Button>
            <Button
              type="button"
              size="sm"
              variant={kindFilter === "client" ? "default" : "outline"}
              onClick={() => setKindFilter("client")}
            >
              Clientes
            </Button>
          </div>
        </motion.div>

        {/* List */}
        {filtered.length > 0 ? (
          <div className="space-y-3">
            {filtered.map((d) => (
              <Card
                key={d.key}
                className="border-0 transition-all duration-300 bg-card/80 hover:bg-card rounded-xl shadow-none"
              >
                <CardContent className="px-4 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex items-start gap-3">
                      <div className="w-8 h-8 bg-primary/15 rounded-full flex items-center justify-center flex-shrink-0">
                        <FileText className="h-4 w-4 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium text-foreground truncate text-sm">
                          {d.name}
                        </div>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-muted-foreground">
                          <span className="inline-flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {d.kind === "client" ? "Cliente" : "Caso"}
                          </span>
                          <span className="inline-flex items-center gap-1 min-w-0">
                            <FolderOpen className="h-3 w-3" />
                            <Link
                              href={
                                d.kind === "client"
                                  ? `/clients/${d.ownerId}/overview`
                                  : `/cases/${d.ownerId}/overview`
                              }
                              className="hover:underline truncate"
                              title={d.ownerLabel}
                            >
                              {d.ownerLabel}
                            </Link>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={d.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:underline"
                        title="Abrir documento"
                      >
                        Abrir
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            message={
              searchTerm
                ? "No se encontraron documentos con esos criterios."
                : "Todavía no hay documentos. Subí alguno en un caso o cliente."
            }
          />
        )}
      </div>
    </div>
  );
}

export function buildDocsIndex({
  cases,
  clients,
  caseFiles,
  clientFiles,
}: {
  cases: Case[];
  clients: Client[];
  caseFiles: Array<{ caseId: string; files: LegisFile[] }>;
  clientFiles: Array<{ clientId: string; files: LegisFile[] }>;
}): DocRow[] {
  const clientNameById = new Map<string, string>();
  for (const c of clients) {
    clientNameById.set(c.id, `${c.first_name} ${c.last_name}`.trim() || c.id);
  }

  const caseTitleById = new Map<string, string>();
  for (const c of cases) {
    caseTitleById.set(c.id, c.title);
  }

  const rows: DocRow[] = [];

  for (const entry of caseFiles) {
    const ownerLabel = caseTitleById.get(entry.caseId) ?? entry.caseId;
    for (const f of entry.files) {
      rows.push({
        key: `case:${entry.caseId}:${f.url}`,
        name: f.name,
        url: f.url,
        kind: "case",
        ownerId: entry.caseId,
        ownerLabel,
      });
    }
  }

  for (const entry of clientFiles) {
    const ownerLabel = clientNameById.get(entry.clientId) ?? entry.clientId;
    for (const f of entry.files) {
      rows.push({
        key: `client:${entry.clientId}:${f.url}`,
        name: f.name,
        url: f.url,
        kind: "client",
        ownerId: entry.clientId,
        ownerLabel,
      });
    }
  }

  rows.sort((a, b) => a.name.localeCompare(b.name));
  return rows;
}
