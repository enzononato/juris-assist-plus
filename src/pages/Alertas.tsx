import { useState } from "react";
import { Bell, CalendarDays, Clock, FileText, CheckCircle2, AlertTriangle, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockAlerts, type AlertType, type AlertSeverity } from "@/data/mock";
import { cn } from "@/lib/utils";

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

export default function Alertas() {
  const [tab, setTab] = useState("todos");
  const [alerts, setAlerts] = useState(mockAlerts);

  const filtered = tab === "todos"
    ? alerts
    : tab === "importantes"
    ? alerts.filter((a) => a.severity === "urgente" || a.severity === "atencao")
    : alerts.filter((a) => a.type === tab);

  const toggleTreated = (id: string) => {
    setAlerts((prev) => prev.map((a) => a.id === id ? { ...a, treated: !a.treated } : a));
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Alertas</h1>
        <p className="text-sm text-muted-foreground">
          {alerts.filter((a) => !a.treated).length} não tratados
        </p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="mb-4 flex-wrap">
          <TabsTrigger value="todos">Todos</TabsTrigger>
          <TabsTrigger value="importantes">Importantes</TabsTrigger>
          <TabsTrigger value="prazo">Prazos</TabsTrigger>
          <TabsTrigger value="audiencia">Audiências</TabsTrigger>
          <TabsTrigger value="tarefa">Tarefas</TabsTrigger>
          <TabsTrigger value="prova">Provas</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="space-y-2">
        {filtered.map((a) => (
          <div
            key={a.id}
            className={cn(
              "flex items-start gap-3 rounded-lg border-l-4 p-4 transition-all",
              severityStyles[a.severity],
              a.treated && "opacity-60"
            )}
          >
            <div className={cn(
              "mt-0.5 shrink-0",
              a.severity === "urgente" ? "text-destructive" :
              a.severity === "atencao" ? "text-warning" : "text-info"
            )}>
              {typeIcons[a.type]}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold">{a.title}</p>
                {a.treated && (
                  <Badge variant="outline" className="text-[10px] bg-success/10 text-success">Tratada</Badge>
                )}
                {!a.treated && (
                  <Badge variant="outline" className="text-[10px] bg-destructive/10 text-destructive">Não tratada</Badge>
                )}
              </div>
              <p className="mt-0.5 text-sm text-muted-foreground">{a.description}</p>
              {a.case_number && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Processo: {a.case_number} · {a.employee}
                </p>
              )}
              <p className="mt-1 text-xs text-muted-foreground">
                {new Date(a.event_date).toLocaleString("pt-BR")}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleTreated(a.id)}
              className="shrink-0 text-xs"
            >
              {a.treated ? "Reabrir" : "Tratar"}
            </Button>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">Nenhum alerta encontrado.</p>
        )}
      </div>
    </div>
  );
}
