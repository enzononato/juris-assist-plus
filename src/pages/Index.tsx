import { Link, useNavigate } from "react-router-dom";
import {
  Scale, ClipboardList, CalendarDays, Clock, AlertTriangle,
  ChevronRight, TrendingUp, Bell, Sparkles, Plus,
  ArrowUpRight, ArrowDownRight, Minus, FileText, Gavel,
  BarChart3, Activity, Briefcase, Target,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar,
  XAxis, YAxis, Tooltip as RechartsTooltip, CartesianGrid,
  AreaChart, Area,
} from "recharts";

type CaseStatus = "novo" | "em_andamento" | "audiencia_marcada" | "sentenca" | "recurso" | "encerrado";
type Priority = "baixa" | "media" | "alta" | "critica";
type TaskStatus = "aberta" | "em_andamento" | "aguardando" | "concluida";

const statusLabels: Record<CaseStatus, string> = {
  novo: "Novo", em_andamento: "Em Andamento", audiencia_marcada: "Audiência Marcada",
  sentenca: "Sentença", recurso: "Recurso", encerrado: "Encerrado",
};

const priorityLabels: Record<Priority, string> = {
  baixa: "Baixa", media: "Média", alta: "Alta", critica: "Crítica",
};

const taskStatusLabels: Record<TaskStatus, string> = {
  aberta: "Aberta", em_andamento: "Em Andamento", aguardando: "Aguardando", concluida: "Concluída",
};

const statusColors: Record<CaseStatus, string> = {
  novo: "bg-info/15 text-info",
  em_andamento: "bg-primary/10 text-primary",
  audiencia_marcada: "bg-warning/15 text-warning",
  sentenca: "bg-success/15 text-success",
  recurso: "bg-destructive/10 text-destructive",
  encerrado: "bg-muted text-muted-foreground",
};

const pieColors = [
  "hsl(210, 80%, 52%)", "hsl(230, 72%, 52%)", "hsl(38, 92%, 50%)",
  "hsl(152, 60%, 40%)", "hsl(0, 72%, 51%)", "hsl(220, 10%, 70%)",
];

