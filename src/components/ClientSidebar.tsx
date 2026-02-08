"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

type ClientDto = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  document: string;
  document_type: string;
  phone: string;
  address: string;
};

export default function ClientSidebar({ clientId }: { clientId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [client, setClient] = useState<ClientDto | null>(null);
  const [chats, setChats] = useState<Array<{ id: string; title?: string | null }>>([]);

  const activeChatId = searchParams.get("chatId") || null;

  const title = useMemo(() => {
    if (!client) return `Cliente ${clientId.slice(0, 6)}`;
    const full = `${client.first_name} ${client.last_name}`.trim();
    return full.length ? full : `Cliente ${client.id.slice(0, 6)}`;
  }, [client, clientId]);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setLoading(true);
      try {
        const [clientRes, chatsRes] = await Promise.all([
          fetch(`/api/clients/${clientId}`, { credentials: "include" }),
          fetch(`/api/clients/${clientId}/chats`, { credentials: "include" }),
        ]);

        if (clientRes.ok) {
          const c = (await clientRes.json()) as ClientDto;
          if (!cancelled) setClient(c);
        }

        if (chatsRes.ok) {
          const json = (await chatsRes.json()) as Array<{ id: string; title?: string | null }>;
          if (!cancelled) setChats(json);
          if (!cancelled && !activeChatId && json.length > 0) {
            router.replace(`/clients/${clientId}?chatId=${json[0]!.id}`);
          }
        }
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Error cargando sidebar del cliente");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId]);

  const createNewChat = async () => {
    const res = await fetch(`/api/clients/${clientId}/chats`, {
      method: "POST",
      credentials: "include",
    });
    if (!res.ok) throw new Error("No se pudo crear el chat del cliente");
    const data = (await res.json()) as { chat_id: string };

    const chatsRes = await fetch(`/api/clients/${clientId}/chats`, { credentials: "include" });
    if (chatsRes.ok) {
      const json = (await chatsRes.json()) as Array<{ id: string; title?: string | null }>;
      setChats(json);
    }

    router.replace(`/clients/${clientId}?chatId=${data.chat_id}`);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b bg-sidebar/50">
        <h2 className="text-sm font-semibold text-foreground truncate">{title}</h2>
        {client?.email && <p className="text-xs text-muted-foreground truncate">{client.email}</p>}
      </div>

      <div className="flex-1 overflow-hidden p-3">
        <p className="text-xs text-muted-foreground">(panel del cliente acá)</p>
      </div>

      <div className="border-t p-3 space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">Chats del cliente</p>
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
                  onClick={() => router.replace(`/clients/${clientId}?chatId=${c.id}`)}
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
