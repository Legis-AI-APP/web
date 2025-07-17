"use client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function Error() {
  const router = useRouter();
  const reload = () => {
    router.refresh();
  };
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center">
      <h1 className="text-2xl font-bold">Ha ocurrido un error inesperado</h1>
      <Button variant={"link"} onClick={reload}>
        Intentar de nuevo
      </Button>
    </div>
  );
}
