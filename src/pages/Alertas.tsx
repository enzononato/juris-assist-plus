import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Bell, CalendarDays, Clock, FileText, CheckCircle2, BellOff,
  ExternalLink, UserPlus, AlarmClock, MoreHorizontal, ArrowUpRight,
  Mail, AlertTriangle, TrendingUp, MessageCircle, Phone,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { mockCases, type Alert, type AlertType, type AlertSeverity } from "@/data/mock";
import { useAlerts } from "@/contexts/AlertsContext";
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

type MainTab = "alertas" | "escalonamento" | "emails" | "whatsapp";
type AlertTab = "todos" | "importantes" | "prazo" | "audiencia" | "tarefa" | "prova" | "publicacao";

export default function Alertas() {
  const [mainTab, setMainTab] = useState<MainTab>("alertas");
  const [alertTab, setAlertTab] = useState<AlertTab>("todos");
  const { alerts, escalations, emailLogs, whatsappLogs, untreatedCount, toggleTreated, snooze } = useAlerts();

  const filtered = (() => {
    switch (alertTab) {
      case "todos": return alerts;
      case "importantes": return alerts.filter((a) => a.severity === "urgente" || a.severity === "atencao");
      default: return alerts.filter((a) => a.type === alertTab);
    }
  })();

  const untreatedFiltered = filtered.filter((a) => !a.treated);
  const treatedFiltered = filtered.filter((a) => a.treated);

  const assignOwner = (id: string) => {
    toast({ title: "Atribuir dono", description: "Funcionalidade disponível com backend ativo." });
  };

  const getCaseForAlert = (a: Alert) => a.case_number ? mockCases.find((c) => c.case_number === a.case_number) : undefined;

  const alertTabCounts: Record<AlertTab, number> = {
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

      {/* Main Tabs: Alertas / Escalonamento / E-mails */}
      <Tabs value={mainTab} onValueChange={(v) => setMainTab(v as MainTab)}>
        <div className="mb-4">
          <TabsList>
            <TabsTrigger value="alertas" className="gap-1.5 text-xs">
              <Bell className="h-3.5 w-3.5" /> Alertas
              {untreatedCount > 0 && (
                <Badge className="ml-1 h-4 min-w-4 rounded-full bg-destructive px-1 text-[9px] text-destructive-foreground">{untreatedCount}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="escalonamento" className="gap-1.5 text-xs">
              <TrendingUp className="h-3.5 w-3.5" /> Escalonamento
              {escalations.length > 0 && (
                <Badge className="ml-1 h-4 min-w-4 rounded-full bg-warning px-1 text-[9px] text-warning-foreground">{escalations.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="emails" className="gap-1.5 text-xs">
              <Mail className="h-3.5 w-3.5" /> E-mails ({emailLogs.length})
            </TabsTrigger>
            <TabsTrigger value="whatsapp" className="gap-1.5 text-xs">
              <MessageCircle className="h-3.5 w-3.5" /> WhatsApp ({whatsappLogs.length})
            </TabsTrigger>
          </TabsList>
        </div>

        {/* ALERTAS TAB */}
        <TabsContent value="alertas">
          {/* Sub-tabs */}
          <Tabs value={alertTab} onValueChange={(v) => setAlertTab(v as AlertTab)}>
            <div className="mb-4 overflow-x-auto scrollbar-hide">
              <TabsList className="w-max">
                {(["todos","importantes","prazo","audiencia","tarefa","prova","publicacao"] as AlertTab[]).map((t) => (
                  <TabsTrigger key={t} value={t} className="gap-1 text-xs">
                    {t === "todos" ? "Todos" :
                     t === "importantes" ? "Importantes" :
                     t === "prazo" ? "Prazos" :
                     t === "audiencia" ? "Audiências" :
                     t === "tarefa" ? "Tarefas" :
                     t === "prova" ? "Provas/SLA" : "Publicações"}
                    {alertTabCounts[t] > 0 && (
                      <span className="ml-0.5 text-[9px] text-muted-foreground">({alertTabCounts[t]})</span>
                    )}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
          </Tabs>

          {/* Auto-alert info card */}
          <div className="mb-4 rounded-lg border border-primary/20 bg-primary/5 p-3">
            <div className="flex items-center gap-2 text-xs">
              <AlarmClock className="h-4 w-4 text-primary" />
              <span className="font-semibold text-primary">Alertas automáticos ativos</span>
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Audiências e prazos geram alertas em <strong>7 dias</strong>, <strong>2 dias</strong> e <strong>2 horas</strong> antes do evento.
              Alertas urgentes não tratados são escalonados automaticamente para gestores.
            </p>
          </div>

          {/* Untreated */}
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

          {/* Treated */}
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
              <p className="text-sm text-muted-foreground">Nenhum alerta encontrado.</p>
            </div>
          )}
        </TabsContent>

        {/* ESCALONAMENTO TAB */}
        <TabsContent value="escalonamento">
          <div className="mb-4 rounded-lg border border-warning/20 bg-warning/5 p-3">
            <div className="flex items-center gap-2 text-xs">
              <AlertTriangle className="h-4 w-4 text-warning" />
              <span className="font-semibold text-warning">Regra de Escalonamento</span>
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Alertas <strong>urgentes</strong> não tratados após <strong>4 horas</strong> são escalonados automaticamente para o gestor responsável.
              Um segundo escalonamento ocorre após <strong>24 horas</strong> para a diretoria.
            </p>
          </div>

          {escalations.length === 0 ? (
            <div className="rounded-xl border border-dashed p-12 text-center">
              <TrendingUp className="mx-auto mb-3 h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">Nenhum escalonamento registrado.</p>
              <p className="text-xs text-muted-foreground mt-1">Aguarde... escalonamentos são simulados automaticamente.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {escalations.map((esc) => (
                <div key={esc.id} className="rounded-xl border-l-4 border-l-warning bg-warning/5 p-4">
                  <div className="flex items-start gap-3">
                    <ArrowUpRight className="mt-0.5 h-4 w-4 text-warning shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold">{esc.alert_title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Escalonado para: <span className="font-medium text-foreground">{esc.escalated_to}</span>
                      </p>
                      <p className="text-xs text-muted-foreground">{esc.reason}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {new Date(esc.created_at).toLocaleString("pt-BR")}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* EMAILS TAB */}
        <TabsContent value="emails">
          <div className="mb-4 rounded-lg border border-info/20 bg-info/5 p-3">
            <div className="flex items-center gap-2 text-xs">
              <Mail className="h-4 w-4 text-info" />
              <span className="font-semibold text-info">Notificações por E-mail</span>
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Cada alerta gerado envia automaticamente um e-mail para os responsáveis configurados.
              E-mails de escalonamento são enviados separadamente para gestores.
            </p>
          </div>

          {emailLogs.length === 0 ? (
            <div className="rounded-xl border border-dashed p-12 text-center">
              <Mail className="mx-auto mb-3 h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">Nenhum e-mail enviado ainda.</p>
              <p className="text-xs text-muted-foreground mt-1">Aguarde... e-mails são simulados automaticamente.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {emailLogs.map((log) => (
                <div key={log.id} className="rounded-xl border bg-card p-4">
                  <div className="flex items-start gap-3">
                    <Mail className={cn("mt-0.5 h-4 w-4 shrink-0", log.status === "enviado" ? "text-success" : "text-destructive")} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{log.subject}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Para: <span className="font-medium">{log.to}</span>
                      </p>
                      <div className="mt-1 flex items-center gap-2">
                        <Badge className={cn("text-[9px] border-0",
                          log.status === "enviado" ? "bg-success/15 text-success" : "bg-destructive/10 text-destructive"
                        )}>
                          {log.status === "enviado" ? "✓ Enviado" : "✗ Falha"}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(log.sent_at).toLocaleString("pt-BR")}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* WHATSAPP TAB */}
        <TabsContent value="whatsapp">
          <div className="mb-4 rounded-lg border border-success/20 bg-success/5 p-3">
            <div className="flex items-center gap-2 text-xs">
              <MessageCircle className="h-4 w-4 text-success" />
              <span className="font-semibold text-success">Notificações via WhatsApp</span>
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Alertas urgentes e de audiência são enviados automaticamente via WhatsApp para os responsáveis configurados.
              Canais configurados na tela <strong>Regras de Alertas</strong>.
            </p>
          </div>

          {whatsappLogs.length === 0 ? (
            <div className="rounded-xl border border-dashed p-12 text-center">
              <MessageCircle className="mx-auto mb-3 h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">Nenhuma mensagem WhatsApp enviada ainda.</p>
              <p className="text-xs text-muted-foreground mt-1">Aguarde... mensagens são simuladas automaticamente.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {whatsappLogs.map((log) => (
                <div key={log.id} className="rounded-xl border bg-card p-4">
                  <div className="flex items-start gap-3">
                    <MessageCircle className={cn("mt-0.5 h-4 w-4 shrink-0", log.status === "enviado" ? "text-success" : "text-destructive")} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{log.to_name}</p>
                        <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                          <Phone className="h-2.5 w-2.5" /> {log.to_phone}
                        </span>
                      </div>
                      <pre className="mt-1 text-xs text-muted-foreground whitespace-pre-wrap font-sans leading-relaxed bg-muted/30 rounded-lg p-2">
                        {log.message}
                      </pre>
                      <div className="mt-1 flex items-center gap-2">
                        <Badge className={cn("text-[9px] border-0",
                          log.status === "enviado" ? "bg-success/15 text-success" : "bg-destructive/10 text-destructive"
                        )}>
                          {log.status === "enviado" ? "✓ Enviado" : "✗ Falha"}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(log.sent_at).toLocaleString("pt-BR")}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
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
        <div className={cn("mt-0.5 shrink-0",
          a.severity === "urgente" ? "text-destructive" :
          a.severity === "atencao" ? "text-warning" : "text-info"
        )}>
          {typeIcons[a.type]}
        </div>

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
