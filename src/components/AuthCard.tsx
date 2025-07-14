/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { auth, provider } from "@/lib/firebase";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function AuthCard({ type }: { type: "login" | "register" }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    confirm?: string;
  }>({});
  const [formTouched, setFormTouched] = useState(false);
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

    try {
      if (type === "login") {
        await signInWithEmailAndPassword(auth, email, password);
        toast.success("Sesión iniciada con éxito");
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        toast.success("Cuenta creada con éxito");
      }
      router.push("/"); // Redirige al home después del login
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Error al autenticar");
    }
  };

  const handleGoogle = async () => {
    try {
      await signInWithPopup(auth, provider);
      toast.success("Sesión iniciada con Google");
      router.push("/");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Error al iniciar sesión con Google");
    }
  };

  return (
    <Card className="w-full max-w-sm shadow-xl border bg-background">
      <CardHeader>
        <CardTitle>
          {type === "login" ? "Iniciar sesión" : "Registrarse"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          <div>
            <Input
              placeholder="Correo electrónico"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={
                formTouched && errors.email
                  ? "border-red-500 focus-visible:ring-red-500"
                  : ""
              }
            />
            {formTouched && errors.email && (
              <Alert variant="destructive" className="mt-2">
                <AlertDescription>{errors.email}</AlertDescription>
              </Alert>
            )}
          </div>

          <div>
            <Input
              placeholder="Contraseña"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={
                formTouched && errors.password
                  ? "border-red-500 focus-visible:ring-red-500"
                  : ""
              }
            />
            {formTouched && errors.password && (
              <Alert variant="destructive" className="mt-2">
                <AlertDescription>{errors.password}</AlertDescription>
              </Alert>
            )}
          </div>

          {type === "register" && (
            <div>
              <Input
                placeholder="Confirmar contraseña"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={
                  formTouched && errors.confirm
                    ? "border-red-500 focus-visible:ring-red-500"
                    : ""
                }
              />
              {formTouched && errors.confirm && (
                <Alert variant="destructive" className="mt-2">
                  <AlertDescription>{errors.confirm}</AlertDescription>
                </Alert>
              )}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={!isFilled}>
            {type === "login" ? "Entrar" : "Crear cuenta"}
          </Button>
        </form>

        <Button
          variant="outline"
          className="w-full mt-2"
          onClick={handleGoogle}
        >
          Continuar con Google
        </Button>

        <div className="text-sm text-center text-muted-foreground mt-4">
          {type === "login" ? (
            <>
              ¿No tenés una cuenta?{" "}
              <Link
                href="/register"
                className="underline hover:text-primary transition-colors"
              >
                Registrate
              </Link>
            </>
          ) : (
            <>
              ¿Ya tenés una cuenta?{" "}
              <Link
                href="/login"
                className="underline hover:text-primary transition-colors"
              >
                Iniciar sesión
              </Link>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
