import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Plus, CheckCircle2, Circle, Clock, AlertTriangle, ListChecks, Trash2,
  Search, X, Download, ChevronLeft, ChevronRight, LayoutList, Columns3,
  TrendingUp, BarChart3, Users, Flame
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd";
import { format, isAfter, isBefore, subDays } from "date-fns";

type Priority = "baixa" | "media" | "alta" | "critica";
type TaskStatus = "aberta" | "em_andamento" | "aguardando" | "concluida";

const taskStatusLabels: Record<TaskStatus, string> = {
  aberta: "Aberta", em_andamento: "Em Andamento", aguardando: "Aguardando", concluida: "Concluída",
};
const priorityLabels: Record<Priority, string> = {
  baixa: "Baixa", media: "Média", alta: "Alta", critica: "Crítica",
};
const priorityColors: Record<Priority, string> = {
  baixa: "bg-muted text-muted-foreground", media: "bg-info/15 text-info",
  alta: "bg-warning/15 text-warning", critica: "bg-destructive/10 text-destructive",
};
const priorityDot: Record<Priority, string> = {
  baixa: "bg-muted-foreground", media: "bg-info", alta: "bg-warning", critica: "bg-destructive",
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

interface SupaTask {
  id: string;
  title: string;
  status: TaskStatus;
  priority: Priority;
  due_at: string | null;
  case_id: string | null;
  assignees: string[] | null;
  show_in_calendar: boolean | null;
  all_day: boolean | null;
  created_at: string;
  updated_at: string;
  cases: { case_number: string; employee_name: string | null } | null;
}

type ViewMode = "list" | "kanban";

export default function Tarefas() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState("todas");
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("todas");
  const [assigneeFilter, setAssigneeFilter] = useState("todos");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [viewMode, setViewMode] = useState<ViewMode>("list");

  // ── Supabase Query ──
  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["all-tasks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tasks")
        .select("*, cases(case_number, employee_name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data as unknown as SupaTask[]) ?? [];
    },
  });

  // ── Mutations ──
  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: TaskStatus }) => {
      const { error } = await supabase.from("tasks").update({ status: status as any }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: ["all-tasks"] });
      toast({ title: `Status alterado para ${taskStatusLabels[status]}` });
    },
  });

  const deleteTask = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("tasks").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-tasks"] });
      toast({ title: "Tarefa excluída" });
    },
  });

  // ── Derived data ──
  const allAssignees = useMemo(() => {
    const set = new Set<string>();
    tasks.forEach((t) => (t.assignees ?? []).forEach((a) => set.add(a)));
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
        t.cases?.employee_name?.toLowerCase().includes(q) ||
        t.cases?.case_number?.toLowerCase().includes(q) ||
        (t.assignees ?? []).some((a) => a.toLowerCase().includes(q))
      );
    }
    if (priorityFilter !== "todas") result = result.filter((t) => t.priority === priorityFilter);
    if (assigneeFilter !== "todos") result = result.filter((t) => (t.assignees ?? []).includes(assigneeFilter));
    return result;
  }, [tasks, tab, search, priorityFilter, assigneeFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);
  const handleFilterChange = (fn: () => void) => { fn(); setPage(1); };

  // ── KPIs ──
  const now = new Date();
  const weekAgo = subDays(now, 7);
  const overdue = tasks.filter((t) => t.status !== "concluida" && t.due_at && new Date(t.due_at) < now).length;
  const completedThisWeek = tasks.filter((t) => t.status === "concluida" && isAfter(new Date(t.updated_at), weekAgo)).length;
  const criticalOpen = tasks.filter((t) => t.status !== "concluida" && t.priority === "critica").length;
  const totalOpen = tasks.filter((t) => t.status !== "concluida").length;

  const counts = {
    todas: tasks.filter((t) => t.status !== "concluida").length,
    aberta: tasks.filter((t) => t.status === "aberta").length,
    em_andamento: tasks.filter((t) => t.status === "em_andamento").length,
    aguardando: tasks.filter((t) => t.status === "aguardando").length,
    concluida: tasks.filter((t) => t.status === "concluida").length,
  };

  const activeFilters = (search.trim() ? 1 : 0) + (priorityFilter !== "todas" ? 1 : 0) + (assigneeFilter !== "todos" ? 1 : 0);
  const clearFilters = () => { setSearch(""); setPriorityFilter("todas"); setAssigneeFilter("todos"); };

  // ── Drag & Drop ──
  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const newStatus = result.destination.droppableId as TaskStatus;
    const taskId = result.draggableId;
    const task = tasks.find((t) => t.id === taskId);
    if (task && task.status !== newStatus) {
      updateStatus.mutate({ id: taskId, status: newStatus });
    }
  };

  // ── CSV Export ──
  const exportCSV = () => {
    const BOM = "\uFEFF";
    const headers = ["Título", "Status", "Prioridade", "Processo", "Reclamante", "Responsáveis", "Prazo"];
    const rows = filtered.map((t) => [
      `"${t.title.replace(/"/g, '""')}"`,
      taskStatusLabels[t.status],
      priorityLabels[t.priority],
      t.cases?.case_number ?? "",
      t.cases?.employee_name ?? "",
      `"${(t.assignees ?? []).join(", ")}"`,
      t.due_at ? new Date(t.due_at).toLocaleString("pt-BR") : "",
    ]);
    const csv = BOM + [headers, ...rows].map((r) => r.join(";")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tarefas_${format(new Date(), "yyyyMMdd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: `CSV exportado com ${filtered.length} tarefa(s)` });
  };

  if (isLoading) {
    return (
      <div className="p-4 md:p-6 lg:p-8 space-y-5 animate-in fade-in duration-500">
        {[1, 2, 3, 4].map((i) => <div key={i} className="h-20 rounded-xl bg-muted/50 animate-pulse" />)}
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight sm:text-2xl">Tarefas</h1>
          <p className="text-sm text-muted-foreground font-medium">
            <span className="text-foreground font-semibold">{filtered.length}</span> tarefa(s)
            {activeFilters > 0 && <span className="text-primary"> · {activeFilters} filtro(s)</span>}
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
                      viewMode === mode ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                    )}
                  >{icon}</button>
                </TooltipTrigger>
                <TooltipContent><p className="text-xs">{label}</p></TooltipContent>
              </Tooltip>
            ))}
          </div>
          <Button variant="outline" size="sm" className="gap-2 h-9 text-xs" onClick={exportCSV} disabled={filtered.length === 0}>
            <Download className="h-3.5 w-3.5" /> CSV
          </Button>
          <Button className="gap-2 rounded-xl shadow-glow-primary transition-all hover:shadow-lg" size="sm" asChild style={{ background: "var(--gradient-primary)" }}>
            <Link to="/tarefas/nova"><Plus className="h-4 w-4" /> Nova Tarefa</Link>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase font-medium tracking-wider">Em aberto</p>
              <p className="text-xl font-bold">{totalOpen}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase font-medium tracking-wider">Atrasadas</p>
              <p className="text-xl font-bold text-destructive">{overdue}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-warning/10 flex items-center justify-center shrink-0">
              <Flame className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase font-medium tracking-wider">Críticas</p>
              <p className="text-xl font-bold text-warning">{criticalOpen}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-success/10 flex items-center justify-center shrink-0">
              <TrendingUp className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase font-medium tracking-wider">Concluídas (7d)</p>
              <p className="text-xl font-bold text-success">{completedThisWeek}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search + Filters */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar por título, processo, reclamante..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9 text-sm" />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <div className="flex gap-2">
          <Select value={priorityFilter} onValueChange={(v) => handleFilterChange(() => setPriorityFilter(v))}>
            <SelectTrigger className="h-9 w-[140px] text-xs"><SelectValue placeholder="Prioridade" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas prioridades</SelectItem>
              {(Object.entries(priorityLabels) as [Priority, string][]).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={assigneeFilter} onValueChange={(v) => handleFilterChange(() => setAssigneeFilter(v))}>
            <SelectTrigger className="h-9 w-[150px] text-xs"><SelectValue placeholder="Responsável" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos responsáveis</SelectItem>
              {allAssignees.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
            </SelectContent>
          </Select>
          {activeFilters > 0 && (
            <Button variant="ghost" size="sm" className="h-9 text-xs text-muted-foreground" onClick={clearFilters}>Limpar</Button>
          )}
        </div>
      </div>

      {/* Status tabs */}
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
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-thin">
              {(["aberta", "em_andamento", "aguardando", "concluida"] as TaskStatus[]).map((status) => {
                const columnTasks = filtered.filter((t) => t.status === status);
                return (
                  <div key={status} className="flex flex-col min-w-[270px] max-w-[320px] flex-1">
                    <div className={cn("flex items-center gap-2 rounded-t-xl px-3 py-2 border border-b-0", taskStatusColors[status])}>
                      {statusIcons[status]}
                      <span className="text-xs font-bold">{taskStatusLabels[status]}</span>
                      <Badge variant="secondary" className="text-[9px] ml-auto h-5 min-w-5 justify-center">{columnTasks.length}</Badge>
                    </div>
                    <Droppable droppableId={status}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={cn(
                            "flex flex-col gap-2 rounded-b-xl border border-t-0 p-2 min-h-[120px] transition-colors",
                            snapshot.isDraggingOver ? "bg-primary/5" : "bg-muted/30"
                          )}
                        >
                          {columnTasks.length === 0 && !snapshot.isDraggingOver && (
                            <p className="text-[10px] text-muted-foreground/50 text-center py-6">Arraste tarefas aqui</p>
                          )}
                          {columnTasks.map((t, i) => {
                            const isOverdue = t.status !== "concluida" && t.due_at && new Date(t.due_at) < now;
                            return (
                              <Draggable key={t.id} draggableId={t.id} index={i}>
                                {(prov, snap) => (
                                  <div
                                    ref={prov.innerRef}
                                    {...prov.draggableProps}
                                    {...prov.dragHandleProps}
                                    className={cn(
                                      "rounded-lg border bg-card p-3 shadow-sm transition-all hover:shadow-md cursor-grab active:cursor-grabbing",
                                      snap.isDragging && "shadow-lg ring-2 ring-primary/30 rotate-1"
                                    )}
                                  >
                                    <div className="flex items-center gap-1.5 mb-1">
                                      <div className={cn("h-2 w-2 shrink-0 rounded-full", priorityDot[t.priority])} />
                                      <span className={cn("text-xs font-bold truncate", t.status === "concluida" && "line-through opacity-60")}>{t.title}</span>
                                    </div>
                                    {t.cases?.case_number && (
                                      <Link to={`/processos/${t.case_id}`} className="text-[10px] text-primary font-medium truncate block mb-1 hover:underline">
                                        {t.cases.case_number} · {t.cases.employee_name}
                                      </Link>
                                    )}
                                    <Badge variant="outline" className={cn("text-[9px] font-semibold", priorityColors[t.priority])}>
                                      {priorityLabels[t.priority]}
                                    </Badge>
                                    <div className="mt-2 flex items-center justify-between">
                                      <span className={cn("text-[9px] font-medium", isOverdue ? "text-destructive" : "text-muted-foreground")}>
                                        {isOverdue && "⚠ "}
                                        {t.due_at ? new Date(t.due_at).toLocaleDateString("pt-BR") : "Sem prazo"}
                                      </span>
                                      <span className="text-[9px] text-muted-foreground truncate max-w-[100px]">{(t.assignees ?? []).join(", ")}</span>
                                    </div>
                                  </div>
                                )}
                              </Draggable>
                            );
                          })}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </div>
                );
              })}
            </div>
          </DragDropContext>
        ) : (
          <div className="space-y-2">
            {paginated.map((t, index) => {
              const isOverdue = t.status !== "concluida" && t.due_at && new Date(t.due_at) < now;
              return (
                <div
                  key={t.id}
                  className={cn(
                    "group flex items-start gap-3 rounded-xl border bg-card p-3.5 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 sm:p-4 animate-in fade-in slide-in-from-bottom-2 duration-300",
                    t.status === "concluida" && "opacity-60"
                  )}
                  style={{ animationDelay: `${index * 40}ms` }}
                >
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="mt-0.5 shrink-0 cursor-help">{statusIcons[t.status]}</div>
                    </TooltipTrigger>
                    <TooltipContent><p className="text-xs">{taskStatusLabels[t.status]}</p></TooltipContent>
                  </Tooltip>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start gap-2">
                      <div className={cn("mt-2 h-2 w-2 shrink-0 rounded-full", priorityDot[t.priority])} />
                      <p className={cn("text-sm font-semibold leading-snug", t.status === "concluida" && "line-through")}>{t.title}</p>
                    </div>
                    {t.cases?.case_number && (
                      <Link to={`/processos/${t.case_id}`} className="mt-1 truncate text-xs text-primary hover:underline block font-medium ml-4">
                        {t.cases.case_number} · {t.cases.employee_name}
                      </Link>
                    )}
                    <div className="mt-2 ml-4 flex flex-wrap items-center gap-1.5">
                      <Badge variant="outline" className={cn("text-[10px] font-semibold", priorityColors[t.priority])}>
                        {priorityLabels[t.priority]}
                      </Badge>
                      <span className={cn("text-[11px] font-medium", isOverdue ? "text-destructive" : "text-muted-foreground")}>
                        {isOverdue && "⚠ "}
                        {t.due_at ? `${new Date(t.due_at).toLocaleDateString("pt-BR")} ${new Date(t.due_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}` : "Sem prazo"}
                      </span>
                    </div>
                    <p className="mt-1 ml-4 text-[11px] text-muted-foreground font-medium">{(t.assignees ?? []).join(", ")}</p>
                  </div>

                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <Select
                      value={t.status}
                      onValueChange={(v) => updateStatus.mutate({ id: t.id, status: v as TaskStatus })}
                    >
                      <SelectTrigger className="h-7 w-[120px] text-[10px] rounded-lg"><SelectValue /></SelectTrigger>
                      <SelectContent>
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
                          onClick={() => deleteTask.mutate(t.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent><p className="text-xs">Excluir tarefa</p></TooltipContent>
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
              <Button variant="outline" size="sm" className="mt-3 text-xs" onClick={clearFilters}>Limpar filtros</Button>
            )}
          </div>
        )}

        {/* Pagination */}
        {viewMode !== "kanban" && filtered.length > 0 && (
          <div className="mt-5 flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Exibir</span>
              <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(Number(v)); setPage(1); }}>
                <SelectTrigger className="h-8 w-[70px] text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[10, 20, 50].map((n) => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}
                </SelectContent>
              </Select>
              <span>por página · <strong className="text-foreground">{filtered.length}</strong> total</span>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
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
                    <span key={`e-${i}`} className="px-1 text-xs text-muted-foreground">…</span>
                  ) : (
                    <Button key={p} variant={page === p ? "default" : "outline"} size="icon" className="h-8 w-8 text-xs" onClick={() => setPage(p as number)}>
                      {p}
                    </Button>
                  )
                )}
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
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
