"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader, User, Phone, Mail, MapPin, FolderOpen, FileText, Calendar, Edit, Download, Users, MessageSquare } from 'lucide-react';
import { AddDialog } from "@/components/dialog/AddDialog";
import AddCaseDialog from "@/components/dialog/AddCaseDialog";
import { Client, uploadClientFile } from "@/lib/clients-service";
import { useRouter } from "next/navigation";
import { LegisFile } from "@/lib/legis-file";
import { motion, Variants } from "framer-motion";
import ClientChatArea from "@/components/ClientChatArea";
import ClientPersonDialog from "@/components/dialog/ClientPersonDialog";
import type { ClientPersonDto } from "@/lib/client-persons";

export default function ClientPage({
  client,
  files,
}: {
  client: Client;
  files: LegisFile[];
}) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  const handleUpload = async () => {
    if (file) {
      setUploading(true);
      await uploadClientFile(client.id, file);
      setUploading(false);
      setFile(null);
      router.refresh();
    }
  };

  // Persons (real)
  const [persons, setPersons] = useState<ClientPersonDto[]>([]);
  const [personsLoading, setPersonsLoading] = useState(false);

  const refreshPersons = useMemo(
    () => async () => {
      setPersonsLoading(true);
      try {
        const res = await fetch(`/api/clients/${client.id}/persons`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error(await res.text());
        const json = (await res.json()) as ClientPersonDto[];
        setPersons(json);
      } finally {
        setPersonsLoading(false);
      }
    },
    [client.id]
  );

  useEffect(() => {
    void refreshPersons();
  }, [refreshPersons]);

  const upsertPerson = (p: ClientPersonDto) => {
    setPersons((prev) => {
      const idx = prev.findIndex((x) => x.id === p.id);
      if (idx === -1) return [p, ...prev];
      const next = [...prev];
      next[idx] = p;
      return next;
    });
  };

  const deletePerson = async (personId: string) => {
    const res = await fetch(`/api/clients/${client.id}/persons/${personId}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (!res.ok) throw new Error(await res.text());
    setPersons((prev) => prev.filter((p) => p.id !== personId));
  };

  // TODO: connect cases (remove mocks) in follow-up feature PRs.
  type ClientCaseMock = {
    id: string;
    name: string;
    status: string;
    startDate: string;
    nextHearing?: string;
    description: string;
  };
  const cases: ClientCaseMock[] = [];

  type TimelineItem = {
    id: string;
    title: string;
    date: string;
    type: "file" | "person";
  };

  const timeline: TimelineItem[] = useMemo(() => {
    const items: TimelineItem[] = [];

    for (const f of files) {
      items.push({
        id: `file:${f.name}:${f.url}`,
        title: `Documento subido: ${f.name}`,
        date: f.createdAt || f.updatedAt || new Date().toISOString(),
        type: "file",
      });
    }

    for (const p of persons) {
      items.push({
        id: `person:${p.id}`,
        title: `Persona: ${p.name} (${p.role})`,
        date: p.updatedAt || p.createdAt,
        type: "person",
      });
    }

    items.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
    return items;
  }, [files, persons]);

  // Animation variants
  const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 }
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6">
      {/* Header */}
      <motion.div
        className="flex items-center justify-between mb-6"
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
      >
        <div className="flex items-center space-x-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{`${client.first_name} ${client.last_name}`}</h1>
            <p className="text-muted-foreground">Cliente desde {new Date().toLocaleDateString('es-AR')}</p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Client Info Card */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          transition={{ delay: 0.1 }}
        >
          <Card className="lg:col-span-1 border-0" style={{
            boxShadow: "none"
          }}>
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-primary/15 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg text-foreground">Información Personal</CardTitle>
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    Activo
                  </Badge>
                </div>
              </div>
              <Button variant="ghost" size="sm">
                <Edit className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {client.email && (
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-foreground">{client.email}</span>
                </div>
              )}
              {client.phone && (
                <div className="flex items-center space-x-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-foreground">{client.phone}</span>
                </div>
              )}
              {client.address && (
                <div className="flex items-center space-x-3">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-foreground">{client.address}</span>
                </div>
              )}
              <div className="pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground mb-2">
                  {client.document_type}: {client.document}
                </p>
                <p className="text-sm text-foreground">
                  Cliente registrado en el sistema con información completa.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Persons Section */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ delay: 0.15 }}
            className="mt-6"
          >
            <Card className="border-0" style={{
              boxShadow: "none"
            }}>
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <CardTitle className="text-lg text-foreground">Personas</CardTitle>
                </div>
                <ClientPersonDialog
                  clientId={client.id}
                  mode="create"
                  triggerText="Agregar"
                  onSaved={(p) => {
                    upsertPerson(p);
                  }}
                />
              </CardHeader>
              <CardContent className="space-y-3">
                {personsLoading ? (
                  <div className="text-center py-6">
                    <Loader className="h-8 w-8 text-muted-foreground mx-auto mb-2 animate-spin" />
                    <p className="text-sm text-muted-foreground">Cargando personas...</p>
                  </div>
                ) : persons.length > 0 ? (
                  persons.map((person) => (
                    <div key={person.id} className="p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <h4 className="font-medium text-foreground text-sm">{person.name}</h4>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="secondary" className="text-xs bg-blue-50 text-blue-700">
                              {person.role}
                            </Badge>
                            <span className="text-xs text-muted-foreground">{person.relationship}</span>
                          </div>
                          {person.phone && (
                            <div className="flex items-center space-x-2 mt-2">
                              <Phone className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">{person.phone}</span>
                            </div>
                          )}
                          {person.email && (
                            <div className="flex items-center space-x-2 mt-1">
                              <Mail className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">{person.email}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <ClientPersonDialog
                            clientId={client.id}
                            mode="edit"
                            initial={person}
                            triggerText="Editar"
                            onSaved={(p) => upsertPerson(p)}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-9 px-2"
                            onClick={() => {
                              void deletePerson(person.id).catch((e) => toast.error(String(e)));
                            }}
                          >
                            Borrar
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6">
                    <Users className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No hay personas asociadas</p>
                    <p className="text-xs text-muted-foreground mt-1">Agrega personas relacionadas al cliente</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Main Content */}
        <motion.div
          className="lg:col-span-2"
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          transition={{ delay: 0.2 }}
        >
          <Tabs defaultValue="cases" className="space-y-6">
            <TabsList className="w-full bg-sidebar rounded-lg overflow-x-auto whitespace-nowrap">
              <div className="w-max min-w-full inline-flex gap-1 p-1">
              <TabsTrigger
                value="cases"
                className="shrink-0 px-3 rounded-lg data-[state=active]:bg-[var(--legis-blue-dark)] data-[state=active]:text-white data-[state=active]:shadow-sm"
              >
                Asuntos
              </TabsTrigger>
              <TabsTrigger
                value="documents"
                className="shrink-0 px-3 rounded-lg data-[state=active]:bg-[var(--legis-blue-dark)] data-[state=active]:text-white data-[state=active]:shadow-sm"
              >
                Documentos
              </TabsTrigger>
              <TabsTrigger
                value="timeline"
                className="shrink-0 px-3 rounded-lg data-[state=active]:bg-[var(--legis-blue-dark)] data-[state=active]:text-white data-[state=active]:shadow-sm"
              >
                Cronología
              </TabsTrigger>
              <TabsTrigger
                value="chat"
                className="shrink-0 px-3 rounded-lg data-[state=active]:bg-[var(--legis-blue-dark)] data-[state=active]:text-white data-[state=active]:shadow-sm"
              >
                <span className="inline-flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Chat
                </span>
              </TabsTrigger>
              </div>
            </TabsList>

            <TabsContent value="cases" className="space-y-6">
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="space-y-6"
              >
                <div className="flex justify-end items-center">
                  <AddCaseDialog
                    clients={[client]}
                    preSelectedClient={client}
                  />
                </div>
                {cases.length === 0 ? (
                  <motion.div variants={itemVariants}>
                    <Card className="border-0" style={{ boxShadow: "none" }}>
                      <CardContent className="p-8 text-center">
                        <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-muted-foreground mb-2">Sin asuntos todavía</h3>
                        <p className="text-muted-foreground">
                          Por ahora este panel no está conectado al endpoint de asuntos del cliente.
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ) : (
                  cases.map((case_) => (
                    <motion.div key={case_.id} variants={itemVariants}>
                      <Card
                        className="border-0 cursor-pointer"
                        style={{}}
                        onClick={() => router.push(`/cases/${case_.id}`)}
                      >
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-lg text-foreground">{case_.name}</CardTitle>
                              <CardDescription className="text-muted-foreground">{case_.description}</CardDescription>
                            </div>
                            <Badge
                              variant={case_.status === 'En Progreso' ? 'default' : 'secondary'}
                              className={
                                case_.status === 'En Progreso'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }
                            >
                              {case_.status}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <div className="flex items-center space-x-4">
                              <span>Inicio: {new Date(case_.startDate).toLocaleDateString('es-AR')}</span>
                              {case_.nextHearing && (
                                <div className="flex items-center space-x-1">
                                  <Calendar className="h-4 w-4" />
                                  <span>
                                    Próxima audiencia: {new Date(case_.nextHearing).toLocaleDateString('es-AR')}
                                  </span>
                                </div>
                              )}
                            </div>
                            <FolderOpen className="h-4 w-4" />
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))
                )}
              </motion.div>
            </TabsContent>

            <TabsContent value="documents" className="space-y-4">
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="space-y-4"
              >
                <div className="flex justify-end items-center">
                  <AddDialog title="Subir documento" triggerText="Nuevo documento">
                    <div className="space-y-4">
                      <Input
                        type="file"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                      />
                      <Button
                        onClick={handleUpload}
                        disabled={uploading || !file}
                        className="w-full"
                      >
                        {uploading ? (
                          <Loader className="w-4 h-4 animate-spin" />
                        ) : (
                          "Subir"
                        )}
                      </Button>
                    </div>
                  </AddDialog>
                </div>
                {files.length > 0 ? (
                  files.map((doc) => (
                    <motion.div key={doc.name} variants={itemVariants}>
                      <Card className="border-0" style={{
                        boxShadow: "none"
                      }}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <FileText className="h-8 w-8 text-primary" />
                              <div>
                                <h4 className="font-medium text-foreground">{doc.name}</h4>
                                <p className="text-sm text-muted-foreground">Archivo subido</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-muted-foreground">
                                {new Date(doc.createdAt || doc.updatedAt || Date.now()).toLocaleDateString('es-AR')}
                              </p>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-primary"
                                onClick={() => window.open(doc.url, '_blank')}
                              >
                                <Download className="h-4 w-4 mr-1" />
                                Descargar
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))
                ) : (
                  <motion.div variants={itemVariants}>
                    <Card className="border-0" style={{
                      boxShadow: "none"
                    }}>
                      <CardContent className="p-8 text-center">
                        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-muted-foreground mb-2">No hay documentos</h3>
                        <p className="text-muted-foreground">
                          Este cliente aún no tiene archivos subidos.
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </motion.div>
            </TabsContent>

            <TabsContent value="timeline" className="space-y-4">
              <motion.div variants={itemVariants} className="space-y-4">
                <Card className="border-0" style={{
                  boxShadow: "none"
                }}>
                  <CardHeader>
                    <CardTitle className="text-foreground">Cronología de Actividades</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {timeline.length === 0 ? (
                      <div className="p-6 text-center">
                        <p className="text-sm text-muted-foreground">Sin actividad todavía.</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          (Pendiente conectar eventos/archivos/asuntos para armar la cronología real.)
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {timeline.map((item) => (
                          <div key={item.id} className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                            <div>
                              <p className="font-medium text-foreground">{item.title}</p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(item.date).toLocaleDateString('es-AR')}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="chat" className="space-y-4">
              <ClientChatArea client={client} />
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}
