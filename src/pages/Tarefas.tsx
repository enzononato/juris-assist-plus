import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus, CheckCircle2, Circle, Clock, AlertTriangle, ListChecks, Trash2, Search, X, Download, ChevronLeft, ChevronRight, LayoutList, Columns3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { taskStatusLabels, priorityLabels, type Priority, type TaskStatus, type Task } from "@/data/mock";
import { useTenantData } from "@/hooks/useTenantData";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { HeaderSkeleton, FiltersSkeleton, TabsSkeleton, TaskSkeleton } from "@/components/ui/page-skeleton";

const priorityColors: Record<Priority, string> = {
  baixa: "bg-muted text-muted-foreground",
  media: "bg-info/15 text-info",
  alta: "bg-warning/15 text-warning",
  critica: "bg-destructive/10 text-destructive",
};

const priorityDot: Record<Priority, string> = {
  baixa: "bg-muted-foreground",
  media: "bg-info",
  alta: "bg-warning",
  critica: "bg-destructive",
};

const statusIcons: Record<TaskStatus, React.ReactNode> = {
  aberta: <Circle className="h-4 w-4 text-muted-foreground" />,
  em_andamento: <Clock className="h-4 w-4 text-primary" />,
  aguardando: <AlertTriangle className="h-4 w-4 text-warning" />,
  concluida: <CheckCircle2 className="h-4 w-4 text-success" />,
};

const taskStatusColors: Record<TaskStatus, string> = {
  aberta: "bg-muted/60 text-muted-foreground border-muted",
  em_andamento: "bg-primary/10 text-primary border-primary/30",
  aguardando: "bg-warning/15 text-warning border-warning/30",
  concluida: "bg-success/15 text-success border-success/30",
};

type ViewMode = "list" | "kanban";

