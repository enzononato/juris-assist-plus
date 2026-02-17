import { useState } from "react";
import { Scale, LogIn, User, Building2, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { availableMockUsers, roleLabels, useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

export default function Login() {
  const { login } = useAuth();
  const [selectedId, setSelectedId] = useState<string>("");

  const selected = availableMockUsers.find((u) => u.id === selectedId);

  return (
    <div className="flex min-h-svh items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-6">
        {/* Brand */}
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <Scale className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">SIAG</h1>
          <p className="text-sm text-muted-foreground">Sistema Integrado de Acompanhamento e Gestão</p>
        </div>

        {/* Login card */}
        <div className="rounded-xl border bg-card p-6 space-y-5">
          <div className="space-y-2">
            <Label className="text-xs font-semibold">Entrar como</Label>
            <Select value={selectedId} onValueChange={setSelectedId}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Selecione um usuário..." />
              </SelectTrigger>
              <SelectContent>
                {availableMockUsers.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    <span className="font-medium">{u.name}</span>
                    <span className="text-muted-foreground"> · {roleLabels[u.role]}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selected && (
            <div className="rounded-lg border bg-muted/30 p-3 space-y-2 animate-in fade-in duration-200">
              <div className="flex items-center gap-2 text-xs">
                <User className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="font-medium">{selected.name}</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <Shield className="h-3.5 w-3.5 text-muted-foreground" />
                <Badge variant="outline" className="text-[10px]">{roleLabels[selected.role]}</Badge>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-muted-foreground">
                  {selected.company_id === "all" ? "Acesso a todas as empresas" : selected.company_name}
                </span>
              </div>
            </div>
          )}

          <Button
            className="w-full gap-2"
            disabled={!selectedId}
            onClick={() => login(selectedId)}
          >
            <LogIn className="h-4 w-4" />
            Entrar
          </Button>
        </div>

        <p className="text-center text-[10px] text-muted-foreground">
          Ambiente de demonstração · Dados simulados
        </p>
      </div>
    </div>
  );
}
