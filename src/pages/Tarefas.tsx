import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, CheckCircle2, Circle, Clock, AlertTriangle, ListChecks, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Tarefas</h1>
          <p className="text-sm text-muted-foreground">{filtered.length} tarefa(s)</p>
        </div>
        <Button className="gap-2" size="sm" asChild>
          <Link to="/tarefas/nova"><Plus className="h-4 w-4" /> Nova Tarefa</Link>
        </Button>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <div className="mb-4 overflow-x-auto scrollbar-hide">
          <TabsList className="w-max">
            <TabsTrigger value="todas">Todas ({tasks.length})</TabsTrigger>
            <TabsTrigger value="aberta">Abertas ({tasks.filter(t => t.status === "aberta").length})</TabsTrigger>
            <TabsTrigger value="em_andamento">Em Andamento ({tasks.filter(t => t.status === "em_andamento").length})</TabsTrigger>
            <TabsTrigger value="aguardando">Aguardando ({tasks.filter(t => t.status === "aguardando").length})</TabsTrigger>
            <TabsTrigger value="concluida">Concluídas ({tasks.filter(t => t.status === "concluida").length})</TabsTrigger>
          </TabsList>
        </div>
      </Tabs>

      <div className="space-y-2">
        {filtered.map((t) => (
          <div
            key={t.id}
            className="flex items-start gap-3 rounded-xl border bg-card p-3 shadow-sm transition-all hover:shadow-md sm:p-4"
          >
            <div className="mt-0.5 shrink-0">{statusIcons[t.status]}</div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium leading-snug">{t.title}</p>
              {t.case_number && (
                <Link to={`/processos/${t.case_id}`} className="mt-0.5 truncate text-xs text-primary hover:underline block">
                  {t.case_number} · {t.employee}
                </Link>
              )}
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <Badge variant="outline" className={cn("text-[10px]", priorityColors[t.priority])}>
                  {priorityLabels[t.priority]}
                </Badge>
                <span className="text-[11px] text-muted-foreground">
                  {new Date(t.due_at).toLocaleDateString("pt-BR")} {new Date(t.due_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">{t.assignees.join(", ")}</p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <Select value={t.status} onValueChange={(v) => handleStatusChange(t.id, v)}>
                <SelectTrigger className="h-7 w-[120px] text-[10px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.entries(taskStatusLabels) as [TaskStatus, string][]).map(([k, v]) => (
                    <SelectItem key={k} value={k} className="text-xs">{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => handleDelete(t.id)}>
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="rounded-xl border border-dashed p-12 text-center">
            <ListChecks className="mx-auto mb-3 h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">Nenhuma tarefa encontrada.</p>
          </div>
        )}
      </div>
    </div>
  );
}
