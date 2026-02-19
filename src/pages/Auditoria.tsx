import { useState } from "react";
import { Shield, Search, Filter, Download, Trash2, Edit, CheckCircle2, User, Lock, Calendar, BarChart3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

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

const mockAuditLogs: AuditLog[] = [
  { id: "al1", action: "acesso_sigiloso", user: "Thiago", description: "Acessou processo sigiloso", case_number: "0009876-12.2024.5.03.0003", ip: "192.168.1.10", created_at: "2026-02-16T15:30:00" },
  { id: "al2", action: "download", user: "Thiago", description: "Download de registro_cftv_corredor.mp4 (com marca d'água)", case_number: "0009876-12.2024.5.03.0003", ip: "192.168.1.10", created_at: "2026-02-16T15:31:00" },
  { id: "al2b", action: "download", user: "Thiago", description: "Download de logs_acesso_jan2025.csv (com marca d'água)", case_number: "0009876-12.2024.5.03.0003", ip: "192.168.1.10", created_at: "2026-02-14T09:30:00" },
  { id: "al2c", action: "download", user: "Thiago", description: "Download de conversas_teams_supervisor.pdf (com marca d'água)", case_number: "0009876-12.2024.5.03.0003", ip: "192.168.1.10", created_at: "2026-02-14T11:30:00" },
  { id: "al3", action: "evidencia_validada", user: "Thiago", description: "Validou evidência espelho_ponto_jan2024.pdf", case_number: "0001234-56.2024.5.01.0001", ip: "192.168.1.10", created_at: "2026-02-16T14:00:00" },
  { id: "al3b", action: "evidencia_validada", user: "Thiago", description: "Validou evidência logs_acesso_jan2025.csv", case_number: "0009876-12.2024.5.03.0003", ip: "192.168.1.10", created_at: "2026-02-14T09:30:00" },
  { id: "al3c", action: "evidencia_validada", user: "Thiago", description: "Validou evidência atestado_medico_reclamante.pdf", case_number: "0009876-12.2024.5.03.0003", ip: "192.168.1.10", created_at: "2026-02-15T08:30:00" },
  { id: "al4", action: "status_alterado", user: "Thiago", description: "Status alterado de 'Novo' para 'Em Andamento'", case_number: "0001234-56.2024.5.01.0001", ip: "192.168.1.10", created_at: "2026-02-16T11:00:00" },
  { id: "al5", action: "prazo_alterado", user: "Sullydaiane", description: "Prazo 'Juntada de documentos' prorrogado de 20/02 para 25/02", case_number: "0005678-90.2024.5.02.0002", ip: "187.45.23.100", created_at: "2026-02-16T10:00:00" },
  { id: "al6", action: "login", user: "Sandra", description: "Login realizado via e-mail", ip: "192.168.1.15", created_at: "2026-02-16T08:30:00" },
  { id: "al7", action: "download", user: "Sullydaiane", description: "Download de espelho_ponto_jan2024.pdf", case_number: "0001234-56.2024.5.01.0001", ip: "200.100.50.25", created_at: "2026-02-15T16:30:00" },
  { id: "al7b", action: "download", user: "Thiago", description: "Download de espelho_ponto_jan2024.pdf", case_number: "0001234-56.2024.5.01.0001", ip: "192.168.1.10", created_at: "2026-02-15T14:00:00" },
  { id: "al7c", action: "download", user: "Sandra", description: "Download de espelho_ponto_fev2024.pdf", case_number: "0001234-56.2024.5.01.0001", ip: "192.168.1.15", created_at: "2026-02-16T10:00:00" },
  { id: "al7d", action: "download", user: "Samilly", description: "Download de escala_trabalho_2023.xlsx", case_number: "0001234-56.2024.5.01.0001", ip: "192.168.1.20", created_at: "2026-02-16T09:15:00" },
  { id: "al8", action: "permissao_alterada", user: "Thiago", description: "Concedeu acesso de 'Advogada Externa' a Sullydaiane", ip: "192.168.1.10", created_at: "2026-02-15T14:00:00" },
  { id: "al9", action: "arquivo_excluido", user: "Sandra", description: "Excluiu arquivo rascunho_calculo.xlsx (versão incorreta)", case_number: "0001234-56.2024.5.01.0001", ip: "192.168.1.15", created_at: "2026-02-15T11:00:00" },
  { id: "al10", action: "acesso_sigiloso", user: "Sullydaiane", description: "Tentativa de acesso a processo sigiloso — NEGADO (sem permissão)", case_number: "0009876-12.2024.5.03.0003", ip: "200.100.50.25", created_at: "2026-02-15T09:00:00" },
  { id: "al11", action: "login", user: "Thiago", description: "Login realizado via e-mail", ip: "192.168.1.10", created_at: "2026-02-15T08:00:00" },
];

export default function Auditoria() {
  const [actionFilter, setActionFilter] = useState("todas");
  const [userFilter, setUserFilter] = useState("todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [processoFilter, setProcessoFilter] = useState("");
  const [tab, setTab] = useState("logs");

  const uniqueUsers = [...new Set(mockAuditLogs.map((l) => l.user))];

  const uniqueProcessos = [...new Set(mockAuditLogs.map((l) => l.case_number).filter(Boolean))] as string[];

  const filtered = mockAuditLogs.filter((log) => {
    if (actionFilter !== "todas" && log.action !== actionFilter) return false;
    if (userFilter !== "todos" && log.user !== userFilter) return false;
    if (processoFilter !== "" && log.case_number !== processoFilter) return false;
    if (dateFrom && new Date(log.created_at) < new Date(dateFrom)) return false;
    if (dateTo && new Date(log.created_at) > new Date(dateTo + "T23:59:59")) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return log.user.toLowerCase().includes(q) || log.description.toLowerCase().includes(q) || (log.case_number || "").includes(q);
    }
    return true;
  });

  // Stats
  const actionCounts = mockAuditLogs.reduce((acc, l) => {
    acc[l.action] = (acc[l.action] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const userCounts = mockAuditLogs.reduce((acc, l) => {
    acc[l.user] = (acc[l.user] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const handleExport = () => {
    const headers = ["Data/Hora", "Ação", "Usuário", "Descrição", "Processo", "IP"];
    const rows = filtered.map((log) => [
      new Date(log.created_at).toLocaleString("pt-BR"),
      actionLabels[log.action],
      log.user,
      log.description,
      log.case_number || "",
      log.ip || "",
    ]);
    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(";"))
      .join("\n");
    const bom = "\uFEFF";
    const blob = new Blob([bom + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `auditoria_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast({ title: "📥 CSV exportado", description: `${filtered.length} registros baixados com sucesso.` });
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" /> Logs de Auditoria
          </h1>
          <p className="text-sm text-muted-foreground">Todas as ações críticas registradas no sistema</p>
        </div>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={handleExport}>
          <Download className="h-3.5 w-3.5" /> Exportar CSV
        </Button>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="logs" className="text-xs">Logs ({filtered.length})</TabsTrigger>
          <TabsTrigger value="estatisticas" className="text-xs gap-1.5">
            <BarChart3 className="h-3.5 w-3.5" /> Estatísticas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="logs">
          {/* Filters */}
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Buscar..." className="h-9 pl-8 text-xs" />
            </div>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-[170px] h-9 text-xs">
                <Filter className="mr-1.5 h-3.5 w-3.5" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas as ações</SelectItem>
                {Object.entries(actionLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={userFilter} onValueChange={setUserFilter}>
              <SelectTrigger className="w-[170px] h-9 text-xs">
                <User className="mr-1.5 h-3.5 w-3.5" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os usuários</SelectItem>
                {uniqueUsers.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={processoFilter} onValueChange={setProcessoFilter}>
              <SelectTrigger className="w-[220px] h-9 text-xs">
                <SelectValue placeholder="Todos os processos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os processos</SelectItem>
                {uniqueProcessos.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>
            <div className="flex gap-1.5 items-center">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
              <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="h-9 w-[130px] text-xs" />
              <span className="text-xs text-muted-foreground">a</span>
              <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="h-9 w-[130px] text-xs" />
            </div>
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
            <Badge className="text-[10px] bg-primary/10 text-primary border-0">
              {mockAuditLogs.filter((l) => l.action === "download").length} downloads
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
        </TabsContent>

        <TabsContent value="estatisticas">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* By action type */}
            <div className="rounded-xl border bg-card p-4">
              <h3 className="text-sm font-semibold mb-3">Por Tipo de Ação</h3>
              <div className="space-y-2">
                {Object.entries(actionCounts).sort((a, b) => b[1] - a[1]).map(([action, count]) => (
                  <div key={action} className="flex items-center gap-2">
                    <div className="shrink-0">{actionIcons[action as AuditAction]}</div>
                    <span className="flex-1 text-xs">{actionLabels[action as AuditAction]}</span>
                    <Badge variant="outline" className="text-[10px]">{count}</Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* By user */}
            <div className="rounded-xl border bg-card p-4">
              <h3 className="text-sm font-semibold mb-3">Por Usuário</h3>
              <div className="space-y-2">
                {Object.entries(userCounts).sort((a, b) => b[1] - a[1]).map(([user, count]) => {
                  const pct = Math.round((count / mockAuditLogs.length) * 100);
                  return (
                    <div key={user}>
                      <div className="flex justify-between text-xs mb-0.5">
                        <span className="font-medium">{user}</span>
                        <span className="text-muted-foreground">{count} ({pct}%)</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Security summary */}
            <div className="rounded-xl border bg-card p-4">
              <h3 className="text-sm font-semibold mb-3">Resumo de Segurança</h3>
              <div className="space-y-3">
                <div className="rounded-lg bg-destructive/5 p-3">
                  <p className="text-xs font-semibold text-destructive">Acessos Sigilosos</p>
                  <p className="text-2xl font-bold text-destructive">{actionCounts["acesso_sigiloso"] || 0}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {mockAuditLogs.filter((l) => l.action === "acesso_sigiloso" && l.description.includes("NEGADO")).length} negados
                  </p>
                </div>
                <div className="rounded-lg bg-warning/5 p-3">
                  <p className="text-xs font-semibold text-warning">Exclusões de Arquivo</p>
                  <p className="text-2xl font-bold text-warning">{actionCounts["arquivo_excluido"] || 0}</p>
                </div>
                <div className="rounded-lg bg-info/5 p-3">
                  <p className="text-xs font-semibold text-info">Downloads c/ Marca d'água</p>
                  <p className="text-2xl font-bold text-info">
                    {mockAuditLogs.filter((l) => l.action === "download" && l.description.includes("marca d'água")).length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
