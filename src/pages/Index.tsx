import { Link } from "react-router-dom";
import {
  Scale, ClipboardList, CalendarDays, Clock, AlertTriangle,
  ChevronRight, Shield, TrendingUp, Users, Bell,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  statusLabels, priorityLabels, taskStatusLabels,
  type CaseStatus, type Priority,
} from "@/data/mock";
import { useTenantData } from "@/hooks/useTenantData";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

const statusColors: Record<CaseStatus, string> = {
  novo: "bg-info/15 text-info",
  em_andamento: "bg-primary/10 text-primary",
  audiencia_marcada: "bg-warning/15 text-warning",
  sentenca: "bg-success/15 text-success",
  recurso: "bg-destructive/10 text-destructive",
  encerrado: "bg-muted text-muted-foreground",
};

const priorityColors: Record<Priority, string> = {
  baixa: "text-muted-foreground",
  media: "text-info",
  alta: "text-warning",
  critica: "text-destructive",
};

export default function Dashboard() {
  const { user } = useAuth();
  const { cases, tasks, alerts, deadlines, hearings } = useTenantData();

  const totalCases = cases.length;
  const activeCases = cases.filter((c) => c.status !== "encerrado").length;
  const pendingTasks = tasks.filter((t) => t.status !== "concluida").length;
  const urgentDeadlines = deadlines.filter((d) => {
    if (d.status !== "pendente") return false;
    const days = Math.ceil((new Date(d.due_at).getTime() - Date.now()) / 86400000);
    return days <= 7;
  });
  const untreatedAlerts = alerts.filter((a) => !a.treated);
  const upcomingHearings = hearings
    .filter((h) => h.status === "agendada")
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);
  const urgentTasks = tasks
    .filter((t) => t.status !== "concluida")
    .sort((a, b) => new Date(a.due_at).getTime() - new Date(b.due_at).getTime())
    .slice(0, 5);

  return (
    <div className="p-4 md:p-6 lg:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6">
        <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Olá, {user?.name?.split(" ")[0]}</h1>
        <p className="text-sm text-muted-foreground">Visão geral do sistema jurídico trabalhista</p>
      </div>

      {/* Metric Cards */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MetricCard
          icon={<Scale className="h-5 w-5" />}
          label="Processos Ativos"
          value={activeCases}
          total={totalCases}
          color="text-primary"
          bgColor="bg-primary/10"
        />
        <MetricCard
          icon={<ClipboardList className="h-5 w-5" />}
          label="Tarefas Pendentes"
          value={pendingTasks}
          total={tasks.length}
          color="text-warning"
          bgColor="bg-warning/10"
        />
        <MetricCard
          icon={<Clock className="h-5 w-5" />}
          label="Prazos Urgentes"
          value={urgentDeadlines.length}
          color="text-destructive"
          bgColor="bg-destructive/10"
        />
        <MetricCard
          icon={<Bell className="h-5 w-5" />}
          label="Alertas Ativos"
          value={untreatedAlerts.length}
          color="text-warning"
          bgColor="bg-warning/10"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Urgent Alerts */}
        {untreatedAlerts.length > 0 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                Alertas Não Tratados
              </h2>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/alertas" className="text-xs">Ver todos <ChevronRight className="ml-1 h-3 w-3" /></Link>
              </Button>
            </div>
            <div className="space-y-2">
              {untreatedAlerts.slice(0, 3).map((a) => (
                <div
                  key={a.id}
                  className={cn(
                    "rounded-lg border-l-4 p-3",
                    a.severity === "urgente" ? "border-l-destructive bg-destructive/5" : "border-l-warning bg-warning/5"
                  )}
                >
                  <p className="text-sm font-medium">{a.title}</p>
                  <p className="text-xs text-muted-foreground">{a.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upcoming Hearings */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-primary" />
              Próximas Audiências
            </h2>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/agenda" className="text-xs">Agenda <ChevronRight className="ml-1 h-3 w-3" /></Link>
            </Button>
          </div>
          <div className="space-y-2">
            {upcomingHearings.map((h) => (
              <Link
                key={h.id}
                to={`/processos/${h.case_id}`}
                className="flex items-center gap-3 rounded-xl border bg-card p-3 transition-all hover:shadow-md"
              >
                <div className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-lg bg-primary/10">
                  <span className="text-xs font-bold text-primary">
                    {new Date(h.date).getDate()}
                  </span>
                  <span className="text-[9px] text-primary/70">
                    {new Date(h.date).toLocaleDateString("pt-BR", { month: "short" }).replace(".", "")}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{h.type}</p>
                  <p className="truncate text-xs text-muted-foreground">{h.employee} · {h.time}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            ))}
          </div>
        </div>

        {/* Urgent Tasks */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-warning" />
              Tarefas Prioritárias
            </h2>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/tarefas" className="text-xs">Ver todas <ChevronRight className="ml-1 h-3 w-3" /></Link>
            </Button>
          </div>
          <div className="space-y-2">
            {urgentTasks.map((t) => (
              <div key={t.id} className="flex items-start gap-3 rounded-xl border bg-card p-3">
                <div className={cn("mt-0.5 h-2 w-2 shrink-0 rounded-full", priorityColors[t.priority].replace("text-", "bg-"))} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium leading-snug">{t.title}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5">
                    <Badge variant="outline" className="text-[10px]">{taskStatusLabels[t.status]}</Badge>
                    <span className={cn("text-[10px] font-medium", priorityColors[t.priority])}>
                      {priorityLabels[t.priority]}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      · {new Date(t.due_at).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Process Status Overview */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-[400ms]">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-success" />
              Processos por Status
            </h2>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/processos" className="text-xs">Ver processos <ChevronRight className="ml-1 h-3 w-3" /></Link>
            </Button>
          </div>
          <div className="rounded-xl border bg-card p-4">
            <div className="space-y-3">
              {(Object.entries(statusLabels) as [CaseStatus, string][]).map(([key, label]) => {
                const count = cases.filter((c) => c.status === key).length;
                if (count === 0) return null;
                const percent = Math.round((count / totalCases) * 100);
                return (
                  <div key={key}>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="font-medium">{label}</span>
                      <span className="text-muted-foreground">{count} ({percent}%)</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className={cn("h-full rounded-full transition-all", statusColors[key])}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  icon, label, value, total, color, bgColor,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  total?: number;
  color: string;
  bgColor: string;
}) {
  return (
    <div className="rounded-xl border bg-card p-3 sm:p-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className={cn("mb-2 flex h-9 w-9 items-center justify-center rounded-lg", bgColor, color)}>
        {icon}
      </div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-[11px] text-muted-foreground">
        {label}
        {total !== undefined && <span className="text-muted-foreground/60"> / {total}</span>}
      </p>
    </div>
  );
}