const priorityColors: Record<Priority, string> = {
  baixa: "text-muted-foreground",
  media: "text-info",
  alta: "text-warning",
  critica: "text-destructive",
};

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // ── Supabase Queries ──
  const { data: cases = [] } = useQuery({
    queryKey: ["dashboard-cases"],
    queryFn: async () => {
      const { data, error } = await supabase.from("cases").select("*, companies(name)").order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ["dashboard-tasks"],
    queryFn: async () => {
      const { data, error } = await supabase.from("tasks").select("*, cases(case_number, employee_name)").order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: alerts = [] } = useQuery({
    queryKey: ["dashboard-alerts"],
    queryFn: async () => {
      const { data, error } = await supabase.from("alerts").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: deadlines = [] } = useQuery({
    queryKey: ["dashboard-deadlines"],
    queryFn: async () => {
      const { data, error } = await supabase.from("deadlines").select("*, cases(case_number, employee_name)").order("due_at");
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: hearings = [] } = useQuery({
    queryKey: ["dashboard-hearings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("hearings").select("*, cases(case_number, employee_name, status)").order("date");
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: companies = [] } = useQuery({
    queryKey: ["dashboard-companies"],
    queryFn: async () => {
      const { data, error } = await supabase.from("companies").select("id, name").order("name");
      if (error) throw error;
      return data ?? [];
    },
  });

  const totalCases = cases.length;
  const activeCases = cases.filter((c: any) => c.status !== "encerrado").length;
  const pendingTasks = tasks.filter((t: any) => t.status !== "concluida").length;
  const overdueTasks = tasks.filter((t: any) => {
    if (t.status === "concluida") return false;
    return t.due_at && new Date(t.due_at) < new Date();
  }).length;
  const urgentDeadlines = deadlines.filter((d: any) => {
    if (d.status !== "pendente") return false;
    const days = Math.ceil((new Date(d.due_at).getTime() - Date.now()) / 86400000);
    return days <= 7;
  });
  const nextHearing = hearings
    .filter((h: any) => {
      if (h.status !== "agendada") return false;
      if (h.cases?.status === "encerrado") return false;
      return new Date(`${h.date}T${h.time || "00:00"}`) > new Date();
    })
    .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())[0] as any;
  const daysToNextHearing = nextHearing
    ? Math.ceil((new Date(`${nextHearing.date}T${nextHearing.time || "00:00"}`).getTime() - Date.now()) / 86400000)
    : null;
  const untreatedAlerts = alerts.filter((a: any) => !a.treated);
  const upcomingHearings = hearings
    .filter((h: any) => {
      if (h.status !== "agendada") return false;
      return h.cases?.status !== "encerrado";
    })
    .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 4) as any[];
  const urgentTasks = tasks
    .filter((t: any) => t.status !== "concluida")
    .sort((a: any, b: any) => new Date(a.due_at || 0).getTime() - new Date(b.due_at || 0).getTime())
    .slice(0, 5) as any[];

  // Chart data
  const statusDistribution = (Object.keys(statusLabels) as CaseStatus[])
    .map((key) => ({
      name: statusLabels[key],
      value: cases.filter((c: any) => c.status === key).length,
    }))
    .filter((d) => d.value > 0);

  const companyDistribution = companies
    .map((co: any) => ({
      name: co.name.replace("Revalle ", ""),
      value: cases.filter((c: any) => c.company_id === co.id).length,
    }))
    .filter((d) => d.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  const monthlyTrend = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    return {
      month: d.toLocaleDateString("pt-BR", { month: "short" }).replace(".", ""),
      processos: Math.max(0, cases.filter((c: any) => {
        const filed = new Date(c.filed_at || c.created_at);
        return filed.getMonth() === d.getMonth() && filed.getFullYear() === d.getFullYear();
      }).length),
    };
  });

  const hasData = totalCases > 0 || tasks.length > 0;
  const greeting = getGreeting();

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Welcome Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground font-medium">{greeting}</p>
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl mt-0.5">
            <span className="text-gradient-primary">{user?.name?.split(" ")[0]}</span>
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <div className="hidden sm:flex gap-2">
          <Button size="sm" variant="outline" className="gap-1.5 rounded-xl text-xs h-9" onClick={() => navigate("/processos/novo")}>
            <Plus className="h-3.5 w-3.5" /> Novo Processo
          </Button>
          <Button size="sm" className="gap-1.5 rounded-xl text-xs h-9" style={{ background: "var(--gradient-primary)" }} onClick={() => navigate("/tarefas/nova")}>
            <Plus className="h-3.5 w-3.5" /> Nova Tarefa
          </Button>
        </div>
      </div>

      {/* Next hearing banner */}
      {nextHearing && daysToNextHearing !== null && daysToNextHearing <= 7 && (
        <Link
          to={`/processos/${nextHearing.case_id}`}
          className="flex items-center gap-3 rounded-xl border border-warning/30 bg-warning/5 px-4 py-3 animate-in fade-in slide-in-from-top-2 duration-500 hover:bg-warning/10 transition-colors"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-warning/15">
            <Sparkles className="h-4 w-4 text-warning" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-warning">
              {daysToNextHearing === 0 ? "Audiência hoje!" : daysToNextHearing === 1 ? "Audiência amanhã!" : `Próxima audiência em ${daysToNextHearing} dias`}
            </p>
            <p className="truncate text-xs text-muted-foreground">{nextHearing.type} · {nextHearing.cases?.employee_name ?? "—"} · {nextHearing.time}</p>
          </div>
          <ChevronRight className="h-4 w-4 text-warning/60 shrink-0" />
        </Link>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        {[
          {
            icon: <Scale className="h-5 w-5" />,
            label: "Processos Ativos",
            value: activeCases,
            sub: totalCases > 0 ? `${totalCases} total` : undefined,
            gradient: "var(--gradient-primary)",
            trend: totalCases > 0 ? { pct: Math.round((activeCases / totalCases) * 100), label: "ativos" } : undefined,
            onClick: () => navigate("/processos"),
          },
          {
            icon: <ClipboardList className="h-5 w-5" />,
            label: "Tarefas Pendentes",
            value: pendingTasks,
            sub: overdueTasks > 0 ? `${overdueTasks} atrasada(s)` : undefined,
            gradient: "var(--gradient-warm)",
            trend: overdueTasks > 0 ? { pct: overdueTasks, label: "atrasadas", bad: true } : undefined,
            onClick: () => navigate("/tarefas"),
          },
          {
            icon: <Clock className="h-5 w-5" />,
            label: "Prazos Urgentes",
            value: urgentDeadlines.length,
            sub: "nos próximos 7 dias",
            gradient: "var(--gradient-danger)",
            trend: urgentDeadlines.length > 2 ? { pct: urgentDeadlines.length, label: "≤7 dias", bad: true } : undefined,
            onClick: () => navigate("/agenda"),
          },
          {
            icon: <Bell className="h-5 w-5" />,
            label: "Alertas",
            value: untreatedAlerts.length,
            sub: "não tratados",
            gradient: "var(--gradient-warm)",
            trend: untreatedAlerts.length > 0 ? { pct: untreatedAlerts.length, label: "pendentes", bad: true } : undefined,
            onClick: () => navigate("/alertas"),
          },
        ].map((card, i) => (
          <div
            key={card.label}
            className="group rounded-xl border bg-card p-4 sm:p-5 shadow-soft hover:shadow-card transition-all duration-300 hover:-translate-y-0.5 cursor-pointer animate-in fade-in slide-in-from-bottom-2 duration-500"
            style={{ animationDelay: `${i * 80}ms` }}
            onClick={card.onClick}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl text-primary-foreground shadow-sm" style={{ background: card.gradient }}>
                {card.icon}
              </div>
              {card.trend && (
                <div className={cn(
                  "flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                  card.trend.bad ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground"
                )}>
                  {card.trend.bad ? <ArrowUpRight className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
                  {card.trend.pct}{typeof card.trend.pct === "number" && card.trend.pct <= 100 ? "%" : ""}
                </div>
              )}
            </div>
            <p className="text-3xl font-extrabold tracking-tight">{card.value}</p>
            <p className="text-[11px] text-muted-foreground font-medium mt-0.5">{card.label}</p>
            {card.sub && <p className="text-[10px] text-muted-foreground/60 mt-0.5">{card.sub}</p>}
          </div>
        ))}
      </div>

      {/* Quick Actions (mobile) */}
      <div className="flex gap-2 overflow-x-auto sm:hidden scrollbar-hide">
        <QuickAction icon={<Plus className="h-4 w-4" />} label="Processo" to="/processos/novo" />
        <QuickAction icon={<ClipboardList className="h-4 w-4" />} label="Tarefa" to="/tarefas/nova" />
        <QuickAction icon={<CalendarDays className="h-4 w-4" />} label="Agenda" to="/agenda" />
        <QuickAction icon={<BarChart3 className="h-4 w-4" />} label="Relatórios" to="/relatorios" />
      </div>

      {/* Charts Row */}
      {hasData && (
        <div className="grid gap-4 lg:grid-cols-3 animate-in fade-in slide-in-from-bottom-4 duration-600 delay-200">
          {statusDistribution.length > 0 && (
            <div className="rounded-xl border bg-card p-5 shadow-soft">
              <h3 className="text-sm font-bold flex items-center gap-2 mb-4">
                <Target className="h-4 w-4 text-primary" /> Processos por Status
              </h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={statusDistribution} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3} dataKey="value" strokeWidth={0}>
                      {statusDistribution.map((_, idx) => (
                        <Cell key={idx} fill={pieColors[idx % pieColors.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip contentStyle={{ borderRadius: 12, fontSize: 12, border: "1px solid hsl(220, 16%, 90%)" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap gap-2 mt-2 justify-center">
                {statusDistribution.map((d, i) => (
                  <div key={d.name} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                    <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: pieColors[i % pieColors.length] }} />
                    {d.name} ({d.value})
                  </div>
                ))}
              </div>
            </div>
          )}

          {companyDistribution.length > 0 && (
            <div className="rounded-xl border bg-card p-5 shadow-soft">
              <h3 className="text-sm font-bold flex items-center gap-2 mb-4">
                <Briefcase className="h-4 w-4 text-warning" /> Processos por Filial
              </h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={companyDistribution} barSize={28}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 16%, 90%)" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="hsl(220, 10%, 46%)" />
                    <YAxis allowDecimals={false} tick={{ fontSize: 10 }} stroke="hsl(220, 10%, 46%)" />
                    <RechartsTooltip contentStyle={{ borderRadius: 12, fontSize: 12, border: "1px solid hsl(220, 16%, 90%)" }} />
                    <Bar dataKey="value" fill="hsl(230, 72%, 52%)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          <div className="rounded-xl border bg-card p-5 shadow-soft">
            <h3 className="text-sm font-bold flex items-center gap-2 mb-4">
              <Activity className="h-4 w-4 text-success" /> Evolução Mensal
            </h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyTrend}>
                  <defs>
                    <linearGradient id="colorProcessos" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(230, 72%, 52%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(230, 72%, 52%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 16%, 90%)" />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} stroke="hsl(220, 10%, 46%)" />
                  <YAxis allowDecimals={false} tick={{ fontSize: 10 }} stroke="hsl(220, 10%, 46%)" />
                  <RechartsTooltip contentStyle={{ borderRadius: 12, fontSize: 12, border: "1px solid hsl(220, 16%, 90%)" }} />
                  <Area type="monotone" dataKey="processos" stroke="hsl(230, 72%, 52%)" fill="url(#colorProcessos)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Lists Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Alerts */}
        {untreatedAlerts.length > 0 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <SectionHeader icon={<AlertTriangle className="h-4 w-4 text-destructive" />} title="Alertas Não Tratados" linkTo="/alertas" linkLabel="Ver todos" />
            <div className="space-y-2">
              {untreatedAlerts.slice(0, 3).map((a: any) => (
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
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
          <SectionHeader icon={<CalendarDays className="h-4 w-4 text-primary" />} title="Próximas Audiências" linkTo="/agenda" linkLabel="Agenda" />
          {upcomingHearings.length > 0 ? (
            <div className="space-y-2">
              {upcomingHearings.map((h: any) => (
                <Link
                  key={h.id}
                  to={`/processos/${h.case_id}`}
                  className="flex items-center gap-3 rounded-xl border bg-card p-3.5 shadow-soft transition-all hover:shadow-card hover:-translate-y-0.5 duration-200"
                >
                  <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-xl" style={{ background: "var(--gradient-cool)" }}>
                    <span className="text-xs font-bold text-primary-foreground">{new Date(h.date).getDate()}</span>
                    <span className="text-[8px] font-semibold text-primary-foreground/80 uppercase">
                      {new Date(h.date).toLocaleDateString("pt-BR", { month: "short" }).replace(".", "")}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">{h.type}</p>
                    <p className="truncate text-xs text-muted-foreground font-medium">{h.cases?.employee_name ?? "—"} · {h.time}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground/40" />
                </Link>
              ))}
            </div>
          ) : (
            <EmptyCard icon={<CalendarDays className="h-6 w-6" />} text="Nenhuma audiência agendada" action={{ label: "Agendar", to: "/processos" }} />
          )}
        </div>

        {/* Urgent Tasks */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
          <SectionHeader icon={<ClipboardList className="h-4 w-4 text-warning" />} title="Tarefas Prioritárias" linkTo="/tarefas" linkLabel="Ver todas" />
          {urgentTasks.length > 0 ? (
            <div className="space-y-2">
              {urgentTasks.map((t: any) => {
                const isOverdue = t.due_at && new Date(t.due_at) < new Date();
                return (
                  <div key={t.id} className="flex items-start gap-3 rounded-xl border bg-card p-3.5 shadow-soft transition-all hover:shadow-card duration-200">
                    <div className={cn("mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ring-2 ring-offset-2 ring-offset-card", priorityColors[t.priority as Priority].replace("text-", "bg-"), priorityColors[t.priority as Priority].replace("text-", "ring-") + "/20")} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold leading-snug">{t.title}</p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                        <Badge variant="outline" className="text-[10px] font-semibold">{taskStatusLabels[t.status as TaskStatus]}</Badge>
                        <span className={cn("text-[10px] font-semibold", priorityColors[t.priority as Priority])}>
                          {priorityLabels[t.priority as Priority]}
                        </span>
                        {t.due_at && (
                          <span className={cn("text-[10px] font-medium", isOverdue ? "text-destructive" : "text-muted-foreground")}>
                            {isOverdue && "⚠ "}{new Date(t.due_at).toLocaleDateString("pt-BR")}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyCard icon={<ClipboardList className="h-6 w-6" />} text="Nenhuma tarefa pendente" action={{ label: "Criar tarefa", to: "/tarefas/nova" }} />
          )}
        </div>

        {/* Process Status Overview */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
          <SectionHeader icon={<TrendingUp className="h-4 w-4 text-success" />} title="Resumo de Status" linkTo="/processos" linkLabel="Ver processos" />
          {totalCases > 0 ? (
            <div className="rounded-xl border bg-card p-5 shadow-soft">
              <div className="space-y-3.5">
                {(Object.entries(statusLabels) as [CaseStatus, string][]).map(([key, label]) => {
                  const count = cases.filter((c: any) => c.status === key).length;
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
          ) : (
            <EmptyCard icon={<Scale className="h-6 w-6" />} text="Nenhum processo cadastrado" action={{ label: "Cadastrar processo", to: "/processos/novo" }} />
          )}
        </div>
      </div>
    </div>
  );
}

// === Sub-components ===

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia 👋";
  if (h < 18) return "Boa tarde 👋";
  return "Boa noite 👋";
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

function EmptyCard({ icon, text, action }: { icon: React.ReactNode; text: string; action?: { label: string; to: string } }) {
  return (
    <div className="rounded-xl border border-dashed bg-card/50 p-8 text-center">
      <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-muted/60 text-muted-foreground/40">
        {icon}
      </div>
      <p className="text-xs text-muted-foreground font-medium">{text}</p>
      {action && (
        <Button size="sm" variant="outline" className="mt-3 text-xs rounded-lg gap-1" asChild>
          <Link to={action.to}><Plus className="h-3 w-3" />{action.label}</Link>
        </Button>
      )}
    </div>
  );
}

function QuickAction({ icon, label, to }: { icon: React.ReactNode; label: string; to: string }) {
  return (
    <Link
      to={to}
      className="flex shrink-0 flex-col items-center gap-1.5 rounded-xl border bg-card px-4 py-3 text-center shadow-soft transition-all hover:shadow-card active:scale-95"
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
      <span className="text-[10px] font-semibold text-muted-foreground">{label}</span>
    </Link>
  );
}
