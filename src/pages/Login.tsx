import { useState } from "react";
import { Scale, LogIn, Mail, Lock, Sparkles, Eye, EyeOff, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { availableMockUsers, useAuth } from "@/contexts/AuthContext";

const SENHA_PADRAO = "rev123";

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [showSenha, setShowSenha] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !senha.trim()) {
      setError("Preencha e-mail e senha.");
      return;
    }

    setLoading(true);
    await new Promise((r) => setTimeout(r, 500)); // feedback visual

    const usuario = availableMockUsers.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase()
    );

    if (!usuario) {
      setError("E-mail não encontrado.");
      setLoading(false);
      return;
    }

    if (senha !== SENHA_PADRAO) {
      setError("Senha incorreta.");
      setLoading(false);
      return;
    }

    login(usuario.id);
  };

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
            <div
              className="relative flex h-16 w-16 items-center justify-center rounded-2xl shadow-glow-primary"
              style={{ background: "var(--gradient-primary)" }}
            >
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
        <form onSubmit={handleSubmit} className="glass-strong rounded-2xl border shadow-card p-6 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              E-mail
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com.br"
                className="h-12 pl-9 rounded-xl border-input/60 bg-background/50 text-sm font-medium"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                autoComplete="email"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="senha" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Senha
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="senha"
                type={showSenha ? "text" : "password"}
                placeholder="••••••"
                className="h-12 pl-9 pr-10 rounded-xl border-input/60 bg-background/50 text-sm font-medium"
                value={senha}
                onChange={(e) => { setSenha(e.target.value); setError(""); }}
                autoComplete="current-password"
              />
              <button
                type="button"
                tabIndex={-1}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setShowSenha((v) => !v)}
              >
                {showSenha ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 animate-in fade-in duration-200">
              <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
              <p className="text-xs text-destructive font-medium">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            className="w-full h-12 gap-2.5 rounded-xl text-sm font-semibold shadow-glow-primary transition-all hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] mt-2"
            style={{ background: "var(--gradient-primary)" }}
            disabled={loading}
          >
            <LogIn className="h-4 w-4" />
            {loading ? "Entrando..." : "Entrar no Sistema"}
          </Button>
        </form>

        <p className="text-center text-[10px] text-muted-foreground/60 font-medium flex items-center justify-center gap-1.5">
          <Sparkles className="h-3 w-3" />
          Ambiente de demonstração · Dados simulados
        </p>
      </div>
    </div>
  );
}
