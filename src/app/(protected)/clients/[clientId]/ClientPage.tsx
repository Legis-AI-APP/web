"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader, User, Phone, Mail, MapPin, FolderOpen, FileText, Calendar, Edit, Download } from 'lucide-react';
import { AddDialog } from "@/components/dialog/AddDialog";
import { Client, uploadClientFile } from "@/lib/clients-service";
import { useRouter } from "next/navigation";
import { LegisFile } from "@/lib/legis-file";
import { motion, Variants } from "framer-motion";

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

  // Mock data for cases (to be replaced with real data later)
  const cases = [
    {
      id: '1',
      name: 'Caso Legal Principal',
      status: 'En Progreso',
      startDate: '2024-01-10',
      nextHearing: '2024-02-15',
      description: 'Proceso legal en curso para el cliente'
    },
    {
      id: '2',
      name: 'Documentación Adicional',
      status: 'Pendiente',
      startDate: '2024-01-12',
      nextHearing: '2024-02-20',
      description: 'Revisión y análisis de documentación'
    }
  ];

  // Mock data for timeline (to be replaced with real data later)
  const timeline = [
    {
      id: '1',
      title: 'Cliente registrado en el sistema',
      date: '2024-01-01',
      type: 'registration'
    },
    {
      id: '2',
      title: 'Primer archivo subido',
      date: '2024-01-10',
      type: 'file'
    }
  ];

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
        <div className="flex space-x-3">
          <AddDialog title="Subir archivo" triggerText="Subir archivo">
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
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Client Info Card */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          transition={{ delay: 0.1 }}
        >
          <Card className="lg:col-span-1 shadow-2xl border-0" style={{
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.03)'
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
            <TabsList className="grid w-full grid-cols-3 bg-muted rounded-lg">
              <TabsTrigger value="cases" className="rounded-lg">Casos</TabsTrigger>
              <TabsTrigger value="documents" className="rounded-lg">Documentos</TabsTrigger>
              <TabsTrigger value="timeline" className="rounded-lg">Cronología</TabsTrigger>
            </TabsList>

            <TabsContent value="cases" className="space-y-6">
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="space-y-6"
              >
                {cases.map((case_) => (
                  <motion.div key={case_.id} variants={itemVariants}>
                    <Card
                      className="shadow-2xl border-0 hover:shadow-2xl transition-shadow cursor-pointer"
                      style={{
                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.03)'
                      }}
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
                              case_.status === 'En Progreso' ? 'bg-blue-100 text-blue-800' :
                                'bg-yellow-100 text-yellow-800'
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
                                <span>Próxima audiencia: {new Date(case_.nextHearing).toLocaleDateString('es-AR')}</span>
                              </div>
                            )}
                          </div>
                          <FolderOpen className="h-4 w-4" />
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            </TabsContent>

            <TabsContent value="documents" className="space-y-4">
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="space-y-4"
              >
                {files.length > 0 ? (
                  files.map((doc) => (
                    <motion.div key={doc.name} variants={itemVariants}>
                      <Card className="shadow-2xl border-0" style={{
                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.03)'
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
                                {new Date().toLocaleDateString('es-AR')}
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
                    <Card className="shadow-2xl border-0" style={{
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.03)'
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
                <Card className="shadow-2xl border-0" style={{
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.03)'
                }}>
                  <CardHeader>
                    <CardTitle className="text-foreground">Cronología de Actividades</CardTitle>
                  </CardHeader>
                  <CardContent>
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
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}
