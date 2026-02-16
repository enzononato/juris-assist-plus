import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Bell, CalendarDays, Clock, FileText, CheckCircle2, BellOff,
  ExternalLink, UserPlus, AlarmClock, MoreHorizontal, Eye,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { mockAlerts, mockCases, type Alert, type AlertType, type AlertSeverity } from "@/data/mock";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

const typeIcons: Record<AlertType, React.ReactNode> = {
  prazo: <Clock className="h-4 w-4" />,
  audiencia: <CalendarDays className="h-4 w-4" />,
  tarefa: <CheckCircle2 className="h-4 w-4" />,
  prova: <FileText className="h-4 w-4" />,
  publicacao: <Bell className="h-4 w-4" />,
};

const severityStyles: Record<AlertSeverity, string> = {
  info: "border-l-info bg-info/5",
  atencao: "border-l-warning bg-warning/5",
  urgente: "border-l-destructive bg-destructive/5",
};

const severityLabels: Record<AlertSeverity, string> = {
  info: "Info",
  atencao: "Atenção",
  urgente: "Urgente",
};

const severityBadge: Record<AlertSeverity, string> = {
  info: "bg-info/15 text-info",
  atencao: "bg-warning/15 text-warning",
  urgente: "bg-destructive/10 text-destructive",
};

type TabValue = "todos" | "importantes" | "prazo" | "audiencia" | "tarefa" | "prova" | "publicacao";

