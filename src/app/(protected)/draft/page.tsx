import DraftEditor from "@/components/DraftEditor";

export default function DraftPage() {
  return (
    <div className="-m-6 min-h-screen bg-background">
      <div className="px-6 pt-6 pb-4 sm:px-8 sm:pt-8 sm:pb-4 max-w-7xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Redactor</h1>
        <p className="text-muted-foreground mt-1 text-lg">
          Plantilla + generación asistida (streaming). Todavía sin sincronización.
        </p>
      </div>

      <div className="px-6 pb-6 sm:px-8 sm:pb-8">
        <DraftEditor
          title=""
          subtitle=""
          storageKey="draft:global"
          askEndpoint="/api/ai/ask"
          createChatPath="/api/chats"
        />
      </div>
    </div>
  );
}
