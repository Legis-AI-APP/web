/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useAuth } from "@/hooks/use-auth";
import { useState, useRef, useEffect } from "react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { askGeminiStream } from "@/lib/ask-gemini-stream";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Loader } from "lucide-react";

export default function Home() {
  const { user } = useAuth();
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const bufferRef = useRef<string[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      const next = bufferRef.current.shift();
      if (next) setAnswer((prev) => prev + next);
    }, 15);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const handleAsk = async () => {
    if (!question.trim()) return;

    setLoading(true);
    setAnswer("");
    bufferRef.current = [];

    try {
      await askGeminiStream(question, (chunk) => {
        bufferRef.current.push(chunk);
      });
    } catch (err: any) {
      toast.error(err.message || "Error al pedir respuesta a la IA");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success("Sesión cerrada correctamente");
    } catch (err: any) {
      console.error(err);
      toast.error("No se pudo cerrar la sesión");
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-center">
        Bienvenido/a {user?.email?.split("@")[0]}
      </h1>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <Input
            placeholder="¿Qué vamos a hacer hoy?"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
          <Button onClick={handleAsk} disabled={loading} className="w-full">
            {loading ? (
              <Loader className="animate-spin w-4 h-4" />
            ) : (
              "Preguntar a la IA"
            )}
          </Button>
          {answer && (
            <pre className="text-sm text-muted-foreground whitespace-pre-wrap min-h-[120px]">
              {answer}
            </pre>
          )}
        </CardContent>
      </Card>

      <Button variant="ghost" onClick={handleLogout} className="w-full">
        Cerrar sesión
      </Button>
    </div>
  );
}
