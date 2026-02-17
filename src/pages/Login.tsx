import { useState } from "react";
import { Scale, LogIn, User, Building2, Shield, Sparkles } from "lucide-react";
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
    <div className="relative flex min-h-svh items-center justify-center overflow-hidden p-4">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-info/5" />
      <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-primary/8 blur-3xl animate-float" />
      <div className="absolute -bottom-40 -left-40 h-[400px] w-[400px] rounded-full bg-info/8 blur-3xl animate-float" style={{ animationDelay: "3s" }} />
      
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-[0.015]" style={{
        backgroundImage: "radial-gradient(circle, hsl(230, 72%, 52%) 1px, transparent 1px)",
        backgroundSize: "32px 32px",
      }} />

      <div className="relative z-10 w-full max-w-sm space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Brand */}
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="relative">
            <div className="absolute inset-0 rounded-2xl bg-primary/20 blur-xl" />
            <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl shadow-glow-primary"
              style={{ background: "var(--gradient-primary)" }}>
              <Scale className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tighter text-gradient-primary">SIAG</h1>
            <p className="mt-1 text-sm text-muted-foreground font-medium">
              Sistema Integrado de Acompanhamento e Gestão
            </p>
          </div>
        </div>

        {/* Login card */}
        <div className="glass-strong rounded-2xl border shadow-card p-6 space-y-5">
          <div className="space-y-2.5">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Entrar como
            </Label>
            <Select value={selectedId} onValueChange={setSelectedId}>
              <SelectTrigger className="h-12 rounded-xl border-input/60 bg-background/50 text-sm font-medium transition-all focus:border-primary focus:shadow-glow-primary/10">
                <SelectValue placeholder="Selecione um usuário..." />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {availableMockUsers.map((u) => (
                  <SelectItem key={u.id} value={u.id} className="rounded-lg">
                    <span className="font-semibold">{u.name}</span>
                    <span className="text-muted-foreground"> · {roleLabels[u.role]}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selected && (
            <div className="rounded-xl border bg-accent/30 p-4 space-y-2.5 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-center gap-2.5 text-xs">
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/10">
                  <User className="h-3.5 w-3.5 text-primary" />
                </div>
                <span className="font-semibold">{selected.name}</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs">
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-warning/10">
                  <Shield className="h-3.5 w-3.5 text-warning" />
                </div>
                <Badge variant="outline" className="text-[10px] font-semibold">{roleLabels[selected.role]}</Badge>
              </div>
              <div className="flex items-center gap-2.5 text-xs">
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-info/10">
                  <Building2 className="h-3.5 w-3.5 text-info" />
                </div>
                <span className="text-muted-foreground font-medium">
                  {selected.company_id === "all" ? "Acesso a todas as empresas" : selected.company_name}
                </span>
              </div>
            </div>
          )}

          <Button
            className="w-full h-12 gap-2.5 rounded-xl text-sm font-semibold shadow-glow-primary transition-all hover:shadow-lg hover:scale-[1.01] active:scale-[0.99]"
            style={{ background: selectedId ? "var(--gradient-primary)" : undefined }}
            disabled={!selectedId}
            onClick={() => login(selectedId)}
          >
            <LogIn className="h-4 w-4" />
            Entrar no Sistema
          </Button>
        </div>

        <p className="text-center text-[10px] text-muted-foreground/60 font-medium flex items-center justify-center gap-1.5">
          <Sparkles className="h-3 w-3" />
          Ambiente de demonstração · Dados simulados
        </p>
      </div>
    </div>
  );
}
