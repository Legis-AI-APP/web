import AuthCard from "@/components/AuthCard";
import LegisLogo from "@/components/LegisLogo";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary to-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-7">
          <div className="flex justify-center mb-2">
            <LegisLogo size="lg" />
          </div>
          <p className="text-muted-foreground text-base">
            Organizá tu práctica legal con IA
          </p>
        </div>

        <AuthCard type="login" />
      </div>
    </div>
  );
}
