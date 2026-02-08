"use client";

import { useEffect, useMemo, useState } from "react";
import { AddDialog } from "@/components/dialog/AddDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type {
  ClientPersonDto,
  CreateClientPersonDto,
  UpdateClientPersonDto,
} from "@/lib/client-persons";

export default function ClientPersonDialog({
  clientId,
  mode,
  initial,
  triggerText,
  onSaved,
}: {
  clientId: string;
  mode: "create" | "edit";
  initial?: ClientPersonDto;
  triggerText: string;
  onSaved: (p: ClientPersonDto) => void;
}) {
  const title = mode === "create" ? "Agregar persona" : "Editar persona";

  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [relationship, setRelationship] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const canSubmit = useMemo(
    () => name.trim().length > 0 && role.trim().length > 0 && relationship.trim().length > 0,
    [name, role, relationship]
  );

  useEffect(() => {
    if (!open) return;
    if (mode === "edit" && initial) {
      setName(initial.name ?? "");
      setRole(initial.role ?? "");
      setRelationship(initial.relationship ?? "");
      setPhone(initial.phone ?? "");
      setEmail(initial.email ?? "");
    }
  }, [open, mode, initial]);

  const reset = () => {
    setErr(null);
    setName("");
    setRole("");
    setRelationship("");
    setPhone("");
    setEmail("");
  };

  const submit = async () => {
    setErr(null);
    if (!canSubmit) {
      setErr("Completá nombre/rol/relación");
      return;
    }

    setSubmitting(true);
    try {
      if (mode === "create") {
        const payload: CreateClientPersonDto = {
          name: name.trim(),
          role: role.trim(),
          relationship: relationship.trim(),
          phone: phone.trim() ? phone.trim() : null,
          email: email.trim() ? email.trim() : null,
        };

        const res = await fetch(`/api/clients/${clientId}/persons`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(await res.text());
        const saved = (await res.json()) as ClientPersonDto;
        onSaved(saved);
      } else {
        if (!initial) throw new Error("Falta persona inicial");
        const payload: UpdateClientPersonDto = {
          name: name.trim(),
          role: role.trim(),
          relationship: relationship.trim(),
          phone: phone.trim() ? phone.trim() : null,
          email: email.trim() ? email.trim() : null,
        };

        const res = await fetch(`/api/clients/${clientId}/persons/${initial.id}`, {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(await res.text());
        const saved = (await res.json()) as ClientPersonDto;
        onSaved(saved);
      }

      setOpen(false);
      reset();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Error guardando persona");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AddDialog
      title={title}
      triggerText={triggerText}
      variant="outline"
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) reset();
      }}
    >
      <div className="space-y-3">
        <div className="grid gap-3">
          <div className="space-y-1">
            <label className="text-sm font-medium">Nombre</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-sm font-medium">Rol</label>
              <Input value={role} onChange={(e) => setRole(e.target.value)} placeholder="Testigo / Perito / ..." />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Relación</label>
              <Input value={relationship} onChange={(e) => setRelationship(e.target.value)} placeholder="Vecina / Profesional / ..." />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-sm font-medium">Teléfono</label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Email</label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>
        </div>

        {err && <p className="text-sm text-destructive">{err}</p>}

        <div className="flex justify-end gap-2">
          <Button variant="outline" type="button" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button type="button" onClick={submit} disabled={submitting || !canSubmit}>
            {submitting ? "Guardando..." : "Guardar"}
          </Button>
        </div>
      </div>
    </AddDialog>
  );
}
