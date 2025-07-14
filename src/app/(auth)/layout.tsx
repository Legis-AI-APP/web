"use client";
import { useAuth } from "@/lib/useAuth";
import { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  useAuth(true);

  return <>{children}</>;
}
