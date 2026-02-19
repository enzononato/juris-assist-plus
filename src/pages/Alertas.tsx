import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Bell, CalendarDays, Clock, CheckCircle2, BellOff,
  AlarmClock, CheckCheck, BellRing, BellPlus, Smartphone,
  ChevronRight, ExternalLink, Circle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockCases, mockHearings, mockDeadlines, mockTasks } from "@/data/mock";
import { useAlerts } from "@/contexts/AlertsContext";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { format, differenceInDays, isPast, isToday, isTomorrow } from "date-fns";
import { ptBR } from "date-fns/locale";

// ── Helpers ──────────────────────────────────────────────────────────────────
type MVPAlert = {
  id: string;
  type: "prazo" | "audiencia" | "tarefa";
  title: string;
  subtitle: string;
  case_number?: string;
  case_id?: string;
  event_date: string;
  days_until: number;
  urgency: "urgente" | "atencao" | "info";
  treated: boolean;
  assignees?: string[];
};

function buildAlerts(currentUser: string | null): MVPAlert[] {
  const alerts: MVPAlert[] = [];
  const now = new Date();

  // Audiências: 30 / 7 / 1 dia antes
  mockHearings.forEach((h) => {
    const caso = mockCases.find((c) => c.id === h.case_id);
    const date = new Date(`${h.date}T${h.time}`);
    const days = differenceInDays(date, now);
    if (days < 0 || days > 30) return;
    if (h.status === "cancelada" || h.status === "realizada") return;
    const offsetMatches = days <= 1 || days <= 7 || days <= 30;
    if (!offsetMatches) return;

    alerts.push({
      id: `aud-${h.id}`,
      type: "audiencia",
      title: `${h.type} – ${h.employee}`,
      subtitle: `${h.court} · ${format(date, "dd/MM/yyyy 'às' HH:mm")}`,
      case_number: h.case_number,
      case_id: h.case_id,
      event_date: `${h.date}T${h.time}`,
      days_until: days,
      urgency: days <= 1 ? "urgente" : days <= 7 ? "atencao" : "info",
      treated: false,
      assignees: caso ? [caso.responsible] : [],
    });
  });

  // Prazos: 30 / 7 / 1 dia antes
  mockDeadlines.forEach((d) => {
    if (d.status === "cumprido") return;
    const date = new Date(d.due_at);
    const days = differenceInDays(date, now);
    if (days < 0 || days > 30) return;

    alerts.push({
      id: `pra-${d.id}`,
      type: "prazo",
      title: `${d.title} – ${d.employee}`,
      subtitle: `Vence em ${format(date, "dd/MM/yyyy")}`,
      case_number: d.case_number,
      case_id: d.case_id,
      event_date: d.due_at,
      days_until: days,
      urgency: days <= 1 ? "urgente" : days <= 7 ? "atencao" : "info",
      treated: false,
    });
  });

  // Tarefas: 1 dia antes e no vencimento
  mockTasks.forEach((t) => {
    if (t.status === "concluida") return;
    const date = new Date(t.due_at);
    const days = differenceInDays(date, now);
    if (days < 0 || days > 1) return;

    // Filtrar por usuário atual (minhas tarefas)
    if (currentUser && !t.assignees.includes(currentUser)) return;

    alerts.push({
      id: `tar-${t.id}`,
      type: "tarefa",
      title: t.title,
      subtitle: t.case_number
        ? `Processo ${t.case_number}`
        : "Sem processo vinculado",
      case_number: t.case_number,
      case_id: t.case_id,
      event_date: t.due_at,
      days_until: days,
      urgency: days <= 0 ? "urgente" : "atencao",
      treated: false,
      assignees: t.assignees,
    });
  });

  return alerts.sort((a, b) => a.days_until - b.days_until);
}

function daysLabel(days: number) {
  if (days <= 0) return "Hoje";
  if (days === 1) return "Amanhã";
  return `${days} dias`;
}

const urgencyColors = {
  urgente: "border-l-destructive bg-destructive/5",
  atencao: "border-l-warning bg-warning/5",
  info: "border-l-primary bg-primary/5",
};

