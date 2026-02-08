"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import CaseDetailPanel from "@/components/CaseDetailPanel";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

type CaseDto = {
  id: string;
  title: string;
  status: string;
  client_id?: string | null;
};

export default function CaseSidebar({ caseId }: { caseId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [caseData, setCaseData] = useState<CaseDto | null>(null);
  const [chats, setChats] = useState<Array<{ id: string; title?: string | null }>>([]);

  const activeChatId = searchParams.get("chatId") || null;

  const panelCaseData = useMemo(
    () => ({
      id: caseId,
      title: caseData?.title ?? `Asunto ${caseId.slice(0, 6)}`,
      clientName: caseData?.client_id ? `Cliente (${caseData.client_id})` : "Cliente",
      status: caseData?.status ?? "",
      partyA: "",
      partyB: "",
      matter: caseData?.title ?? "",
    }),
    [caseData, caseId]
  );

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setLoading(true);
      try {
        const [caseRes, chatsRes] = await Promise.all([
          fetch(`/api/cases/${caseId}`, { credentials: "include" }),
          fetch(`/api/cases/${caseId}/chats`, { credentials: "include" }),
        ]);

        if (caseRes.ok) {
          const c = (await caseRes.json()) as CaseDto;
          if (!cancelled) setCaseData(c);
        }

        if (chatsRes.ok) {
          const json = (await chatsRes.json()) as Array<{ id: string; title?: string | null }>;
          if (!cancelled) setChats(json);
          if (!cancelled && !activeChatId && json.length > 0) {
            router.replace(`/cases/${caseId}?chatId=${json[0]!.id}`);
          }
        }
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Error cargando sidebar del caso");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caseId]);

  const createNewChat = async () => {
    const res = await fetch(`/api/cases/${caseId}/chats`, {
      method: "POST",
      credentials: "include",
    });
    if (!res.ok) throw new Error("No se pudo crear el chat del caso");
    const data = (await res.json()) as { chat_id: string };

    // refresh list
    const chatsRes = await fetch(`/api/cases/${caseId}/chats`, { credentials: "include" });
    if (chatsRes.ok) {
      const json = (await chatsRes.json()) as Array<{ id: string; title?: string | null }>;
      setChats(json);
    }

    router.replace(`/cases/${caseId}?chatId=${data.chat_id}`);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-hidden">
        <CaseDetailPanel
          mode="sidebar"
          isOpen={true}
          onClose={() => {}}
          caseData={panelCaseData}
        />
      </div>

      <div className="border-t p-3 space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">Chats del asunto</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => void createNewChat().catch((e) => toast.error(String(e)))}
            disabled={loading}
          >
            <Plus className="h-4 w-4 mr-1" />
            Nuevo
          </Button>
        </div>

        <div className="max-h-48 overflow-y-auto flex flex-col gap-1">
          {chats.length === 0 ? (
            <p className="text-xs text-muted-foreground">{loading ? "Cargando..." : "Sin chats todavía"}</p>
          ) : (
            chats.map((c) => {
              const active = c.id === activeChatId;
              const label = c.title && c.title.trim().length > 0 ? c.title : `Chat ${c.id.slice(0, 6)}`;
              return (
                <button
                  key={c.id}
                  onClick={() => router.replace(`/cases/${caseId}?chatId=${c.id}`)}
                  className={
                    "w-full text-left px-2 py-1.5 rounded-md text-sm transition " +
                    (active ? "bg-primary text-primary-foreground" : "hover:bg-accent/50")
                  }
                  title={label}
                >
                  <span className="truncate block text-[13px]">{label}</span>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
