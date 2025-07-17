"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";
import { createClient } from "@/lib/clients-service";
import { useRouter } from "next/navigation";
import { AddDialog } from "./AddDialog";

export default function AddClientDialog({
  triggerText,
  onClientCreated,
  variant = "default",
}: {
  triggerText: string;
  onClientCreated?: () => void;
  variant?: "default" | "outline";
}) {
  const [newClient, setNewClient] = useState({
    name: "",
    email: "",
    document: "",
  });
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const router = useRouter();

  const handleCreate = async () => {
    if (!newClient.name.trim() || !newClient.email.trim()) return;
    setLoading(true);
    await createClient(newClient);
    setNewClient({ name: "", email: "", document: "" });
    setLoading(false);
    setDialogOpen(false);
    router.refresh();
    onClientCreated?.();
  };

  return (
    <AddDialog
      title="Crear cliente"
      triggerText={triggerText}
      open={dialogOpen}
      onOpenChange={setDialogOpen}
      variant={variant}
    >
      <div className="space-y-4 p-2">
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
            <Loader className="w-4 h-4 animate-spin" />
          ) : (
            "Crear cliente"
          )}
        </Button>
      </div>
    </AddDialog>
  );
}
