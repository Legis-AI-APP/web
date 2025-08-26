"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { AddDialog } from "@/components/dialog/AddDialog";
import AddClientDialog from "@/components/dialog/AddClientDialog";
import { Case, createCase } from "@/lib/cases-service";
import { Client } from "@/lib/clients-service";
import { useRouter } from "next/navigation";

export default function AddCaseDialog({
  clients,
  preSelectedClient
}: {
  clients: Client[];
  preSelectedClient?: Client;
}) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(false);
  const [newCase, setNewCase] = useState<
    Omit<Case, "id" | "created_at" | "updated_at" | "status">
  >({
    title: "",
    description: "",
    client_id: "",
  });

  // Auto-select client when preSelectedClient is provided
  useEffect(() => {
    if (preSelectedClient) {
      setSelectedClient(preSelectedClient);
      setNewCase(prev => ({
        ...prev,
        client_id: preSelectedClient.id,
      }));
    }
  }, [preSelectedClient]);

  const handleSubmit = async () => {
    if (!newCase.title.trim() || !newCase.description.trim() || !selectedClient)
      return;
    setLoading(true);
    await createCase(newCase);
    setNewCase({ title: "", description: "", client_id: "" });
    setSelectedClient(null);
    setLoading(false);
    setDialogOpen(false);
    router.refresh();
  };

  return (
    <AddDialog
      title="Crear asunto"
      triggerText="Nuevo asunto"
      open={dialogOpen}
      onOpenChange={setDialogOpen}
    >
      <div className="space-y-4">
        <Input
          placeholder="Título"
          value={newCase.title}
          onChange={(e) =>
            setNewCase((prev) => ({ ...prev, title: e.target.value }))
          }
        />
        <Textarea
          placeholder="Descripción"
          value={newCase.description}
          onChange={(e) =>
            setNewCase((prev) => ({ ...prev, description: e.target.value }))
          }
        />
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              className="w-full justify-between"
            >
              {selectedClient
                ? selectedClient.first_name + " " + selectedClient.last_name
                : "Seleccionar cliente"}
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-[var(--radix-popover-trigger-width)] p-0"
            align="start"
          >
            <Command>
              <div className="p-2 border-b">
                <AddClientDialog
                  triggerText="Nuevo cliente"
                  onClientCreated={() => router.refresh()}
                  variant="outline"
                  documentTypes={["CUIT", "CUIL", "CDI"]}
                />
              </div>
              <CommandInput placeholder="Buscar cliente..." />
              <CommandEmpty>No se encontró ningún cliente</CommandEmpty>
              <CommandGroup>
                {clients.map((client) => (
                  <CommandItem
                    key={client.id}
                    value={client.first_name + " " + client.last_name}
                    onSelect={() => {
                      setSelectedClient(client);
                      setNewCase((prev) => ({
                        ...prev,
                        client_id: client.id,
                      }));
                      setPopoverOpen(false);
                    }}
                  >
                    {client.first_name + " " + client.last_name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>

        <Button onClick={handleSubmit} disabled={loading} className="w-full">
          {loading ? <Loader className="animate-spin w-4 h-4" /> : "Crear asunto"}
        </Button>
      </div>
    </AddDialog>
  );
}
