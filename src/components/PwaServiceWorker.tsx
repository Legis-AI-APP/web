"use client";

import { useEffect } from "react";
import { toast } from "sonner";

export default function PwaServiceWorker() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    // Avoid SW in local dev unless explicitly enabled
    if (process.env.NODE_ENV !== "production") return;

    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => {
        const notifyUpdate = () => {
          toast.message("Actualización disponible", {
            description: "Recargá para aplicar la nueva versión.",
            action: {
              label: "Recargar",
              onClick: () => window.location.reload(),
            },
          });
        };

        if (reg.waiting) notifyUpdate();

        reg.addEventListener("updatefound", () => {
          const sw = reg.installing;
          if (!sw) return;
          sw.addEventListener("statechange", () => {
            if (sw.state === "installed" && navigator.serviceWorker.controller) {
              notifyUpdate();
            }
          });
        });
      })
      .catch(() => {
        // ignore
      });
  }, []);

  return null;
}
