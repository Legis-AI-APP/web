"use client";

import { useState, useEffect, useCallback } from "react";
import { getAuth } from "firebase/auth";

export interface Case {
  id: number;
  title: string;
  description: string;
  status: string;
  createdDate: string;
  updatedDate: string;
}

export function useCases() {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(false);
  const auth = getAuth();

  const getToken = useCallback(async () => {
    const user = auth.currentUser;
    if (!user) throw new Error("Usuario no autenticado");
    return await user.getIdToken();
  }, [auth]);

  const fetchCases = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const res = await fetch("http://localhost:8080/api/cases", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Error al obtener casos");
      const data = await res.json();
      setCases(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  const createCase = useCallback(
    async (title: string, description: string, clientId: number) => {
      const token = await getToken();
      const res = await fetch("http://localhost:8080/api/cases", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, description, status: "OPEN", clientId }),
      });
      if (!res.ok) throw new Error("Error al crear el caso");
      await fetchCases();
    },
    [fetchCases, getToken]
  );

  useEffect(() => {
    fetchCases();
  }, [fetchCases]);

  return {
    cases,
    loading,
    fetchCases,
    createCase,
  };
}
