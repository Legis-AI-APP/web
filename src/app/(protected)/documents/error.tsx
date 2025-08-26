"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="text-center space-y-6 max-w-md mx-auto px-6">
                <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
                    <AlertTriangle className="h-8 w-8 text-destructive" />
                </div>

                <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-foreground">
                        Algo salió mal
                    </h2>
                    <p className="text-muted-foreground">
                        No se pudieron cargar los documentos. Intenta nuevamente.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button
                        onClick={reset}
                        variant="outline"
                        className="flex items-center gap-2"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Intentar de nuevo
                    </Button>
                    <Button
                        onClick={() => window.location.href = "/"}
                        className="flex items-center gap-2"
                    >
                        Volver al inicio
                    </Button>
                </div>
            </div>
        </div>
    );
}
