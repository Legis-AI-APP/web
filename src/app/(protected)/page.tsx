/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useAuth } from "@/lib/useAuth";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useState } from "react";
import { Loader } from "lucide-react";
import { askGeminiStream } from "@/lib/askGeminiStream";

export default function Home() {
  const { user } = useAuth();
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success("Sesión cerrada correctamente");
    } catch (err: any) {
      console.error(err);
      toast.error("No se pudo cerrar la sesión");
    }
  };

  const handleAsk = async () => {
    if (!question.trim()) return;

    setLoading(true);
    setAnswer("");

    try {
      await askGeminiStream(question, async (chunk) => {
        for (const char of chunk) {
          await new Promise((res) => setTimeout(res, 15)); // velocidad del efecto
          setAnswer((prev) => prev + char);
        }
      });
    } catch (err: any) {
      toast.error(err.message || "Error al pedir respuesta a la IA");
    } finally {
      setLoading(false);
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
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        className="w-full max-w-md px-4 py-3 rounded-xl border border-muted bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
      />

      <Button onClick={handleAsk} disabled={loading}>
        {loading ? (
          <Loader className="animate-spin w-4 h-4" />
        ) : (
          "Preguntar a la IA"
        )}
      </Button>

      {answer && (
        <div className="w-full max-w-md bg-muted p-4 rounded-lg text-sm whitespace-pre-wrap min-h-[120px]">
          {answer}
        </div>
      )}

      <Button variant="ghost" onClick={handleLogout}>
        Cerrar sesión
      </Button>
    </main>
  );
}
