import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function SearchPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Buscar</h1>
        <p className="text-sm text-muted-foreground">
          MVP: buscador interno (normativa/jurisprudencia viene después con fuentes verificables).
        </p>
      </div>

      <Card className="border-0" style={{ boxShadow: "none" }}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Consulta</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Input placeholder="Ley, artículo, palabra clave…" />
          <Button type="button">Buscar</Button>
        </CardContent>
      </Card>

      <Card className="border-0" style={{ boxShadow: "none" }}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Resultados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">Sin resultados (MVP scaffold).</div>
        </CardContent>
      </Card>
    </div>
  );
}
