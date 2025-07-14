"use client";
import AuthCard from "@/components/AuthCard";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white px-4">
      <h1 className="text-4xl font-bold mb-8">Legis AI</h1>
      <AuthCard type="login" />
    </div>
  );
}
