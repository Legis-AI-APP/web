"use client";

import { useParams } from "next/navigation";
import { useCaseFiles } from "@/hooks/use-case-files";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";
import AppBar from "@/components/layout/AppBar";
import { AddDialog } from "@/components/AddDialog";

export default function CasePage() {
  const { caseId } = useParams();
  const { files, loading, uploading, error, uploadFile } = useCaseFiles(
    caseId as string
  );

  const [file, setFile] = useState<File | null>(null);

  const handleUpload = async () => {
    if (file) {
      await uploadFile(file);
      setFile(null);
    }
  };

  return (
    <div className="space-y-6">
      <AppBar
        title={`Caso ${caseId}`}
        actions={
          <AddDialog title="Subir archivo" triggerText="Subir archivo">
            <div className="space-y-4">
              <Input
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
              <Button
                onClick={handleUpload}
                disabled={uploading || !file}
                className="w-full"
              >
                {uploading ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  "Subir"
                )}
              </Button>
              {error && <p className="text-sm text-red-500">{error}</p>}
            </div>
          </AddDialog>
        }
      />

      <div className="space-y-2">
        <h2 className="font-semibold">Archivos</h2>
        {loading ? (
          <p className="text-sm text-muted-foreground">Cargando archivos...</p>
        ) : files.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Todavía no hay archivos.
          </p>
        ) : (
          files.map((f) => (
            <Card key={f.name}>
              <CardContent className="p-4 text-sm">
                <a
                  href={f.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {f.name}
                </a>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
