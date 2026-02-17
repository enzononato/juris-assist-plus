import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, CheckCircle2, Circle, Clock, AlertTriangle, ListChecks, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { taskStatusLabels, priorityLabels, type Priority, type TaskStatus } from "@/data/mock";
import { useTenantData } from "@/hooks/useTenantData";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

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

export default function Tarefas() {
  const [tab, setTab] = useState("todas");
  const { tasks } = useTenantData();

  const filtered = tab === "todas"
    ? tasks
    : tasks.filter((t) => t.status === tab);

  const handleStatusChange = (taskId: string, newStatus: string) => {
    toast({ title: `Status alterado para ${taskStatusLabels[newStatus as TaskStatus]} (Demo)` });
  };

  const handleDelete = (taskId: string) => {
    toast({ title: "Tarefa excluída (Demo)" });
  };

  const counts = {
    todas: tasks.length,
    aberta: tasks.filter(t => t.status === "aberta").length,
    em_andamento: tasks.filter(t => t.status === "em_andamento").length,
    aguardando: tasks.filter(t => t.status === "aguardando").length,
    concluida: tasks.filter(t => t.status === "concluida").length,
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight sm:text-2xl">Tarefas</h1>
          <p className="text-sm text-muted-foreground font-medium">
            <span className="text-foreground font-semibold">{filtered.length}</span> tarefa(s)
          </p>
        </div>
        <Button className="gap-2 rounded-xl shadow-glow-primary transition-all hover:shadow-lg hover:scale-[1.01] active:scale-[0.99]" size="sm" asChild style={{ background: "var(--gradient-primary)" }}>
          <Link to="/tarefas/nova"><Plus className="h-4 w-4" /> Nova Tarefa</Link>
        </Button>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
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
        <div className="space-y-2">
          {filtered.map((t, index) => {
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
          {filtered.length === 0 && (
            <div className="rounded-xl border border-dashed p-12 text-center animate-in fade-in duration-300">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/60">
                <ListChecks className="h-7 w-7 text-muted-foreground/50" />
              </div>
              <p className="text-sm font-semibold text-muted-foreground">Nenhuma tarefa encontrada</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Crie uma nova tarefa para começar</p>
            </div>
          )}
        </div>
      </TooltipProvider>
    </div>
  );
}
