"use client";

import { useAuth } from "@/lib/useAuth";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function Home() {
  const { user } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success("Sesión cerrada correctamente");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error(err);
      toast.error("No se pudo cerrar la sesión");
    }
  };

  return (
    <main className="p-6 min-h-screen flex flex-col items-center justify-center gap-6">
      <h1 className="text-2xl font-bold text-center">
        Bienvenido/a {user?.email?.split("@")[0]}
      </h1>

      <input
        type="text"
        placeholder="¿Qué vamos a hacer hoy?"
        className="w-full max-w-md px-4 py-3 rounded-xl border border-muted bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
      />

      <Button onClick={handleLogout}>Cerrar sesión</Button>
    </main>
  );
}
