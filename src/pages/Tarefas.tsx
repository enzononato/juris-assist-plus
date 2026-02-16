import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, CheckCircle2, Circle, Clock, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockTasks, taskStatusLabels, priorityLabels, type Priority, type TaskStatus } from "@/data/mock";
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

  const filtered = tab === "todas"
    ? mockTasks
    : mockTasks.filter((t) => t.status === tab);

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tarefas</h1>
          <p className="text-sm text-muted-foreground">Minhas tarefas e do time</p>
        </div>
        <Button className="gap-2" size="sm" asChild>
          <Link to="/tarefas/nova"><Plus className="h-4 w-4" /> Nova Tarefa</Link>
        </Button>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="todas">Todas</TabsTrigger>
          <TabsTrigger value="aberta">Abertas</TabsTrigger>
          <TabsTrigger value="em_andamento">Em Andamento</TabsTrigger>
          <TabsTrigger value="aguardando">Aguardando</TabsTrigger>
          <TabsTrigger value="concluida">Concluídas</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="space-y-2">
        {filtered.map((t) => (
          <div
            key={t.id}
            className="flex items-start gap-3 rounded-lg border bg-card p-4 transition-colors hover:bg-accent/30"
          >
            <div className="mt-0.5">{statusIcons[t.status]}</div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{t.title}</p>
              {t.case_number && (
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {t.case_number} · {t.employee}
                </p>
              )}
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Badge variant="outline" className={cn("text-[10px]", priorityColors[t.priority])}>
                  {priorityLabels[t.priority]}
                </Badge>
                <span className="text-[11px] text-muted-foreground">
                  {new Date(t.due_at).toLocaleDateString("pt-BR")} {new Date(t.due_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">{t.assignees.join(", ")}</p>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">Nenhuma tarefa encontrada.</p>
        )}
      </div>
    </div>
  );
}
