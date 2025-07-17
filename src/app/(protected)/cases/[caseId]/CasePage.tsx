"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";
import AppBar from "@/components/layout/AppBar";
import { AddDialog } from "@/components/dialog/AddDialog";
import { Case, CaseFile, uploadFile } from "@/lib/cases-service";
import { useRouter } from "next/navigation";

export default function CasePage({
  oldCase,
  files,
}: {
  oldCase: Case;
  files: CaseFile[];
}) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  const handleUpload = async () => {
    if (file) {
      setUploading(true);
      await uploadFile(oldCase.id, file);
      setUploading(false);
      setFile(null);
      router.refresh();
    }
  };

  return (
    <div className="space-y-6">
      <AppBar
        title={`${oldCase.title}`}
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
        <h2 className="font-semibold">Archivos</h2>
        {files.map((f) => (
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
        ))}
      </div>
    </div>
  );
}
