/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { getAuth } from "firebase/auth";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

export interface ClientDTO {
  id: number;
  name: string;
  email: string;
  document: string;
}

export function useClients() {
  const [clients, setClients] = useState<ClientDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const auth = getAuth();

  const getToken = useCallback(async () => {
    const user = auth.currentUser;
    if (!user) throw new Error("Usuario no autenticado");
    return await user.getIdToken();
  }, [auth]);

  const fetchClients = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const res = await fetch("http://localhost:8080/api/clients", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setClients(data);
    } catch (e) {
      toast.error("Error al cargar clientes");
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  const createClient = async (client: ClientDTO) => {
    try {
      const token = await getToken();
      const res = await fetch("http://localhost:8080/api/clients", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(client),
      });
      if (!res.ok) throw new Error("Error al crear cliente");
      toast.success("Cliente creado");
      await fetchClients();
    } catch (e) {
      toast.error("Error al crear cliente");
    }
  };

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  return {
    clients,
    loading,
    createClient,
    refetch: fetchClients,
  };
}
