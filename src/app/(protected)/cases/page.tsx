"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useCases } from "@/hooks/use-cases";

export default function CasesPage() {
  const { cases, createCase, loading } = useCases();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = async () => {
    if (!title.trim()) return;
    await createCase(title, description);
    setTitle("");
    setDescription("");
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Mis Casos</h1>

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
          <Button onClick={handleSubmit} disabled={loading}>
            Crear Caso
          </Button>
        </CardContent>
      </Card>

      {cases.length > 0 && (
        <div className="space-y-3">
          {cases.map((c) => (
            <Card key={c.id}>
              <CardContent className="pt-4">
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