export default function Alertas() {
  const [tab, setTab] = useState<TabValue>("todos");
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts);

  const filtered = (() => {
    switch (tab) {
      case "todos": return alerts;
      case "importantes": return alerts.filter((a) => a.severity === "urgente" || a.severity === "atencao");
      default: return alerts.filter((a) => a.type === tab);
    }
  })();

  const untreatedCount = alerts.filter((a) => !a.treated).length;
  const untreatedFiltered = filtered.filter((a) => !a.treated);
  const treatedFiltered = filtered.filter((a) => a.treated);

  const toggleTreated = (id: string) => {
    setAlerts((prev) => prev.map((a) => a.id === id ? { ...a, treated: !a.treated } : a));
  };

  const snooze = (id: string, duration: string) => {
    toast({ title: "Alerta adiado", description: `Adiado por ${duration}. (Demo – sem backend)` });
  };

  const assignOwner = (id: string) => {
    toast({ title: "Atribuir dono", description: "Funcionalidade disponível com Lovable Cloud ativo." });
  };

  const getCaseForAlert = (a: Alert) => a.case_number ? mockCases.find((c) => c.case_number === a.case_number) : undefined;

  const tabCounts: Record<TabValue, number> = {
    todos: alerts.length,
    importantes: alerts.filter((a) => a.severity === "urgente" || a.severity === "atencao").length,
    prazo: alerts.filter((a) => a.type === "prazo").length,
    audiencia: alerts.filter((a) => a.type === "audiencia").length,
    tarefa: alerts.filter((a) => a.type === "tarefa").length,
    prova: alerts.filter((a) => a.type === "prova").length,
    publicacao: alerts.filter((a) => a.type === "publicacao").length,
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="mb-5">
        <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Central de Alertas</h1>
        <p className="text-sm text-muted-foreground">
          {untreatedCount > 0 ? (
            <span className="font-medium text-destructive">{untreatedCount} alerta{untreatedCount !== 1 ? "s" : ""} não tratado{untreatedCount !== 1 ? "s" : ""}</span>
          ) : (
            <span className="text-success font-medium">Todos tratados ✓</span>
          )}
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={(v) => setTab(v as TabValue)}>
        <div className="mb-4 overflow-x-auto scrollbar-hide">
          <TabsList className="w-max">
            {(["todos","importantes","prazo","audiencia","tarefa","prova","publicacao"] as TabValue[]).map((t) => (
              <TabsTrigger key={t} value={t} className="gap-1 text-xs">
                {t === "todos" ? "Todos" :
                 t === "importantes" ? "Importantes" :
                 t === "prazo" ? "Prazos" :
                 t === "audiencia" ? "Audiências" :
                 t === "tarefa" ? "Minhas Tarefas" :
                 t === "prova" ? "Provas/SLA" : "Publicações"}
                {tabCounts[t] > 0 && (
                  <span className="ml-0.5 text-[9px] text-muted-foreground">({tabCounts[t]})</span>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
      </Tabs>

      {/* Untreated Alerts */}
      {untreatedFiltered.length > 0 && (
        <div className="mb-6">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Não Tratados</h2>
          <div className="space-y-2">
            {untreatedFiltered.map((a) => (
              <AlertCard key={a.id} alert={a} caso={getCaseForAlert(a)} onToggle={toggleTreated} onSnooze={snooze} onAssign={assignOwner} />
            ))}
          </div>
        </div>
      )}

      {/* Treated Alerts */}
      {treatedFiltered.length > 0 && (
        <div>
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tratados</h2>
          <div className="space-y-2">
            {treatedFiltered.map((a) => (
              <AlertCard key={a.id} alert={a} caso={getCaseForAlert(a)} onToggle={toggleTreated} onSnooze={snooze} onAssign={assignOwner} />
            ))}
          </div>
        </div>
      )}

      {filtered.length === 0 && (
        <div className="rounded-xl border border-dashed p-12 text-center">
          <BellOff className="mx-auto mb-3 h-8 w-8 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">Nenhum alerta encontrado nesta categoria.</p>
        </div>
      )}
    </div>
  );
}

function AlertCard({ alert: a, caso, onToggle, onSnooze, onAssign }: {
  alert: Alert;
  caso?: { id: string } | undefined;
  onToggle: (id: string) => void;
  onSnooze: (id: string, d: string) => void;
  onAssign: (id: string) => void;
}) {
  return (
    <div className={cn(
      "group rounded-xl border-l-4 p-3 shadow-sm transition-all sm:p-4",
      severityStyles[a.severity],
      a.treated && "opacity-50"
    )}>
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={cn("mt-0.5 shrink-0",
          a.severity === "urgente" ? "text-destructive" :
          a.severity === "atencao" ? "text-warning" : "text-info"
        )}>
          {typeIcons[a.type]}
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <p className="text-sm font-semibold">{a.title}</p>
            <Badge className={cn("border-0 text-[10px]", severityBadge[a.severity])}>
              {severityLabels[a.severity]}
            </Badge>
            {a.treated ? (
              <Badge variant="outline" className="text-[10px] bg-success/10 text-success border-success/20">Tratada</Badge>
            ) : (
              <Badge variant="outline" className="text-[10px] bg-destructive/10 text-destructive border-destructive/20">Não tratada</Badge>
            )}
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">{a.description}</p>
          {a.case_number && (
            <p className="mt-1 text-[11px] text-muted-foreground">
              📋 {a.case_number} · {a.employee}
            </p>
          )}
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            🕐 {new Date(a.event_date).toLocaleString("pt-BR")}
          </p>
        </div>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-1">
          {caso && (
            <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
              <Link to={`/processos/${caso.id}`}><ExternalLink className="h-3.5 w-3.5" /></Link>
            </Button>
          )}
          <Button variant="ghost" size="sm" className="h-7 text-xs px-2" onClick={() => onToggle(a.id)}>
            {a.treated ? "Reabrir" : "Tratar"}
          </Button>
          {!a.treated && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="h-3.5 w-3.5" /></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onSnooze(a.id, "1 hora")}>
                  <AlarmClock className="mr-2 h-3.5 w-3.5" /> Adiar 1h
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onSnooze(a.id, "1 dia")}>
                  <AlarmClock className="mr-2 h-3.5 w-3.5" /> Adiar 1 dia
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onAssign(a.id)}>
                  <UserPlus className="mr-2 h-3.5 w-3.5" /> Atribuir dono
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </div>
  );
}
