"use client";

import { useState } from "react";
import { useClients, ClientDTO } from "@/hooks/use-clients";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader } from "lucide-react";
import AppBar from "@/components/layout/AppBar";
import { AddDialog } from "@/components/AddDialog";

export default function ClientsPage() {
  const { clients, loading, createClient } = useClients();

  const [newClient, setNewClient] = useState<ClientDTO>({
    id: 0,
    name: "",
    email: "",
    document: "",
  });

  const handleCreate = async () => {
    await createClient(newClient);
    setNewClient({ id: 0, name: "", email: "", document: "" });
  };

  return (
    <div className="space-y-6">
      <AppBar
        title="Clientes"
        actions={
          <AddDialog title="Crear cliente" triggerText="Nuevo cliente">
            <div className="space-y-4">
              <Input
                placeholder="Nombre"
                value={newClient.name}
                onChange={(e) =>
                  setNewClient((prev) => ({ ...prev, name: e.target.value }))
                }
              />
              <Input
                placeholder="Email"
                value={newClient.email}
                onChange={(e) =>
                  setNewClient((prev) => ({ ...prev, email: e.target.value }))
                }
              />
              <Input
                placeholder="Documento"
                value={newClient.document}
                onChange={(e) =>
                  setNewClient((prev) => ({
                    ...prev,
                    document: e.target.value,
                  }))
                }
              />
              <Button
                onClick={handleCreate}
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <Loader className="animate-spin w-4 h-4" />
                ) : (
                  "Crear cliente"
                )}
              </Button>
            </div>
          </AddDialog>
        }
      />

      <div className="space-y-2">
        {clients.map((c, i) => (
          <Card key={i}>
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
    </div>
  );
}
