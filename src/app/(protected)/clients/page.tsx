"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader } from "lucide-react";
import { useClients, ClientDTO } from "@/hooks/use-clients";

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
    <div className="max-w-xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-center">Gestión de Clientes</h1>

      <Card>
        <CardContent className="pt-6 space-y-4">
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
              setNewClient((prev) => ({ ...prev, document: e.target.value }))
            }
          />
          <Button onClick={handleCreate} disabled={loading} className="w-full">
            {loading ? (
              <Loader className="animate-spin w-4 h-4" />
            ) : (
              "Crear Cliente"
            )}
          </Button>
        </CardContent>
      </Card>

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
