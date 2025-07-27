"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";
import AppBar from "@/components/layout/AppBar";
import { AddDialog } from "@/components/dialog/AddDialog";
import { Client, uploadClientFile } from "@/lib/clients-service";
import { useRouter } from "next/navigation";
import { LegisFile } from "@/lib/legis-file";

export default function ClientPage({
  client,
  files,
}: {
  client: Client;
  files: LegisFile[];
}) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  const handleUpload = async () => {
    if (file) {
      setUploading(true);
      await uploadClientFile(client.id, file);
      setUploading(false);
      setFile(null);
      router.refresh();
    }
  };

  return (
    <div className="space-y-6">
      <AppBar
        title={`${client.first_name} ${client.last_name}`}
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
            </div>
          </AddDialog>
        }
      />

      <div className="space-y-2">
        <h2 className="font-semibold">Archivos del cliente</h2>
        {files.length > 0 ? (
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
        ) : (
          <p className="text-muted-foreground text-sm">
            Este cliente aún no tiene archivos.
          </p>
        )}
      </div>
    </div>
  );
}