// ── Task Kanban Column ──
function TaskKanbanColumn({ status, tasks, onStatusChange, onDelete }: { status: TaskStatus; tasks: Task[]; onStatusChange: (id: string, s: string) => void; onDelete: (id: string) => void }) {
  return (
    <div className="flex flex-col min-w-[260px] max-w-[320px] flex-1">
      <div className={cn("flex items-center gap-2 rounded-t-xl px-3 py-2 border border-b-0", taskStatusColors[status])}>
        {statusIcons[status]}
        <span className="text-xs font-bold">{taskStatusLabels[status]}</span>
        <Badge variant="secondary" className="text-[9px] ml-auto h-5 min-w-5 justify-center">{tasks.length}</Badge>
      </div>
      <div className="flex flex-col gap-2 rounded-b-xl border border-t-0 bg-muted/30 p-2 min-h-[120px]">
        {tasks.length === 0 && (
          <p className="text-[10px] text-muted-foreground/50 text-center py-6">Nenhuma tarefa</p>
        )}
        {tasks.map((t) => {
          const isOverdue = t.status !== "concluida" && new Date(t.due_at) < new Date();
          return (
            <div
              key={t.id}
              className="group rounded-lg border bg-card p-3 shadow-soft transition-all hover:shadow-card hover:-translate-y-0.5"
            >
              <div className="flex items-center gap-1.5 mb-1">
                <div className={cn("h-2 w-2 shrink-0 rounded-full", priorityDot[t.priority])} />
                <span className={cn("text-xs font-bold text-foreground truncate", t.status === "concluida" && "line-through opacity-60")}>{t.title}</span>
              </div>
              {t.case_number && (
                <Link to={`/processos/${t.case_id}`} className="text-[10px] text-primary font-medium truncate block mb-1 hover:underline">
                  {t.case_number} · {t.employee}
                </Link>
              )}
              <Badge variant="outline" className={cn("text-[9px] font-semibold", priorityColors[t.priority])}>
                {priorityLabels[t.priority]}
              </Badge>
              <div className="mt-2 flex items-center justify-between">
                <span className={cn("text-[9px] font-medium", isOverdue ? "text-destructive" : "text-muted-foreground")}>
                  {isOverdue && "⚠ "}
                  {new Date(t.due_at).toLocaleDateString("pt-BR")}
                </span>
                <span className="text-[9px] text-muted-foreground truncate max-w-[100px]">{t.assignees.join(", ")}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Tarefas() {
  const [tab, setTab] = useState("todas");
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("todas");
  const [assigneeFilter, setAssigneeFilter] = useState("todos");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { tasks } = useTenantData();
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const allAssignees = useMemo(() => {
    const set = new Set<string>();
    tasks.forEach((t) => t.assignees.forEach((a) => set.add(a)));
    return Array.from(set).sort();
  }, [tasks]);

  const filtered = useMemo(() => {
    let result = tasks;

    if (tab === "todas") {
      result = result.filter((t) => t.status !== "concluida");
    } else {
      result = result.filter((t) => t.status === tab);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((t) =>
        t.title.toLowerCase().includes(q) ||
        t.employee?.toLowerCase().includes(q) ||
        t.case_number?.toLowerCase().includes(q) ||
        t.assignees.some((a) => a.toLowerCase().includes(q))
      );
    }

    if (priorityFilter !== "todas") {
      result = result.filter((t) => t.priority === priorityFilter);
    }

    if (assigneeFilter !== "todos") {
      result = result.filter((t) => t.assignees.includes(assigneeFilter));
    }

    return result;
  }, [tasks, tab, search, priorityFilter, assigneeFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const handleFilterChange = (fn: () => void) => { fn(); setPage(1); };

  const handleStatusChange = (taskId: string, newStatus: string) => {
    toast({ title: `Status alterado para ${taskStatusLabels[newStatus as TaskStatus]}` });
  };

  const handleDelete = (taskId: string) => {
    toast({ title: "Tarefa excluída com sucesso." });
  };

  const exportCSV = () => {
    const BOM = "\uFEFF";
    const headers = ["Título", "Status", "Prioridade", "Processo", "Reclamante", "Responsáveis", "Prazo"];
    const rows = filtered.map((t) => [
      `"${t.title.replace(/"/g, '""')}"`,
      taskStatusLabels[t.status],
      priorityLabels[t.priority],
      t.case_number ?? "",
      t.employee ?? "",
      `"${t.assignees.join(", ")}"`,
      new Date(t.due_at).toLocaleString("pt-BR"),
    ]);
    const csv = BOM + [headers, ...rows].map((r) => r.join(";")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tarefas_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: `CSV exportado com ${filtered.length} tarefa(s)` });
  };

  const counts = {
    todas: tasks.filter(t => t.status !== "concluida").length,
    aberta: tasks.filter(t => t.status === "aberta").length,
    em_andamento: tasks.filter(t => t.status === "em_andamento").length,
    aguardando: tasks.filter(t => t.status === "aguardando").length,
    concluida: tasks.filter(t => t.status === "concluida").length,
  };

  const activeFilters = (search.trim() ? 1 : 0) + (priorityFilter !== "todas" ? 1 : 0) + (assigneeFilter !== "todos" ? 1 : 0);

  const clearFilters = () => {
    setSearch("");
    setPriorityFilter("todas");
    setAssigneeFilter("todos");
  };

  if (isLoading) {
    return (
      <div className="p-4 md:p-6 lg:p-8 space-y-5 animate-in fade-in duration-500">
        <HeaderSkeleton />
        <FiltersSkeleton />
        <TabsSkeleton count={5} />
        <TaskSkeleton count={5} />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight sm:text-2xl">Tarefas</h1>
        <p className="text-sm text-muted-foreground font-medium">
            <span className="text-foreground font-semibold">{filtered.length}</span> tarefa(s)
            {activeFilters > 0 && <span className="text-primary"> · {activeFilters} filtro(s) ativo(s)</span>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center rounded-lg border bg-muted/50 p-0.5">
            {([
              { mode: "list" as ViewMode, icon: <LayoutList className="h-3.5 w-3.5" />, label: "Lista" },
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
          <Button
            variant="outline"
            size="sm"
            className="gap-2 h-9 rounded-xl text-xs"
            onClick={exportCSV}
            disabled={filtered.length === 0}
          >
            <Download className="h-3.5 w-3.5" /> Exportar CSV
          </Button>
          <Button className="gap-2 rounded-xl shadow-glow-primary transition-all hover:shadow-lg hover:scale-[1.01] active:scale-[0.99]" size="sm" asChild style={{ background: "var(--gradient-primary)" }}>
            <Link to="/tarefas/nova"><Plus className="h-4 w-4" /> Nova Tarefa</Link>
          </Button>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por título, processo, reclamante ou responsável..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 rounded-lg text-sm"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <div className="flex gap-2">
          <Select value={priorityFilter} onValueChange={(v) => handleFilterChange(() => setPriorityFilter(v))}>
            <SelectTrigger className="h-9 w-[140px] text-xs rounded-lg">
              <SelectValue placeholder="Prioridade" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="todas">Todas prioridades</SelectItem>
              {(Object.entries(priorityLabels) as [Priority, string][]).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={assigneeFilter} onValueChange={(v) => handleFilterChange(() => setAssigneeFilter(v))}>
            <SelectTrigger className="h-9 w-[150px] text-xs rounded-lg">
              <SelectValue placeholder="Responsável" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="todos">Todos responsáveis</SelectItem>
              {allAssignees.map((a) => (
                <SelectItem key={a} value={a}>{a}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {activeFilters > 0 && (
            <Button variant="ghost" size="sm" className="h-9 text-xs text-muted-foreground shrink-0" onClick={clearFilters}>
              Limpar
            </Button>
          )}
        </div>
      </div>

      <Tabs value={tab} onValueChange={(v) => handleFilterChange(() => setTab(v))}>
        <div className="mb-5 overflow-x-auto scrollbar-hide">
          <TabsList className="w-max">
            <TabsTrigger value="todas">Todas ({counts.todas})</TabsTrigger>
            <TabsTrigger value="aberta">Abertas ({counts.aberta})</TabsTrigger>
            <TabsTrigger value="em_andamento">Em Andamento ({counts.em_andamento})</TabsTrigger>
            <TabsTrigger value="aguardando">Aguardando ({counts.aguardando})</TabsTrigger>
            <TabsTrigger value="concluida">Concluídas ({counts.concluida})</TabsTrigger>
          </TabsList>
        </div>
      </Tabs>

      <TooltipProvider>
        {viewMode === "kanban" ? (
          <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-thin">
            {(["aberta", "em_andamento", "aguardando", "concluida"] as TaskStatus[]).map((status) => (
              <TaskKanbanColumn
                key={status}
                status={status}
                tasks={filtered.filter((t) => t.status === status)}
                onStatusChange={handleStatusChange}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {paginated.map((t, index) => {
              const isOverdue = t.status !== "concluida" && new Date(t.due_at) < new Date();
              return (
                <div
                  key={t.id}
                  className={cn(
                    "group flex items-start gap-3 rounded-xl border bg-card p-3.5 shadow-soft transition-all duration-200 hover:shadow-card hover:-translate-y-0.5 sm:p-4 animate-in fade-in slide-in-from-bottom-2 duration-300",
                    t.status === "concluida" && "opacity-60"
                  )}
                  style={{ animationDelay: `${index * 40}ms` }}
                  role="article"
                  aria-label={`Tarefa: ${t.title}`}
                >
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="mt-0.5 shrink-0 cursor-help">{statusIcons[t.status]}</div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">{taskStatusLabels[t.status]}</p>
                    </TooltipContent>
                  </Tooltip>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start gap-2">
                      <div className={cn("mt-2 h-2 w-2 shrink-0 rounded-full ring-2 ring-offset-2 ring-offset-card", priorityDot[t.priority], `ring-${priorityDot[t.priority].replace("bg-", "")}/20`)} />
                      <p className={cn("text-sm font-semibold leading-snug", t.status === "concluida" && "line-through")}>{t.title}</p>
                    </div>
                    {t.case_number && (
                      <Link to={`/processos/${t.case_id}`} className="mt-1 truncate text-xs text-primary hover:underline block font-medium ml-4">
                        {t.case_number} · {t.employee}
                      </Link>
                    )}
                    <div className="mt-2 ml-4 flex flex-wrap items-center gap-1.5">
                      <Badge variant="outline" className={cn("text-[10px] font-semibold", priorityColors[t.priority])}>
                        {priorityLabels[t.priority]}
                      </Badge>
                      <span className={cn("text-[11px] font-medium", isOverdue ? "text-destructive" : "text-muted-foreground")}>
                        {isOverdue && "⚠ "}
                        {new Date(t.due_at).toLocaleDateString("pt-BR")} {new Date(t.due_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <p className="mt-1 ml-4 text-[11px] text-muted-foreground font-medium">{t.assignees.join(", ")}</p>
                  </div>

                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <Select value={t.status} onValueChange={(v) => handleStatusChange(t.id, v)}>
                      <SelectTrigger className="h-7 w-[120px] text-[10px] rounded-lg" aria-label="Alterar status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        {(Object.entries(taskStatusLabels) as [TaskStatus, string][]).map(([k, v]) => (
                          <SelectItem key={k} value={k} className="text-xs">{v}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive"
                          onClick={() => handleDelete(t.id)}
                          aria-label="Excluir tarefa"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">Excluir tarefa</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {filtered.length === 0 && (
          <div className="rounded-xl border border-dashed p-12 text-center animate-in fade-in duration-300">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/60">
              <ListChecks className="h-7 w-7 text-muted-foreground/50" />
            </div>
            <p className="text-sm font-semibold text-muted-foreground">Nenhuma tarefa encontrada</p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              {activeFilters > 0 ? "Tente ajustar os filtros" : "Crie uma nova tarefa para começar"}
            </p>
            {activeFilters > 0 && (
              <Button variant="outline" size="sm" className="mt-3 text-xs" onClick={clearFilters}>
                Limpar filtros
              </Button>
            )}
          </div>
        )}

        {/* Pagination */}
        {viewMode !== "kanban" && filtered.length > 0 && (
          <div className="mt-5 flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Exibir</span>
              <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(Number(v)); setPage(1); }}>
                <SelectTrigger className="h-8 w-[70px] rounded-lg text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {[10, 20, 50].map((n) => (
                    <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span>por página · <strong className="text-foreground">{filtered.length}</strong> total</span>
            </div>

            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg" onClick={() => setPage(1)} disabled={page === 1} aria-label="Primeira página">
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} aria-label="Página anterior">
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>
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
              <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} aria-label="Próxima página">
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg" onClick={() => setPage(totalPages)} disabled={page === totalPages} aria-label="Última página">
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>

            <p className="text-xs text-muted-foreground hidden sm:block">
              {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filtered.length)} de {filtered.length}
            </p>
          </div>
        )}
      </TooltipProvider>
    </div>
  );
}