const typeIcons = {
  audiencia: <CalendarDays className="h-4 w-4" />,
  prazo: <Clock className="h-4 w-4" />,
  tarefa: <CheckCircle2 className="h-4 w-4" />,
};

const typeColors = {
  audiencia: "text-primary bg-primary/10",
  prazo: "text-warning bg-warning/15",
  tarefa: "text-success bg-success/15",
};

const typeLabels = {
  audiencia: "Audiência",
  prazo: "Prazo",
  tarefa: "Tarefa",
};

// ── Alert Card ────────────────────────────────────────────────────────────────
function AlertCard({ alert, onTreat }: { alert: MVPAlert; onTreat: (id: string) => void }) {
  const caso = alert.case_id ? mockCases.find((c) => c.id === alert.case_id) : undefined;

  return (
    <div className={cn(
      "rounded-xl border-l-4 border bg-card p-4 transition-all hover:shadow-soft",
      alert.treated ? "opacity-50" : urgencyColors[alert.urgency]
    )}>
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg mt-0.5", typeColors[alert.type])}>
          {typeIcons[alert.type]}
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className={cn("text-sm font-semibold leading-tight", alert.treated && "line-through text-muted-foreground")}>
                {alert.title}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">{alert.subtitle}</p>
            </div>
            <div className="flex flex-col items-end gap-1 shrink-0">
              <Badge className={cn(
                "text-[10px] border-0",
                alert.urgency === "urgente" ? "bg-destructive/10 text-destructive" :
                alert.urgency === "atencao" ? "bg-warning/15 text-warning" :
                "bg-primary/10 text-primary"
              )}>
                {daysLabel(alert.days_until)}
              </Badge>
              <Badge variant="outline" className="text-[9px]">{typeLabels[alert.type]}</Badge>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            <Button
              variant={alert.treated ? "ghost" : "outline"}
              size="sm"
              className="h-7 gap-1.5 text-xs"
              onClick={() => onTreat(alert.id)}
            >
              {alert.treated ? (
                <><Circle className="h-3 w-3" /> Reabrir</>
              ) : (
                <><CheckCheck className="h-3 w-3 text-success" /> Marcar como Tratada</>
              )}
            </Button>
            {caso && (
              <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs text-muted-foreground" asChild>
                <Link to={`/processos/${caso.id}`}>
                  <ExternalLink className="h-3 w-3" /> Ver Processo
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────
type Tab = "todos" | "prazo" | "audiencia" | "tarefa";

export default function Alertas() {
  const { user } = useAuth();
  const { notificationPermission, isNotificationsSupported, requestNotificationPermission } = useAlerts();

  const [tab, setTab] = useState<Tab>("todos");
  const [treatedIds, setTreatedIds] = useState<Set<string>>(new Set());

  const baseAlerts = useMemo(() => buildAlerts(user?.name ?? null), [user]);

  const allAlerts = useMemo(() =>
    baseAlerts.map((a) => ({ ...a, treated: treatedIds.has(a.id) })),
    [baseAlerts, treatedIds]
  );

  const visibleAlerts = useMemo(() => {
    if (tab === "todos") return allAlerts;
    return allAlerts.filter((a) => a.type === tab);
  }, [allAlerts, tab]);

  const untreated = allAlerts.filter((a) => !a.treated).length;

  const counts: Record<Tab, number> = {
    todos: allAlerts.length,
    prazo: allAlerts.filter((a) => a.type === "prazo").length,
    audiencia: allAlerts.filter((a) => a.type === "audiencia").length,
    tarefa: allAlerts.filter((a) => a.type === "tarefa").length,
  };

  const handleTreat = (id: string) => {
    setTreatedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const untreatedVisible = visibleAlerts.filter((a) => !a.treated);
  const treatedVisible = visibleAlerts.filter((a) => a.treated);

  return (
    <div className="p-4 md:p-6 lg:p-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight sm:text-2xl flex items-center gap-2">
            <Bell className="h-6 w-6 text-primary" /> Central de Alertas
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5 font-medium">
            {untreated > 0 ? (
              <span className="font-semibold text-destructive">{untreated} alerta{untreated !== 1 ? "s" : ""} não tratado{untreated !== 1 ? "s" : ""}</span>
            ) : (
              <span className="text-success font-semibold">✓ Todos tratados</span>
            )}
          </p>
        </div>
      </div>

      {/* Push notification banner */}
      {isNotificationsSupported && notificationPermission !== "granted" && (
        <div className="mb-4 rounded-xl border border-primary/20 bg-primary/5 p-4 flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <BellRing className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold">Ativar notificações push</p>
            <p className="text-xs text-muted-foreground">
              Receba alertas de prazos e audiências mesmo com o navegador minimizado.
            </p>
          </div>
          <Button size="sm" className="gap-1.5 shrink-0" onClick={requestNotificationPermission}>
            <BellPlus className="h-3.5 w-3.5" /> Ativar
          </Button>
        </div>
      )}
      {isNotificationsSupported && notificationPermission === "granted" && (
        <div className="mb-4 rounded-xl border border-success/20 bg-success/5 p-3 flex items-center gap-2">
          <Smartphone className="h-4 w-4 text-success shrink-0" />
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold text-success">Notificações push ativas</span> — alertas aparecem no seu dispositivo.
          </p>
        </div>
      )}

      {/* Regras de alerta info */}
      <div className="mb-5 rounded-xl border border-primary/20 bg-primary/5 p-3">
        <div className="flex items-center gap-2 text-xs mb-1">
          <AlarmClock className="h-4 w-4 text-primary" />
          <span className="font-semibold text-primary">Regras de alertas ativas (MVP 1.0)</span>
        </div>
        <div className="grid gap-1 sm:grid-cols-3 text-[11px] text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <CalendarDays className="h-3 w-3 text-primary" />
            <span><strong>Audiências:</strong> 30, 7 e 1 dia antes</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="h-3 w-3 text-warning" />
            <span><strong>Prazos:</strong> 30, 7 e 1 dia antes</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3 w-3 text-success" />
            <span><strong>Tarefas:</strong> 1 dia antes e no vencimento</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)}>
        <div className="mb-4 overflow-x-auto scrollbar-hide">
          <TabsList className="w-max">
            {([
              { value: "todos", label: "Todos" },
              { value: "prazo", label: "Prazos" },
              { value: "audiencia", label: "Audiências" },
              { value: "tarefa", label: "Minhas Tarefas" },
            ] as { value: Tab; label: string }[]).map(({ value, label }) => (
              <TabsTrigger key={value} value={value} className="gap-1.5 text-xs">
                {label}
                {counts[value] > 0 && (
                  <span className="ml-0.5 text-[9px] text-muted-foreground">({counts[value]})</span>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {/* Content */}
        <TabsContent value={tab} forceMount className="mt-0">
          {visibleAlerts.length === 0 ? (
            <div className="rounded-xl border border-dashed p-12 text-center">
              <BellOff className="mx-auto mb-3 h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm font-medium text-muted-foreground">Nenhum alerta nos próximos 30 dias</p>
              <p className="text-xs text-muted-foreground mt-1">Audiências, prazos e tarefas próximos aparecerão aqui.</p>
            </div>
          ) : (
            <>
              {/* Não tratados */}
              {untreatedVisible.length > 0 && (
                <div className="mb-6">
                  <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Não Tratados · {untreatedVisible.length}
                  </h2>
                  <div className="space-y-2.5">
                    {untreatedVisible.map((a) => (
                      <AlertCard key={a.id} alert={a} onTreat={handleTreat} />
                    ))}
                  </div>
                </div>
              )}

              {/* Tratados */}
              {treatedVisible.length > 0 && (
                <div>
                  <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Tratados · {treatedVisible.length}
                  </h2>
                  <div className="space-y-2">
                    {treatedVisible.map((a) => (
                      <AlertCard key={a.id} alert={a} onTreat={handleTreat} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
