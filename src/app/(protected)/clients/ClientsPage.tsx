"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Users, Eye, Mail, Phone, MapPin, FileText } from "lucide-react";
import { Client } from "@/lib/clients-service";
import AddClientDialog from "@/components/dialog/AddClientDialog";
import EmptyState from "@/components/EmptyState";
import { useRouter } from "next/navigation";

export default function ClientsPage({ clients }: { clients: Client[] }) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredClients = useMemo(() => {
    if (!searchTerm.trim()) return clients;

    return clients.filter(client =>
      `${client.first_name} ${client.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.document.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [clients, searchTerm]);

  const formatDocumentType = (type: string) => {
    const types: Record<string, string> = {
      'CUIT': 'CUIT',
      'CUIL': 'CUIL',
      'CDI': 'CDI'
    };
    return types[type] || type;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <div className="bg-card/50">
        <div className="px-6 pt-6 pb-4 sm:px-8 sm:pt-8 sm:pb-4 max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Clientes</h1>
              <p className="text-muted-foreground mt-1 text-lg">Gestiona y consulta información de tus clientes</p>
            </div>
            <AddClientDialog
              triggerText="Nuevo Cliente"
              documentTypes={["CUIT", "CUIL", "CDI"]}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 pb-6 sm:px-8 sm:pb-8 max-w-7xl mx-auto space-y-6">
        {/* Search Section */}
        <div className="max-w-lg">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              placeholder="Buscar clientes por nombre, email o documento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-12 text-base border-2 focus:border-primary/50 transition-colors"
            />
          </div>
        </div>

        {/* Clients Grid */}
        {filteredClients.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredClients.map((client) => (
              <Card
                key={client.id}
                className="group shadow-2xl border-0 hover:shadow-2xl transition-all duration-300 cursor-pointer bg-card/80 hover:bg-card gap-0 flex flex-col"
                style={{
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.03)'
                }}
                onClick={() => router.push(`/clients/${client.id}`)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-8 h-8 bg-primary/15 rounded-lg flex items-center justify-center group-hover:bg-primary/25 transition-colors">
                        <Users className="h-4 w-4 text-primary" />
                      </div>
                      <div className="space-y-0.5">
                        <CardTitle className="text-base text-foreground font-semibold">
                          {`${client.first_name} ${client.last_name}`}
                        </CardTitle>
                        <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                          {formatDocumentType(client.document_type)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 pt-0 flex-1 pb-4">
                  {client.email && (
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                      <span className="truncate text-xs">{client.email}</span>
                    </div>
                  )}
                  {client.phone && (
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Phone className="h-3.5 w-3.5 flex-shrink-0" />
                      <span className="text-xs">{client.phone}</span>
                    </div>
                  )}
                  {client.address && (
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                      <span className="truncate text-xs">{client.address}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <FileText className="h-3.5 w-3.5 flex-shrink-0" />
                    <span className="font-medium text-xs">{client.document}</span>
                  </div>
                </CardContent>
                <div className="px-4 pb-0 pt-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/clients/${client.id}`);
                    }}
                    className="w-full h-8 hover:bg-primary hover:text-primary-foreground transition-colors text-xs"
                  >
                    <Eye className="h-3.5 w-3.5 mr-1.5" />
                    Ver Detalles
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            message={
              searchTerm
                ? "No se encontraron clientes con esos criterios.\nIntenta con otros términos de búsqueda."
                : "Todavía no hay clientes.\nUsá el botón de arriba para crear uno."
            }
          />
        )}
      </div>
    </div>
  );
}
