"use client";

import type { Client } from "@/lib/clients-service";
import type { ClientPersonDto } from "@/lib/client-persons";
import type { LegisFile } from "@/lib/legis-file";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Mail, Phone, MapPin, FileText, Users } from "lucide-react";

export default function ClientManagementPanel({
  client,
  persons,
  files,
}: {
  client: Client;
  persons: ClientPersonDto[];
  files: LegisFile[];
}) {
  return (
    <div className="p-4 space-y-4">
      <div>
        <div className="text-sm font-semibold">Gestión</div>
        <div className="text-xs text-muted-foreground">Cliente</div>
      </div>

      <Card className="border-0" style={{ boxShadow: "none" }}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Datos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-sm font-medium">
            {client.first_name} {client.last_name}
          </div>
          <div className="text-xs text-muted-foreground">
            {client.document_type}: {client.document}
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            <Badge variant="secondary">{client.email ? "email" : "sin email"}</Badge>
            <Badge variant="secondary">{client.phone ? "tel" : "sin tel"}</Badge>
          </div>

          <Separator className="my-2" />

          {client.email && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Mail className="h-3.5 w-3.5" />
              <span className="truncate">{client.email}</span>
            </div>
          )}
          {client.phone && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Phone className="h-3.5 w-3.5" />
              <span className="truncate">{client.phone}</span>
            </div>
          )}
          {client.address && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              <span className="truncate">{client.address}</span>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-0" style={{ boxShadow: "none" }}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Personas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{persons.length} asociadas</span>
          </div>
          {persons.slice(0, 6).map((p) => (
            <div key={p.id} className="text-sm">
              <div className="font-medium">{p.name}</div>
              <div className="text-xs text-muted-foreground">{p.role}</div>
            </div>
          ))}
          {persons.length > 6 ? (
            <div className="text-xs text-muted-foreground">… +{persons.length - 6} más</div>
          ) : null}
        </CardContent>
      </Card>

      <Card className="border-0" style={{ boxShadow: "none" }}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Documentos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <FileText className="h-4 w-4" />
            <span>{files.length} archivos</span>
          </div>
          {files.slice(0, 6).map((f) => (
            <div key={`${f.name}:${f.url}`} className="text-sm truncate" title={f.name}>
              {f.name}
            </div>
          ))}
          {files.length > 6 ? (
            <div className="text-xs text-muted-foreground">… +{files.length - 6} más</div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
