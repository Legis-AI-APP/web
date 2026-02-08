"use client";

import { useMemo, useState } from "react";
import { AddDialog } from "@/components/dialog/AddDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CaseEventDto, CaseEventStatus, CaseEventType } from "@/lib/case-events";

const statusOptions: Array<{ value: CaseEventStatus; label: string }> = [
  { value: "PENDING", label: "Pendiente" },
  { value: "SCHEDULED", label: "Programada" },
  { value: "URGENT", label: "Urgente" },
  { value: "DONE", label: "Completado" },
];

function toIsoMaybe(dateTimeLocal?: string | null) {
  if (!dateTimeLocal) return null;
  const d = new Date(dateTimeLocal);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

export default function AddCaseEventDialog({
  caseId,
  type,
  triggerText = "Agregar",
  onCreated,
}: {
  caseId: string;
  type: CaseEventType;
  triggerText?: string;
  onCreated?: (created: CaseEventDto) => void;
}) {
  const title = useMemo(() => {
    switch (type) {
      case "MOVEMENT":
        return "Agregar movimiento";
      case "DATE":
        return "Agregar fecha";
      case "NOTE":
        return "Agregar nota";
      case "DOCUMENT":
        return "Agregar documento";
      default:
        return "Agregar";
    }
  }, [type]);

  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [eventTitle, setEventTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<CaseEventStatus>("PENDING");
  const [eventAtLocal, setEventAtLocal] = useState<string>("");

  const reset = () => {
    setEventTitle("");
    setDescription("");
    setStatus("PENDING");
    setEventAtLocal("");
    setErr(null);
  };

  const submit = async () => {
    setErr(null);
    if (!eventTitle.trim()) {
      setErr("El título es obligatorio");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title: eventTitle.trim(),
        description: description.trim(),
        type,
        status,
        event_at: type === "DATE" ? toIsoMaybe(eventAtLocal) : null,
        file_urls: [],
      };

      const res = await fetch(`/api/cases/${caseId}/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || `HTTP ${res.status}`);
      }

      const created = (await res.json()) as CaseEventDto;
      onCreated?.(created);
      setOpen(false);
      reset();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "No se pudo crear el evento");
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
        <div className="space-y-1">
          <label className="text-sm font-medium">Título</label>
          <Input value={eventTitle} onChange={(e) => setEventTitle(e.target.value)} />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Estado</label>
          <Select value={status} onValueChange={(v) => setStatus(v as CaseEventStatus)}>
            <SelectTrigger>
              <SelectValue placeholder="Elegí un estado" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {type === "DATE" && (
          <div className="space-y-1">
            <label className="text-sm font-medium">Fecha y hora</label>
            <Input
              type="datetime-local"
              value={eventAtLocal}
              onChange={(e) => setEventAtLocal(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Se guardará en ISO (UTC). Si querés, después lo ajustamos a timezone.
            </p>
          </div>
        )}

        <div className="space-y-1">
          <label className="text-sm font-medium">Descripción</label>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>

        {err && <p className="text-sm text-destructive">{err}</p>}

        <div className="flex justify-end gap-2">
          <Button variant="outline" type="button" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button type="button" onClick={submit} disabled={submitting}>
            {submitting ? "Guardando..." : "Guardar"}
          </Button>
        </div>
      </div>
    </AddDialog>
  );
}
