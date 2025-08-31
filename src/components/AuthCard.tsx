/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { login } from "@/lib/auth-service";
import { Loader } from "lucide-react";

export default function AuthCard({ type }: { type: "login" | "register" }) {
  // --- tu lógica y estados originales ---
  const [name, setName] = useState(""); // visible solo en register (no cambia tu flujo Firebase actual)
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    confirm?: string;
  }>({});
  const [formTouched, setFormTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const isFilled =
    email !== "" &&
    password !== "" &&
    (type === "login" || confirmPassword !== "");

  const validate = () => {
    const newErrors: typeof errors = {};
    const emailRegex = /\S+@\S+\.\S+/;

    if (!emailRegex.test(email)) newErrors.email = "Formato de email inválido";
    if (password.length < 6)
      newErrors.password = "La contraseña debe tener al menos 6 caracteres";
    if (type === "register" && password !== confirmPassword)
      newErrors.confirm = "Las contraseñas no coinciden";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    setFormTouched(true);
    if (!validate()) return;

    setLoading(true);
    try {
      if (type === "login") {
        await login(email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        await login(email, password);
      }
      router.push("/");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Error al autenticar");
    } finally {
      setLoading(false);
    }
  };

  // --- UI al estilo lovable (misma paleta/clases) ---
  return (
    <Card className="border rounded-soft bg-card/50 backdrop-blur-sm shadow-none">
      <CardHeader className="text-center">
        <CardTitle className="h1">
          {type === "login" ? "Iniciar Sesión" : "Crear Cuenta"}
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          {type === "login"
            ? "Accedé a tu plataforma legal inteligente"
            : "Comenzá a optimizar tu práctica legal"}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="space-y-4"
        >
          {type === "register" && (
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-sm font-medium">
                Nombre completo
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Dra. María Gómez"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-10 rounded-standard"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-sm font-medium">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`h-10 rounded-standard ${formTouched && errors.email
                ? "border-red-500 focus-visible:ring-red-500"
                : ""
                }`}
              required
            />
            {formTouched && errors.email && (
              <Alert variant="destructive" className="mt-2">
                <AlertDescription>{errors.email}</AlertDescription>
              </Alert>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-sm font-medium">
              Contraseña
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`h-10 rounded-standard ${formTouched && errors.password
                ? "border-red-500 focus-visible:ring-red-500"
                : ""
                }`}
              required
            />
            {formTouched && errors.password && (
              <Alert variant="destructive" className="mt-2">
                <AlertDescription>{errors.password}</AlertDescription>
              </Alert>
            )}
          </div>

          {type === "register" && (
            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirmar contraseña
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`h-10 rounded-standard ${formTouched && errors.confirm
                  ? "border-red-500 focus-visible:ring-red-500"
                  : ""
                  }`}
                required
              />
              {formTouched && errors.confirm && (
                <Alert variant="destructive" className="mt-2">
                  <AlertDescription>{errors.confirm}</AlertDescription>
                </Alert>
              )}
            </div>
          )}

          <Button
            type="submit"
            className="w-full h-10 rounded-standard font-medium"
            disabled={!isFilled || loading}
          >
            {loading ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : type === "login" ? (
              "Ingresar"
            ) : (
              "Crear cuenta"
            )}
          </Button>
        </form>

        <div className="text-center pt-2">
          {type === "login" ? (
            <p className="text-sm text-muted-foreground">
              ¿No tenés cuenta?{" "}
              <Link
                href="/register"
                className="text-primary hover:text-primary/80 font-medium"
              >
                Registrate
              </Link>
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              ¿Ya tenés cuenta?{" "}
              <Link
                href="/login"
                className="text-primary hover:text-primary/80 font-medium"
              >
                Iniciá sesión
              </Link>
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
