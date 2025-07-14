"use client";
import { useAuth } from "@/hooks/use-auth";
import { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  useAuth(true);

  return <>{children}</>;
}
