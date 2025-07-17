import { Card, CardContent } from "@/components/ui/card";
import AppBar from "@/components/layout/AppBar";
import { Client } from "@/lib/clients-service";
import AddClientDialog from "@/components/dialog/AddClientDialog";

export default function ClientsPage({ clients }: { clients: Client[] }) {
  return (
    <div className="space-y-6">
      <AppBar
        title="Clientes"
        actions={<AddClientDialog triggerText="Nuevo cliente" />}
      />

      {clients.length > 0 ? (
        <div className="space-y-2">
          {clients.map((c) => (
            <Card key={c.id}>
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
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center min-h-[82vh] w-full text-center text-muted-foreground text-sm">
          Todavía no hay clientes.
          <br />
          Usá el botón de arriba para crear uno.
        </div>
      )}
    </div>
  );
}
