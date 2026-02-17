import { Link } from "react-router-dom";
import {
  Scale, ClipboardList, CalendarDays, Clock, AlertTriangle,
  ChevronRight, Shield, TrendingUp, Users, Bell, Sparkles,
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
    <div className="p-4 md:p-6 lg:p-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
          Olá, <span className="text-gradient-primary">{user?.name?.split(" ")[0]}</span>
        </h1>
        <p className="mt-1 text-sm text-muted-foreground font-medium">Visão geral do sistema jurídico trabalhista</p>
      </div>

      {/* Metric Cards */}
      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:gap-4">
        <MetricCard
          icon={<Scale className="h-5 w-5" />}
          label="Processos Ativos"
          value={activeCases}
          total={totalCases}
          gradient="var(--gradient-primary)"
          delay={0}
        />
        <MetricCard
          icon={<ClipboardList className="h-5 w-5" />}
          label="Tarefas Pendentes"
          value={pendingTasks}
          total={tasks.length}
          gradient="var(--gradient-warm)"
          delay={1}
        />
        <MetricCard
          icon={<Clock className="h-5 w-5" />}
          label="Prazos Urgentes"
          value={urgentDeadlines.length}
          gradient="var(--gradient-danger)"
          delay={2}
        />
        <MetricCard
          icon={<Bell className="h-5 w-5" />}
          label="Alertas Ativos"
          value={untreatedAlerts.length}
          gradient="var(--gradient-warm)"
          delay={3}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Urgent Alerts */}
        {untreatedAlerts.length > 0 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
            <SectionHeader
              icon={<AlertTriangle className="h-4 w-4 text-destructive" />}
              title="Alertas Não Tratados"
              linkTo="/alertas"
              linkLabel="Ver todos"
            />
            <div className="space-y-2">
              {untreatedAlerts.slice(0, 3).map((a) => (
                <div
                  key={a.id}
                  className={cn(
                    "rounded-xl border-l-4 p-4 shadow-soft transition-all hover:shadow-card",
                    a.severity === "urgente" ? "border-l-destructive bg-destructive/5" : "border-l-warning bg-warning/5"
                  )}
                >
                  <p className="text-sm font-semibold">{a.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{a.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upcoming Hearings */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
          <SectionHeader
            icon={<CalendarDays className="h-4 w-4 text-primary" />}
            title="Próximas Audiências"
            linkTo="/agenda"
            linkLabel="Agenda"
          />
          <div className="space-y-2">
            {upcomingHearings.map((h) => (
              <Link
                key={h.id}
                to={`/processos/${h.case_id}`}
                className="flex items-center gap-3 rounded-xl border bg-card p-3.5 shadow-soft transition-all hover:shadow-card hover:-translate-y-0.5 duration-200"
              >
                <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-xl" style={{ background: "var(--gradient-cool)" }}>
                  <span className="text-xs font-bold text-primary-foreground">
                    {new Date(h.date).getDate()}
                  </span>
                  <span className="text-[8px] font-semibold text-primary-foreground/80 uppercase">
                    {new Date(h.date).toLocaleDateString("pt-BR", { month: "short" }).replace(".", "")}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{h.type}</p>
                  <p className="truncate text-xs text-muted-foreground font-medium">{h.employee} · {h.time}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground/40" />
              </Link>
            ))}
          </div>
        </div>

        {/* Urgent Tasks */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
          <SectionHeader
            icon={<ClipboardList className="h-4 w-4 text-warning" />}
            title="Tarefas Prioritárias"
            linkTo="/tarefas"
            linkLabel="Ver todas"
          />
          <div className="space-y-2">
            {urgentTasks.map((t) => (
              <div key={t.id} className="flex items-start gap-3 rounded-xl border bg-card p-3.5 shadow-soft transition-all hover:shadow-card duration-200">
                <div className={cn("mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ring-2 ring-offset-2 ring-offset-card", priorityColors[t.priority].replace("text-", "bg-"), priorityColors[t.priority].replace("text-", "ring-") + "/20")} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold leading-snug">{t.title}</p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                    <Badge variant="outline" className="text-[10px] font-semibold">{taskStatusLabels[t.status]}</Badge>
                    <span className={cn("text-[10px] font-semibold", priorityColors[t.priority])}>
                      {priorityLabels[t.priority]}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-medium">
                      · {new Date(t.due_at).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Process Status Overview */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-400">
          <SectionHeader
            icon={<TrendingUp className="h-4 w-4 text-success" />}
            title="Processos por Status"
            linkTo="/processos"
            linkLabel="Ver processos"
          />
          <div className="rounded-xl border bg-card p-5 shadow-soft">
            <div className="space-y-4">
              {(Object.entries(statusLabels) as [CaseStatus, string][]).map(([key, label]) => {
                const count = cases.filter((c) => c.status === key).length;
                if (count === 0) return null;
                const percent = Math.round((count / totalCases) * 100);
                return (
                  <div key={key}>
                    <div className="mb-1.5 flex items-center justify-between text-xs">
                      <span className="font-semibold">{label}</span>
                      <span className="text-muted-foreground font-medium">{count} ({percent}%)</span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-muted/60">
                      <div
                        className={cn("h-full rounded-full transition-all duration-700 ease-out", statusColors[key])}
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

function SectionHeader({ icon, title, linkTo, linkLabel }: { icon: React.ReactNode; title: string; linkTo: string; linkLabel: string }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 className="text-sm font-bold flex items-center gap-2">{icon}{title}</h2>
      <Button variant="ghost" size="sm" asChild className="text-xs font-semibold text-muted-foreground hover:text-primary">
        <Link to={linkTo}>{linkLabel} <ChevronRight className="ml-1 h-3 w-3" /></Link>
      </Button>
    </div>
  );
}

function MetricCard({
  icon, label, value, total, gradient, delay,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  total?: number;
  gradient: string;
  delay: number;
}) {
  return (
    <div
      className="rounded-xl border bg-card p-4 sm:p-5 shadow-soft hover:shadow-card transition-all duration-300 hover:-translate-y-0.5 animate-in fade-in slide-in-from-bottom-2 duration-500"
      style={{ animationDelay: `${delay * 80}ms` }}
    >
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl text-primary-foreground shadow-sm" style={{ background: gradient }}>
        {icon}
      </div>
      <p className="text-3xl font-extrabold tracking-tight">{value}</p>
      <p className="text-[11px] text-muted-foreground font-medium mt-0.5">
        {label}
        {total !== undefined && <span className="text-muted-foreground/50"> / {total}</span>}
      </p>
    </div>
  );
}
