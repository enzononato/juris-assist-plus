import {
  Scale, RefreshCw, Clock, CalendarDays, FileText, ClipboardList,
  CheckCircle2, MessageCircle, Users, Plus, Pencil,
} from "lucide-react";
import { type TimelineEvent, type TimelineEventType } from "@/data/mock";
import { cn } from "@/lib/utils";

const eventConfig: Record<TimelineEventType, { icon: React.ReactNode; color: string }> = {
  processo_criado: { icon: <Scale className="h-3.5 w-3.5" />, color: "bg-primary text-primary-foreground" },
  status_alterado: { icon: <RefreshCw className="h-3.5 w-3.5" />, color: "bg-info text-info-foreground" },
  prazo_criado: { icon: <Clock className="h-3.5 w-3.5" />, color: "bg-warning text-warning-foreground" },
  prazo_cumprido: { icon: <CheckCircle2 className="h-3.5 w-3.5" />, color: "bg-success text-success-foreground" },
  audiencia_agendada: { icon: <CalendarDays className="h-3.5 w-3.5" />, color: "bg-primary text-primary-foreground" },
  audiencia_realizada: { icon: <CalendarDays className="h-3.5 w-3.5" />, color: "bg-success text-success-foreground" },
  prova_anexada: { icon: <FileText className="h-3.5 w-3.5" />, color: "bg-accent text-accent-foreground" },
  tarefa_criada: { icon: <ClipboardList className="h-3.5 w-3.5" />, color: "bg-warning text-warning-foreground" },
  tarefa_concluida: { icon: <CheckCircle2 className="h-3.5 w-3.5" />, color: "bg-success text-success-foreground" },
  comentario: { icon: <MessageCircle className="h-3.5 w-3.5" />, color: "bg-muted text-muted-foreground" },
  checklist_aplicado: { icon: <ClipboardList className="h-3.5 w-3.5" />, color: "bg-accent text-accent-foreground" },
  responsavel_alterado: { icon: <Users className="h-3.5 w-3.5" />, color: "bg-info text-info-foreground" },
  campo_editado: { icon: <Pencil className="h-3.5 w-3.5" />, color: "bg-warning text-warning-foreground" },
};

function formatRelativeDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }) + " às " + date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function groupByMonth(events: TimelineEvent[]) {
  const groups: Record<string, TimelineEvent[]> = {};
  events.forEach((e) => {
    const d = new Date(e.created_at);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(e);
  });
  return Object.entries(groups)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([key, events]) => {
      const [year, month] = key.split("-");
      const label = new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString("pt-BR", {
        month: "long",
        year: "numeric",
      });
      return { label, events };
    });
}

interface Props {
  events: TimelineEvent[];
}

export default function TimelineTab({ events }: Props) {
  const sorted = [...events].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  const groups = groupByMonth(sorted);

  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-12 text-center">
        <Clock className="h-8 w-8 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">Nenhum evento registrado.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <div key={group.label}>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {group.label}
          </h3>
          <div className="relative ml-3 border-l-2 border-border pl-6">
            {group.events.map((event, idx) => {
              const config = eventConfig[event.type] || eventConfig.comentario;
              return (
                <div
                  key={event.id}
                  className="relative mb-4 last:mb-0 animate-in fade-in slide-in-from-left-2 duration-300"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  {/* Dot on timeline */}
                  <div
                    className={cn(
                      "absolute -left-[calc(1.5rem+5px)] flex h-6 w-6 items-center justify-center rounded-full",
                      config.color
                    )}
                  >
                    {config.icon}
                  </div>

                  <div className="rounded-lg border bg-card p-3">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium">{event.title}</p>
                    </div>
                    {event.description && (
                      <p className="mt-1 text-xs text-muted-foreground">{event.description}</p>
                    )}
                    <div className="mt-2 flex items-center gap-2 text-[10px] text-muted-foreground">
                      <span className="font-medium">{event.user}</span>
                      <span>·</span>
                      <span>{formatRelativeDate(event.created_at)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
