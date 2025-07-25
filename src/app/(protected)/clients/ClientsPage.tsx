import { Card, CardContent } from "@/components/ui/card";
import AppBar from "@/components/layout/AppBar";
import { Client } from "@/lib/clients-service";
import AddClientDialog from "@/components/dialog/AddClientDialog";
import CardGrid from "@/components/CardGrid";
import EmptyState from "@/components/EmptyState";

export default function ClientsPage({ clients }: { clients: Client[] }) {
  return (
    <div className="space-y-6">
      <AppBar
        title="Clientes"
        actions={<AddClientDialog triggerText="Nuevo cliente" />}
      />

      {clients.length > 0 ? (
        <CardGrid>
          {clients.map((c) => (
            <Card key={c.id} className="w-[300px]">
              <CardContent className="p-4 text-sm space-y-1">
                <div>
                  <strong>Nombre:</strong> {c.name}
                </div>
                <div>
                  <strong>Email:</strong> {c.email}
                </div>
                <div>
                  <strong>Documento:</strong> {c.document}
                </div>
              </CardContent>
            </Card>
          ))}
        </CardGrid>
      ) : (
        <EmptyState message="Todavía no hay clientes.\nUsá el botón de arriba para crear uno." />
      )}
    </div>
  );
}
