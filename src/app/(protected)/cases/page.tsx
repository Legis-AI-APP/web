"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Loader } from "lucide-react";
import { useCases } from "@/hooks/use-cases";
import { useClients } from "@/hooks/use-clients";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export default function CasesPage() {
  const { cases, createCase, loading } = useCases();
  const { clients } = useClients();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedClient, setSelectedClient] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [open, setOpen] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim() || !selectedClient) return;
    await createCase(title, description, selectedClient.id);
    setTitle("");
    setDescription("");
    setSelectedClient(null);
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-center">Mis Casos</h1>

      <Card>
        <CardContent className="pt-6 space-y-4">
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

          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                className="w-full justify-between"
              >
                {selectedClient ? selectedClient.name : "Seleccionar cliente"}
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
                        setSelectedClient({ id: client.id, name: client.name });
                        setOpen(false);
                      }}
                    >
                      {client.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>

          <Button onClick={handleSubmit} disabled={loading} className="w-full">
            {loading ? (
              <Loader className="animate-spin w-4 h-4" />
            ) : (
              "Crear Caso"
            )}
          </Button>
        </CardContent>
      </Card>

      {cases.length > 0 && (
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
      )}
    </div>
  );
}
