"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";
import AppBar from "@/components/layout/AppBar";
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
import { AddDialog } from "@/components/AddDialog";
import { Case, createCase } from "@/lib/cases-service";
import { useRouter } from "next/navigation";
import { Client } from "@/lib/clients-service";

export default function CasesPage({
  cases,
  clients,
}: {
  cases: Case[];
  clients: Client[];
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedClient, setSelectedClient] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim() || !selectedClient) return;
    setLoading(true);
    await createCase(title, description, selectedClient.id);
    setTitle("");
    setDescription("");
    setSelectedClient(null);
    setLoading(false);
    setDialogOpen(false);
    router.refresh();
  };

  return (
    <div className="space-y-6">
      <AppBar
        title="Casos"
        actions={
          <AddDialog
            title="Crear caso"
            triggerText="Nuevo caso"
            open={dialogOpen}
            onOpenChange={setDialogOpen}
          >
            <div className="space-y-4">
              <Input
                placeholder="Título"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <Textarea
                placeholder="Descripción"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className="w-full justify-between"
                  >
                    {selectedClient
                      ? selectedClient.name
                      : "Seleccionar cliente"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Buscar cliente..." />
                    <CommandEmpty>No se encontró ningún cliente</CommandEmpty>
                    <CommandGroup>
                      {clients.map((client) => (
                        <CommandItem
                          key={client.id}
                          value={client.name}
                          onSelect={() => {
                            setSelectedClient({
                              id: client.id,
                              name: client.name,
                            });
                            setPopoverOpen(false);
                          }}
                        >
                          {client.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>

              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <Loader className="animate-spin w-4 h-4" />
                ) : (
                  "Crear caso"
                )}
              </Button>
            </div>
          </AddDialog>
        }
      />

      <div className="space-y-3">
        {cases.map((c) => (
          <Card key={c.id}>
            <CardContent className="pt-4 space-y-2">
              <h2 className="font-semibold">{c.title}</h2>
              <p className="text-sm text-muted-foreground">{c.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
