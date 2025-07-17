/* eslint-disable @typescript-eslint/no-explicit-any */
import { getAuth } from "firebase/auth";
import { useCallback, useEffect, useState } from "react";

type CaseFile = {
  name: string;
  url: string;
};

export function useCaseFiles(caseId: string) {
  const [files, setFiles] = useState<CaseFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const auth = getAuth();
  const getToken = useCallback(async () => {
    const user = auth.currentUser;
    if (!user) throw new Error("Usuario no autenticado");
    return await user.getIdToken();
  }, [auth.currentUser]);

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      const res = await fetch(
        `http://localhost:8080/api/cases/${caseId}/files`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!res.ok) throw new Error("Error fetching files");
      const data = await res.json();
      setFiles(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [caseId, getToken]);

  const uploadFile = async (file: File) => {
    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const token = await getToken();
      const res = await fetch(
        `http://localhost:8080/api/cases/${caseId}/upload`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          method: "POST",
          body: formData,
        }
      );

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || "Upload failed");
      }

      await fetchFiles();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [caseId, fetchFiles]);

  return {
    files,
    loading,
    uploading,
    error,
    uploadFile,
    refreshFiles: fetchFiles,
  };
}
