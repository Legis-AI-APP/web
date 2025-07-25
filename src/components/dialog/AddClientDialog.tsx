"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";
import { createClient } from "@/lib/clients-service";
import { useRouter } from "next/navigation";
import { AddDialog } from "./AddDialog";
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

export default function AddClientDialog({
  triggerText,
  documentTypes,
  onClientCreated,
  variant = "default",
}: {
  triggerText: string;
  documentTypes: string[];
  onClientCreated?: () => void;
  variant?: "default" | "outline";
}) {
  const [newClient, setNewClient] = useState({
    first_name: "",
    last_name: "",
    email: "",
    document: "",
    document_type: "",
    phone: "",
    address: "",
  });
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const router = useRouter();

  const handleCreate = async () => {
    const {
      first_name,
      last_name,
      email,
      document,
      document_type,
      phone,
      address,
    } = newClient;

    if (
      !first_name.trim() ||
      !last_name.trim() ||
      !email.trim() ||
      !document.trim() ||
      !document_type.trim() ||
      !phone.trim() ||
      !address.trim()
    )
      return;

    setLoading(true);
    await createClient(newClient);
    setNewClient({
      first_name: "",
      last_name: "",
      email: "",
      document: "",
      document_type: "",
      phone: "",
      address: "",
    });
    setDialogOpen(false);
    setLoading(false);
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
          value={newClient.first_name}
          onChange={(e) =>
            setNewClient((prev) => ({ ...prev, first_name: e.target.value }))
          }
        />
        <Input
          placeholder="Apellido"
          value={newClient.last_name}
          onChange={(e) =>
            setNewClient((prev) => ({ ...prev, last_name: e.target.value }))
          }
        />
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              className="w-full justify-between"
            >
              {newClient.document_type
                ? newClient.document_type
                : "Tipo de documento"}
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-[var(--radix-popover-trigger-width)] p-0"
            align="start"
          >
            <Command>
              <CommandInput placeholder="Buscar tipo..." />
              <CommandEmpty>No hay tipos disponibles</CommandEmpty>
              <CommandGroup>
                {documentTypes.map((type) => (
                  <CommandItem
                    key={type}
                    value={type}
                    onSelect={() => {
                      setNewClient((prev) => ({
                        ...prev,
                        document_type: type,
                      }));
                      setPopoverOpen(false);
                    }}
                  >
                    {type}
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
        <Input
          placeholder="Documento"
          value={newClient.document}
          onChange={(e) =>
            setNewClient((prev) => ({ ...prev, document: e.target.value }))
          }
        />
        <Input
          placeholder="Dirección"
          value={newClient.address}
          onChange={(e) =>
            setNewClient((prev) => ({ ...prev, address: e.target.value }))
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
          placeholder="Teléfono"
          value={newClient.phone}
          onChange={(e) =>
            setNewClient((prev) => ({ ...prev, phone: e.target.value }))
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
