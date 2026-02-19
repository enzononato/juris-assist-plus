import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Search, Plus, ChevronRight, Shield, Building2, CalendarDays, Clock,
  Scale, Eye, LayoutList, LayoutGrid, Columns3, Filter, User, Gavel,
  AlertTriangle, CheckCircle2, FileText, TrendingUp, DollarSign,
  ArrowUpDown, X, SortAsc, SortDesc, Download, ChevronLeft, RefreshCw,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { statusLabels, type CaseStatus, type Case } from "@/data/mock";
import { useTenantData } from "@/hooks/useTenantData";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

const formatCurrency = (value?: number) =>
  value != null ? value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : null;

const statusColors: Record<CaseStatus, string> = {
  novo: "bg-info/15 text-info border-info/30",
  em_andamento: "bg-primary/10 text-primary border-primary/30",
  audiencia_marcada: "bg-warning/15 text-warning border-warning/30",
  sentenca: "bg-success/15 text-success border-success/30",
  recurso: "bg-destructive/10 text-destructive border-destructive/30",
  encerrado: "bg-muted text-muted-foreground border-muted",
};

const statusIcons: Record<CaseStatus, React.ReactNode> = {
  novo: <FileText className="h-3.5 w-3.5" />,
  em_andamento: <TrendingUp className="h-3.5 w-3.5" />,
  audiencia_marcada: <Gavel className="h-3.5 w-3.5" />,
  sentenca: <CheckCircle2 className="h-3.5 w-3.5" />,
  recurso: <AlertTriangle className="h-3.5 w-3.5" />,
  encerrado: <Scale className="h-3.5 w-3.5" />,
};

type ViewMode = "list" | "grid" | "kanban";
type SortField = "employee" | "filed_at" | "amount" | "next_deadline";
type SortDir = "asc" | "desc";

const sortLabels: Record<SortField, string> = {
  employee: "Reclamante",
  filed_at: "Data de ajuizamento",
  amount: "Valor da causa",
  next_deadline: "Próximo prazo",
};

// ── Stat Card ──
function StatCard({ label, value, subtitle, icon, color }: { label: string; value: string | number; subtitle?: string; icon: React.ReactNode; color: string }) {
  return (
    <div className={cn("flex items-center gap-3 rounded-xl border p-3.5 shadow-soft transition-all hover:shadow-card", color)}>
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-background/60">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-extrabold leading-none">{value}</p>
        <p className="text-[11px] font-medium opacity-70 mt-0.5">{label}</p>
        {subtitle && <p className="text-[10px] text-muted-foreground truncate">{subtitle}</p>}
      </div>
    </div>
  );
}

