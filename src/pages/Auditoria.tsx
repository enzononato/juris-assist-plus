import { useState } from "react";
import { Shield, Search, Filter, Eye, Download, Trash2, Edit, CheckCircle2, User, FileText, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

type AuditAction = "status_alterado" | "prazo_alterado" | "arquivo_excluido" | "evidencia_validada" | "acesso_sigiloso" | "download" | "login" | "permissao_alterada";

interface AuditLog {
  id: string;
  action: AuditAction;
  user: string;
  description: string;
  target?: string;
  case_number?: string;
  ip?: string;
  created_at: string;
}

const actionLabels: Record<AuditAction, string> = {
  status_alterado: "Status Alterado",
  prazo_alterado: "Prazo Alterado",
  arquivo_excluido: "Arquivo Excluído",
  evidencia_validada: "Evidência Validada",
  acesso_sigiloso: "Acesso Sigiloso",
  download: "Download",
  login: "Login",
  permissao_alterada: "Permissão Alterada",
};

const actionIcons: Record<AuditAction, React.ReactNode> = {
  status_alterado: <Edit className="h-3.5 w-3.5 text-info" />,
  prazo_alterado: <Edit className="h-3.5 w-3.5 text-warning" />,
  arquivo_excluido: <Trash2 className="h-3.5 w-3.5 text-destructive" />,
  evidencia_validada: <CheckCircle2 className="h-3.5 w-3.5 text-success" />,
  acesso_sigiloso: <Lock className="h-3.5 w-3.5 text-destructive" />,
  download: <Download className="h-3.5 w-3.5 text-primary" />,
  login: <User className="h-3.5 w-3.5 text-muted-foreground" />,
  permissao_alterada: <Shield className="h-3.5 w-3.5 text-warning" />,
};

const actionSeverity: Record<AuditAction, string> = {
  status_alterado: "info",
  prazo_alterado: "warning",
  arquivo_excluido: "destructive",
  evidencia_validada: "info",
  acesso_sigiloso: "destructive",
  download: "info",
  login: "muted",
  permissao_alterada: "warning",
};

const mockAuditLogs: AuditLog[] = [
  { id: "al1", action: "acesso_sigiloso", user: "Ana Jurídico", description: "Acessou processo sigiloso", case_number: "0009876-12.2024.5.03.0003", ip: "192.168.1.10", created_at: "2026-02-16T15:30:00" },
  { id: "al2", action: "download", user: "Ana Jurídico", description: "Download de registro_cftv_corredor.mp4 (com marca d'água)", case_number: "0009876-12.2024.5.03.0003", ip: "192.168.1.10", created_at: "2026-02-16T15:31:00" },
  { id: "al3", action: "evidencia_validada", user: "Ana Jurídico", description: "Validou evidência espelho_ponto_jan2024.pdf", case_number: "0001234-56.2024.5.01.0001", ip: "192.168.1.10", created_at: "2026-02-16T14:00:00" },
  { id: "al4", action: "status_alterado", user: "Ana Jurídico", description: "Status alterado de 'Novo' para 'Em Andamento'", case_number: "0001234-56.2024.5.01.0001", ip: "192.168.1.10", created_at: "2026-02-16T11:00:00" },
  { id: "al5", action: "prazo_alterado", user: "Dra. Patrícia Externa", description: "Prazo 'Juntada de documentos' prorrogado de 20/02 para 25/02", case_number: "0005678-90.2024.5.02.0002", ip: "187.45.23.100", created_at: "2026-02-16T10:00:00" },
  { id: "al6", action: "login", user: "João DP", description: "Login realizado via e-mail", ip: "192.168.1.15", created_at: "2026-02-16T08:30:00" },
  { id: "al7", action: "download", user: "Dr. Roberto Advogado", description: "Download de espelho_ponto_jan2024.pdf", case_number: "0001234-56.2024.5.01.0001", ip: "200.100.50.25", created_at: "2026-02-15T16:30:00" },
  { id: "al8", action: "permissao_alterada", user: "Ana Jurídico", description: "Concedeu acesso de 'Advogado Externo' a Dra. Patrícia", ip: "192.168.1.10", created_at: "2026-02-15T14:00:00" },
  { id: "al9", action: "arquivo_excluido", user: "João DP", description: "Excluiu arquivo rascunho_calculo.xlsx (versão incorreta)", case_number: "0001234-56.2024.5.01.0001", ip: "192.168.1.15", created_at: "2026-02-15T11:00:00" },
  { id: "al10", action: "acesso_sigiloso", user: "Dr. Roberto Advogado", description: "Tentativa de acesso a processo sigiloso — NEGADO (sem permissão)", case_number: "0009876-12.2024.5.03.0003", ip: "200.100.50.25", created_at: "2026-02-15T09:00:00" },
  { id: "al11", action: "login", user: "Ana Jurídico", description: "Login realizado via e-mail", ip: "192.168.1.10", created_at: "2026-02-15T08:00:00" },
  { id: "al12", action: "evidencia_validada", user: "Ana Jurídico", description: "Validou evidência logs_acesso_jan2025.csv", case_number: "0009876-12.2024.5.03.0003", ip: "192.168.1.10", created_at: "2026-02-14T09:30:00" },
];

export default function Auditoria() {
  const [actionFilter, setActionFilter] = useState("todas");
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = mockAuditLogs.filter((log) => {
    if (actionFilter !== "todas" && log.action !== actionFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return log.user.toLowerCase().includes(q) || log.description.toLowerCase().includes(q) || (log.case_number || "").includes(q);
    }
    return true;
  });

  return (
    <div className="p-4 md:p-6 lg:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" /> Logs de Auditoria
        </h1>
        <p className="text-sm text-muted-foreground">Todas as ações críticas registradas no sistema</p>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Buscar por usuário, ação, processo..." className="h-9 pl-8 text-xs" />
        </div>
        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="w-[180px] h-9 text-xs">
            <Filter className="mr-1.5 h-3.5 w-3.5" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas as ações</SelectItem>
            {Object.entries(actionLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Summary badges */}
      <div className="mb-4 flex flex-wrap gap-2">
        <Badge variant="outline" className="text-[10px]">{filtered.length} registros</Badge>
        <Badge className="text-[10px] bg-destructive/10 text-destructive border-0">
          {mockAuditLogs.filter((l) => l.action === "acesso_sigiloso").length} acessos sigilosos
        </Badge>
        <Badge className="text-[10px] bg-warning/15 text-warning border-0">
          {mockAuditLogs.filter((l) => l.action === "arquivo_excluido").length} exclusões
        </Badge>
      </div>

      {/* Logs */}
      <div className="space-y-2">
        {filtered.map((log) => (
          <div key={log.id} className={cn(
            "flex items-start gap-3 rounded-xl border bg-card p-4 transition-colors",
            log.action === "acesso_sigiloso" && "border-l-4 border-l-destructive",
            log.action === "arquivo_excluido" && "border-l-4 border-l-warning",
          )}>
            <div className="mt-0.5 shrink-0">{actionIcons[log.action]}</div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-medium">{log.description}</p>
                <Badge variant="outline" className="text-[9px]">{actionLabels[log.action]}</Badge>
              </div>
              <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1"><User className="h-3 w-3" /> {log.user}</span>
                {log.case_number && <span>· Processo: {log.case_number}</span>}
                {log.ip && <span>· IP: {log.ip}</span>}
              </div>
            </div>
            <span className="shrink-0 text-[10px] text-muted-foreground whitespace-nowrap">
              {new Date(log.created_at).toLocaleString("pt-BR")}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