// ── Process Card (Grid) ──
function ProcessCardGrid({ c, index }: { c: Case; index: number }) {
  const daysUntilDeadline = c.next_deadline
    ? Math.ceil((new Date(c.next_deadline).getTime() - Date.now()) / 86400000)
    : null;
  const isUrgent = daysUntilDeadline !== null && daysUntilDeadline <= 5 && daysUntilDeadline >= 0;

  return (
    <Link
      to={`/processos/${c.id}`}
      className="group flex flex-col rounded-xl border bg-card shadow-soft transition-all duration-200 hover:shadow-card hover:-translate-y-1 active:scale-[0.98] animate-in fade-in slide-in-from-bottom-2 duration-300 overflow-hidden"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className={cn("h-1.5 w-full", {
        "bg-info": c.status === "novo",
        "bg-primary": c.status === "em_andamento",
        "bg-warning": c.status === "audiencia_marcada",
        "bg-success": c.status === "sentenca",
        "bg-destructive": c.status === "recurso",
        "bg-muted-foreground/30": c.status === "encerrado",
      })} />
      <div className="flex flex-col gap-2.5 p-4 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-sm font-bold text-foreground truncate">{c.employee}</span>
              {c.confidentiality !== "normal" && <Shield className="h-3 w-3 text-destructive shrink-0" />}
            </div>
            <p className="text-[11px] text-muted-foreground font-mono truncate">{c.case_number}</p>
          </div>
          <Badge variant="outline" className={cn("text-[9px] font-semibold shrink-0 gap-1", statusColors[c.status])}>
            {statusIcons[c.status]}
            {statusLabels[c.status]}
          </Badge>
        </div>

        <div className="flex items-center gap-1.5">
          <Building2 className="h-3 w-3 text-muted-foreground shrink-0" />
          <span className="text-[11px] text-primary font-medium truncate">{c.company}</span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="secondary" className="text-[10px] font-medium w-fit">{c.theme}</Badge>
          {c.amount != null && (
            <span className="text-[11px] font-semibold text-foreground">
              {formatCurrency(c.amount)}
            </span>
          )}
          {c.reopened && (
            <Badge variant="outline" className="text-[9px] font-semibold bg-warning/10 text-warning border-warning/40 gap-1">
              <RefreshCw className="h-2.5 w-2.5" /> Reaberto
            </Badge>
          )}
        </div>

        <div className="mt-auto pt-2 border-t border-border/50 flex items-center justify-between gap-2">
          <div className="flex flex-col gap-1 min-w-0">
            {c.next_hearing && (
              <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                <CalendarDays className="h-3 w-3 shrink-0" />
                {new Date(c.next_hearing).toLocaleDateString("pt-BR")}
              </span>
            )}
            {c.next_deadline && (
              <span className={cn("inline-flex items-center gap-1 text-[10px]", isUrgent ? "text-destructive font-semibold" : "text-muted-foreground")}>
                <Clock className="h-3 w-3 shrink-0" />
                {new Date(c.next_deadline).toLocaleDateString("pt-BR")}
                {isUrgent && <span className="text-[9px]">({daysUntilDeadline}d)</span>}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <User className="h-3 w-3 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground">{c.responsible}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ── Process Card (List) ──
function ProcessCardList({ c, index }: { c: Case; index: number }) {
  const daysUntilDeadline = c.next_deadline
    ? Math.ceil((new Date(c.next_deadline).getTime() - Date.now()) / 86400000)
    : null;
  const isUrgent = daysUntilDeadline !== null && daysUntilDeadline <= 5 && daysUntilDeadline >= 0;

  return (
    <Link
      to={`/processos/${c.id}`}
      className="group flex items-center gap-3 rounded-xl border bg-card p-3.5 shadow-soft transition-all duration-200 hover:shadow-card hover:-translate-y-0.5 active:scale-[0.99] sm:gap-4 sm:p-4 animate-in fade-in slide-in-from-bottom-2 duration-300"
      style={{ animationDelay: `${index * 40}ms` }}
      aria-label={`Processo de ${c.employee} - ${c.case_number}`}
    >
      <div className={cn("hidden sm:block h-10 w-1 rounded-full shrink-0", {
        "bg-info": c.status === "novo",
        "bg-primary": c.status === "em_andamento",
        "bg-warning": c.status === "audiencia_marcada",
        "bg-success": c.status === "sentenca",
        "bg-destructive": c.status === "recurso",
        "bg-muted-foreground/30": c.status === "encerrado",
      })} />
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground">{c.employee}</span>
          {c.confidentiality !== "normal" && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Shield className="h-3.5 w-3.5 text-destructive" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Processo {c.confidentiality === "ultra_restrito" ? "ultra restrito" : "restrito"}</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
        <p className="truncate text-xs text-muted-foreground font-medium">
          {c.case_number} · <span className="text-primary">{c.company}</span>
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <Badge variant="outline" className={cn("text-[10px] font-semibold gap-1", statusColors[c.status])}>
            {statusIcons[c.status]}
            {statusLabels[c.status]}
          </Badge>
          <Badge variant="secondary" className="text-[10px] font-medium">{c.theme}</Badge>
          {c.amount != null && (
            <span className="text-[11px] font-semibold text-foreground">
              {formatCurrency(c.amount)}
            </span>
          )}
          {c.reopened && (
            <Badge variant="outline" className="text-[9px] font-semibold bg-warning/10 text-warning border-warning/40 gap-1">
              <RefreshCw className="h-2.5 w-2.5" /> Reaberto
            </Badge>
          )}
          {isUrgent && (
            <Badge variant="outline" className="text-[9px] font-semibold bg-destructive/10 text-destructive border-destructive/30 gap-1">
              <AlertTriangle className="h-2.5 w-2.5" /> {daysUntilDeadline}d
            </Badge>
          )}
        </div>
        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 sm:hidden">
          {c.next_hearing && (
            <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
              <CalendarDays className="h-3 w-3" />
              {new Date(c.next_hearing).toLocaleDateString("pt-BR")}
            </span>
          )}
          {c.next_deadline && (
            <span className={cn("inline-flex items-center gap-1 text-[10px]", isUrgent ? "text-destructive font-semibold" : "text-muted-foreground")}>
              <Clock className="h-3 w-3" />
              {new Date(c.next_deadline).toLocaleDateString("pt-BR")}
            </span>
          )}
        </div>
      </div>
      <div className="hidden flex-col items-end gap-1.5 text-right sm:flex">
        {c.next_hearing && (
          <span className="text-[11px] text-muted-foreground font-medium">
            <CalendarDays className="mr-1 inline h-3 w-3" />
            {new Date(c.next_hearing).toLocaleDateString("pt-BR")}
          </span>
        )}
        {c.next_deadline && (
          <span className={cn("text-[11px] font-medium", isUrgent ? "text-destructive" : "text-muted-foreground")}>
            <Clock className="mr-1 inline h-3 w-3" />
            {new Date(c.next_deadline).toLocaleDateString("pt-BR")}
          </span>
        )}
        <span className="text-[11px] text-muted-foreground">{c.responsible}</span>
      </div>
      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/40 transition-all duration-200 group-hover:translate-x-1 group-hover:text-primary" />
    </Link>
  );
}

// ── Kanban Column ──
function KanbanColumn({ status, cases }: { status: CaseStatus; cases: Case[] }) {
  return (
    <div className="flex flex-col min-w-[260px] max-w-[320px] flex-1">
      <div className={cn("flex items-center gap-2 rounded-t-xl px-3 py-2 border border-b-0", statusColors[status])}>
        {statusIcons[status]}
        <span className="text-xs font-bold">{statusLabels[status]}</span>
        <Badge variant="secondary" className="text-[9px] ml-auto h-5 min-w-5 justify-center">{cases.length}</Badge>
      </div>
      <div className="flex flex-col gap-2 rounded-b-xl border border-t-0 bg-muted/30 p-2 min-h-[120px]">
        {cases.length === 0 && (
          <p className="text-[10px] text-muted-foreground/50 text-center py-6">Nenhum processo</p>
        )}
        {cases.map((c) => (
          <Link
            key={c.id}
            to={`/processos/${c.id}`}
            className="group rounded-lg border bg-card p-3 shadow-soft transition-all hover:shadow-card hover:-translate-y-0.5"
          >
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-xs font-bold text-foreground truncate">{c.employee}</span>
              {c.confidentiality !== "normal" && <Shield className="h-2.5 w-2.5 text-destructive shrink-0" />}
            </div>
            <p className="text-[10px] text-primary font-medium truncate mb-1.5">{c.company}</p>
            <Badge variant="secondary" className="text-[9px]">{c.theme}</Badge>
            {c.amount != null && (
              <p className="text-[10px] font-semibold text-foreground mt-1">{formatCurrency(c.amount)}</p>
            )}
            <div className="mt-2 flex items-center justify-between">
              <div className="flex flex-col gap-0.5">
                {c.next_deadline && (
                  <span className="text-[9px] text-muted-foreground inline-flex items-center gap-0.5">
                    <Clock className="h-2.5 w-2.5" />
                    {new Date(c.next_deadline).toLocaleDateString("pt-BR")}
                  </span>
                )}
              </div>
              <span className="text-[9px] text-muted-foreground">{c.responsible}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

// ── Main Page ──
export default function Processos() {
  const { cases, companies } = useTenantData();
  const { hasRole } = useAuth();
  const isExternal = hasRole(["advogado_externo"]);
  const [search, setSearch] = useState("");
  const [companyFilter, setCompanyFilter] = useState("all");
  const [statusTab, setStatusTab] = useState("em_andamento");
  const [responsibleFilter, setResponsibleFilter] = useState("all");
  const [themeFilter, setThemeFilter] = useState("all");
  
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [showFilters, setShowFilters] = useState(false);
  const [sortField, setSortField] = useState<SortField>("filed_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Reset to page 1 whenever filters/sort change
  useEffect(() => { setPage(1); }, [search, companyFilter, statusTab, responsibleFilter, themeFilter, sortField, sortDir]);

  const responsibles = useMemo(() => [...new Set(cases.map((c) => c.responsible))].sort(), [cases]);
  const themes = useMemo(() => [...new Set(cases.map((c) => c.theme))].sort(), [cases]);

  const filtered = useMemo(() => {
    let result = cases.filter((c) => {
      // Encerrados só aparecem na aba "encerrado"
      if (c.status === "encerrado" && statusTab !== "encerrado") return false;
      const matchesSearch =
        !search.trim() ||
        c.case_number.includes(search) ||
        c.employee.toLowerCase().includes(search.toLowerCase()) ||
        c.theme.toLowerCase().includes(search.toLowerCase()) ||
        c.company.toLowerCase().includes(search.toLowerCase()) ||
        c.responsible.toLowerCase().includes(search.toLowerCase());
      const matchesCompany = companyFilter === "all" || c.company_id === companyFilter;
      const matchesStatus = statusTab === "todos" || statusTab === "em_andamento"
        ? (statusTab === "todos" ? true : c.status === "em_andamento")
        : c.status === statusTab;
      const matchesResponsible = responsibleFilter === "all" || c.responsible === responsibleFilter;
      const matchesTheme = themeFilter === "all" || c.theme === themeFilter;
      return matchesSearch && matchesCompany && matchesStatus && matchesResponsible && matchesTheme;
    });

    // Sort
    result = [...result].sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case "employee":
          cmp = a.employee.localeCompare(b.employee);
          break;
        case "filed_at":
          cmp = new Date(a.filed_at).getTime() - new Date(b.filed_at).getTime();
          break;
        case "amount":
          cmp = (a.amount ?? 0) - (b.amount ?? 0);
          break;
        case "next_deadline":
          const da = a.next_deadline ? new Date(a.next_deadline).getTime() : Infinity;
          const db = b.next_deadline ? new Date(b.next_deadline).getTime() : Infinity;
          cmp = da - db;
          break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return result;
  }, [cases, search, companyFilter, statusTab, responsibleFilter, themeFilter, sortField, sortDir]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = useMemo(
    () => filtered.slice((page - 1) * pageSize, page * pageSize),
    [filtered, page, pageSize]
  );

  // Stats

  const stats = useMemo(() => {
    const activeCases = cases.filter((c) => c.status !== "encerrado");
    const urgentDeadlines = activeCases.filter((c) => {
      if (!c.next_deadline) return false;
      const days = Math.ceil((new Date(c.next_deadline).getTime() - Date.now()) / 86400000);
      return days >= 0 && days <= 7;
    }).length;
    const totalAmount = activeCases.reduce((sum, c) => sum + (c.amount ?? 0), 0);
    return {
      total: cases.length,
      emAndamento: activeCases.filter((c) => c.status === "em_andamento").length,
      audiencias: activeCases.filter((c) => c.status === "audiencia_marcada").length,
      urgentDeadlines,
      totalAmount,
    };
  }, [cases]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { todos: cases.filter((c) => c.status !== "encerrado").length };
    (Object.keys(statusLabels) as CaseStatus[]).forEach((s) => {
      counts[s] = cases.filter((c) => c.status === s).length;
    });
    return counts;
  }, [cases]);

  const kanbanStatuses: CaseStatus[] = ["novo", "em_andamento", "audiencia_marcada", "sentenca", "recurso", "encerrado"];
  const activeFiltersCount = [companyFilter, responsibleFilter, themeFilter].filter(f => f !== "all").length + (search.trim() ? 1 : 0);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const clearAll = () => {
    setSearch("");
    setCompanyFilter("all");
    setStatusTab("em_andamento");
    setResponsibleFilter("all");
    setThemeFilter("all");
  };

  const exportCSV = () => {
    const headers = [
      "Nº do Processo",
      "Reclamante",
      "Empresa",
      "Status",
      "Tema",
      "Valor da Causa (R$)",
      "Responsável",
      "Data de Ajuizamento",
      "Próxima Audiência",
      "Próximo Prazo",
      "Confidencialidade",
    ];

    const rows = filtered.map((c) => [
      c.case_number,
      c.employee,
      c.company,
      statusLabels[c.status],
      c.theme,
      c.amount != null ? c.amount.toFixed(2).replace(".", ",") : "",
      c.responsible,
      c.filed_at ? new Date(c.filed_at).toLocaleDateString("pt-BR") : "",
      c.next_hearing ? new Date(c.next_hearing).toLocaleDateString("pt-BR") : "",
      c.next_deadline ? new Date(c.next_deadline).toLocaleDateString("pt-BR") : "",
      c.confidentiality === "ultra_restrito" ? "Ultra Restrito" : c.confidentiality === "restrito" ? "Restrito" : "Normal",
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(";"))
      .join("\n");

    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const date = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.download = `processos_${date}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight sm:text-2xl">
            {isExternal ? "Meus Processos" : "Processos"}
          </h1>
          <p className="text-sm text-muted-foreground font-medium">
            <span className="text-foreground font-semibold">{filtered.length}</span> de {cases.length} processos
            {activeFiltersCount > 0 && <span className="text-primary"> · {activeFiltersCount} filtro(s)</span>}
          </p>
          {isExternal && (
            <Badge variant="outline" className="mt-1 text-[10px] gap-1">
              <Eye className="h-2.5 w-2.5" /> Portal do Advogado Externo
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center rounded-lg border bg-muted/50 p-0.5">
            {([
              { mode: "list" as ViewMode, icon: <LayoutList className="h-3.5 w-3.5" />, label: "Lista" },
              { mode: "grid" as ViewMode, icon: <LayoutGrid className="h-3.5 w-3.5" />, label: "Grid" },
              { mode: "kanban" as ViewMode, icon: <Columns3 className="h-3.5 w-3.5" />, label: "Kanban" },
            ]).map(({ mode, icon, label }) => (
              <Tooltip key={mode}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setViewMode(mode)}
                    className={cn(
                      "flex items-center justify-center h-8 w-8 rounded-md transition-all",
                      viewMode === mode
                        ? "bg-background shadow-soft text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {icon}
                  </button>
                </TooltipTrigger>
                <TooltipContent><p className="text-xs">{label}</p></TooltipContent>
              </Tooltip>
            ))}
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 h-9 rounded-xl text-xs"
                onClick={exportCSV}
                disabled={filtered.length === 0}
              >
                <Download className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Exportar CSV</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">Exportar {filtered.length} processo(s) para CSV</p>
            </TooltipContent>
          </Tooltip>
          {!isExternal && (
            <Button className="gap-2 rounded-xl shadow-glow-primary transition-all hover:shadow-lg hover:scale-[1.01] active:scale-[0.99]" size="sm" asChild style={{ background: "var(--gradient-primary)" }}>
              <Link to="/processos/novo">
                <Plus className="h-4 w-4" />
                Novo Processo
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-5 sm:gap-3">
        <StatCard label="Total de Processos" value={stats.total} icon={<Scale className="h-5 w-5 text-primary" />} color="bg-card" />
        <StatCard label="Em Andamento" value={stats.emAndamento} icon={<TrendingUp className="h-5 w-5 text-primary" />} color="bg-primary/5" />
        <StatCard label="Audiências Marcadas" value={stats.audiencias} icon={<Gavel className="h-5 w-5 text-warning" />} color="bg-warning/5" />
        <StatCard label="Prazos Próximos (7d)" value={stats.urgentDeadlines} icon={<AlertTriangle className="h-5 w-5 text-destructive" />} color="bg-destructive/5" />
        <StatCard
          label="Valor Total"
          value={formatCurrency(stats.totalAmount) ?? "–"}
          icon={<DollarSign className="h-5 w-5 text-success" />}
          color="bg-success/5 hidden lg:flex"
        />
      </div>

      {/* Status Tabs */}
      <Tabs value={statusTab} onValueChange={setStatusTab}>
        <div className="mb-4 overflow-x-auto scrollbar-hide">
          <TabsList className="w-max">
            <TabsTrigger value="todos">Todos ({statusCounts.todos})</TabsTrigger>
            {(Object.entries(statusLabels) as [CaseStatus, string][]).map(([k, v]) => (
              statusCounts[k] > 0 && (
                <TabsTrigger key={k} value={k} className="gap-1">
                  {statusIcons[k]}
                  {v} ({statusCounts[k]})
                </TabsTrigger>
              )
            ))}
          </TabsList>
        </div>
      </Tabs>

      {/* Search + Sort + Filters */}
      <div className="mb-5 space-y-2">
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por nº, nome, tema, empresa ou responsável..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-9 h-10 rounded-xl border-input/60 bg-background/50 transition-all focus:border-primary focus:shadow-glow-primary/10"
              aria-label="Buscar processos"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <div className="flex gap-2">
            {/* Sort */}
            <Select value={sortField} onValueChange={(v) => setSortField(v as SortField)}>
              <SelectTrigger className="h-10 w-[160px] rounded-xl text-xs">
                <ArrowUpDown className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {(Object.entries(sortLabels) as [SortField, string][]).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl shrink-0" onClick={() => setSortDir((d) => d === "asc" ? "desc" : "asc")}>
                  {sortDir === "asc" ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent><p className="text-xs">{sortDir === "asc" ? "Crescente" : "Decrescente"}</p></TooltipContent>
            </Tooltip>
            <Button
              variant="outline"
              size="sm"
              className={cn("gap-1.5 h-10 rounded-xl", activeFiltersCount > 0 && "border-primary text-primary")}
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4" />
              <span className="hidden sm:inline">Filtros</span>
              {activeFiltersCount > 0 && (
                <Badge className="h-5 min-w-5 justify-center text-[9px] px-1.5" style={{ background: "var(--gradient-primary)" }}>
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </div>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 animate-in fade-in slide-in-from-bottom-2 duration-300 rounded-xl border bg-card/50 p-3">
            <Select value={companyFilter} onValueChange={setCompanyFilter}>
              <SelectTrigger className="h-9 rounded-lg text-xs">
                <Building2 className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
                <SelectValue placeholder="Empresa" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all">Todas as empresas</SelectItem>
                {companies.map((company) => (
                  <SelectItem key={company.id} value={company.id}>{company.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={responsibleFilter} onValueChange={setResponsibleFilter}>
              <SelectTrigger className="h-9 rounded-lg text-xs">
                <User className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
                <SelectValue placeholder="Responsável" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all">Todos os responsáveis</SelectItem>
                {responsibles.map((r) => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={themeFilter} onValueChange={setThemeFilter}>
              <SelectTrigger className="h-9 rounded-lg text-xs">
                <Gavel className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
                <SelectValue placeholder="Tema" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all">Todos os temas</SelectItem>
                {themes.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {activeFiltersCount > 0 && (
              <Button variant="ghost" size="sm" className="text-xs text-muted-foreground h-9 sm:col-span-3" onClick={clearAll}>
                Limpar todos os filtros
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Banner encerrados */}
      {statusTab === "encerrado" && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-muted-foreground/20 bg-muted/50 px-4 py-3 text-sm text-muted-foreground animate-in fade-in duration-300">
          <Scale className="h-4 w-4 shrink-0" />
          <span>Processos encerrados estão em <strong>modo leitura</strong>. Novas tarefas, prazos e audiências não podem ser adicionados.</span>
        </div>
      )}

      {/* Content */}
      <TooltipProvider>
        {viewMode === "list" && (
          <div className="space-y-2">
            {paginated.map((c, index) => (
              <ProcessCardList key={c.id} c={c} index={index} />
            ))}
          </div>
        )}

        {viewMode === "grid" && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {paginated.map((c, index) => (
              <ProcessCardGrid key={c.id} c={c} index={index} />
            ))}
          </div>
        )}

        {viewMode === "kanban" && (
          <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-thin">
            {kanbanStatuses.map((status) => (
              <KanbanColumn key={status} status={status} cases={filtered.filter((c) => c.status === status)} />
            ))}
          </div>
        )}

        {filtered.length === 0 && (
          <div className="rounded-xl border border-dashed p-12 text-center animate-in fade-in duration-300">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/60">
              <Scale className="h-7 w-7 text-muted-foreground/50" />
            </div>
            <p className="text-sm font-semibold text-muted-foreground">Nenhum processo encontrado</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Tente ajustar os filtros de busca</p>
            {activeFiltersCount > 0 && (
              <Button variant="outline" size="sm" className="mt-3 text-xs" onClick={clearAll}>
                Limpar filtros
              </Button>
            )}
          </div>
        )}

        {/* Pagination controls — hidden on kanban */}
        {viewMode !== "kanban" && filtered.length > 0 && (
          <div className="mt-5 flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
            {/* Page size selector */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Exibir</span>
              <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(Number(v)); setPage(1); }}>
                <SelectTrigger className="h-8 w-[70px] rounded-lg text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {[10, 20, 50, 100].map((n) => (
                    <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span>por página · <strong className="text-foreground">{filtered.length}</strong> total</span>
            </div>

            {/* Page navigation */}
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-lg"
                onClick={() => setPage(1)}
                disabled={page === 1}
                aria-label="Primeira página"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-lg"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                aria-label="Página anterior"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>

              {/* Page number pills */}
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                .reduce<(number | "…")[]>((acc, p, i, arr) => {
                  if (i > 0 && (p as number) - (arr[i - 1] as number) > 1) acc.push("…");
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, i) =>
                  p === "…" ? (
                    <span key={`ellipsis-${i}`} className="px-1 text-xs text-muted-foreground">…</span>
                  ) : (
                    <Button
                      key={p}
                      variant={page === p ? "default" : "outline"}
                      size="icon"
                      className={cn("h-8 w-8 rounded-lg text-xs", page === p && "shadow-glow-primary/20")}
                      onClick={() => setPage(p as number)}
                      aria-label={`Página ${p}`}
                      aria-current={page === p ? "page" : undefined}
                    >
                      {p}
                    </Button>
                  )
                )}

              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-lg"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                aria-label="Próxima página"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-lg"
                onClick={() => setPage(totalPages)}
                disabled={page === totalPages}
                aria-label="Última página"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>

            {/* Range info */}
            <p className="text-xs text-muted-foreground hidden sm:block">
              {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filtered.length)} de {filtered.length}
            </p>
          </div>
        )}
      </TooltipProvider>
    </div>
  );
}

