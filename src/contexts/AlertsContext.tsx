import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { mockAlerts, type Alert, type AlertSeverity } from "@/data/mock";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export interface EscalationLog {
  id: string;
  alert_id: string;
  alert_title: string;
  escalated_to: string;
  reason: string;
  created_at: string;
}

export interface EmailLog {
  id: string;
  alert_id: string;
  to: string;
  subject: string;
  status: "enviado" | "falha";
  sent_at: string;
}

export interface WhatsAppLog {
  id: string;
  alert_id: string;
  to_name: string;
  to_phone: string;
  message: string;
  status: "enviado" | "falha";
  sent_at: string;
}

interface AlertsContextType {
  alerts: Alert[];
  escalations: EscalationLog[];
  emailLogs: EmailLog[];
  whatsappLogs: WhatsAppLog[];
  untreatedCount: number;
  toggleTreated: (id: string) => void;
  snooze: (id: string, duration: string) => void;
}

const AlertsContext = createContext<AlertsContextType | undefined>(undefined);

export function AlertsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts);
  const [escalations, setEscalations] = useState<EscalationLog[]>([]);
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
  const [whatsappLogs, setWhatsappLogs] = useState<WhatsAppLog[]>([]);
  const [simulated, setSimulated] = useState(false);

  const untreatedCount = alerts.filter((a) => !a.treated).length;

  // Simulate auto-alerts (7d/2d/2h) on mount
  useEffect(() => {
    if (simulated || !user) return;
    setSimulated(true);

    // Simulate a new auto-generated alert arriving after 3s
    const timer = setTimeout(() => {
      const newAlert: Alert = {
        id: "auto-1",
        type: "audiencia",
        title: "⏰ Alerta automático: Audiência em 2 dias",
        description: "Audiência Inicial em 25/02/2026 às 10:00 – checklist pré-audiência pendente!",
        case_number: "0005678-90.2024.5.02.0002",
        employee: "Maria Fernanda Oliveira",
        event_date: "2026-02-25T10:00:00",
        severity: "urgente",
        treated: false,
      };
      setAlerts((prev) => [newAlert, ...prev]);

      // Simulate email sent
      setEmailLogs((prev) => [
        {
          id: "em-1",
          alert_id: "auto-1",
          to: user.email,
          subject: "⚠️ Audiência em 2 dias – 0005678-90.2024.5.02.0002",
          status: "enviado",
          sent_at: new Date().toISOString(),
        },
        ...prev,
      ]);

      // Simulate WhatsApp notification
      setWhatsappLogs((prev) => [
        {
          id: "wa-1",
          alert_id: "auto-1",
          to_name: "Ana Jurídico",
          to_phone: "(74) 99912-3456",
          message: "⚠️ *Audiência em 2 dias*\n📋 Processo: 0005678-90.2024.5.02.0002\n👤 Maria Fernanda Oliveira\n📅 25/02/2026 às 10:00\n⚡ Checklist pré-audiência pendente!",
          status: "enviado",
          sent_at: new Date().toISOString(),
        },
        ...prev,
      ]);

      toast({
        title: "🔔 Novo Alerta Automático",
        description: "Audiência em 2 dias – notificado via e-mail e WhatsApp!",
      });
    }, 3000);

    // Simulate SLA prova 48h alert after 5s
    const slaTimer = setTimeout(() => {
      const slaAlert: Alert = {
        id: "auto-sla-48",
        type: "prova",
        title: "⚠️ SLA de Prova: 48h sem atendimento",
        description: "Solicitação 'Assédio Moral' – registros de CFTV e logs de acesso ainda pendentes. SLA em risco!",
        case_number: "0009876-12.2024.5.03.0003",
        employee: "Pedro Henrique Costa",
        event_date: new Date().toISOString(),
        severity: "atencao",
        treated: false,
      };
      setAlerts((prev) => [slaAlert, ...prev]);

      setEmailLogs((prev) => [
        {
          id: "em-sla-48",
          alert_id: "auto-sla-48",
          to: "joao.dp@revalle.com.br",
          subject: "⚠️ SLA Em Risco (48h): Provas pendentes – Assédio Moral",
          status: "enviado",
          sent_at: new Date().toISOString(),
        },
        ...prev,
      ]);

      toast({
        title: "⚠️ SLA de Prova em Risco",
        description: "48h sem atendimento – registros de CFTV pendentes.",
      });
    }, 5000);

    // Simulate SLA prova 72h (atrasado) after 8s
    const sla72Timer = setTimeout(() => {
      const sla72Alert: Alert = {
        id: "auto-sla-72",
        type: "prova",
        title: "🔴 SLA Estourado: 72h sem atendimento",
        description: "Solicitação 'Assédio Moral' – SLA de 72h estourado! Escalonamento ativado para gestora.",
        case_number: "0009876-12.2024.5.03.0003",
        employee: "Pedro Henrique Costa",
        event_date: new Date().toISOString(),
        severity: "urgente",
        treated: false,
      };
      setAlerts((prev) => [sla72Alert, ...prev]);

      setEmailLogs((prev) => [
        {
          id: "em-sla-72",
          alert_id: "auto-sla-72",
          to: "ana@revalle.com.br",
          subject: "🔴 SLA ESTOURADO (72h): Provas não entregues – Assédio Moral",
          status: "enviado",
          sent_at: new Date().toISOString(),
        },
        ...prev,
      ]);

      toast({
        title: "🔴 SLA de Prova Estourado!",
        description: "72h sem atendimento – escalonamento ativado.",
        variant: "destructive",
      });
    }, 8000);

    // Simulate escalation after 6s (untreated urgent alert)
    const escalationTimer = setTimeout(() => {
      setEscalations((prev) => [
        {
          id: "esc-1",
          alert_id: "2",
          alert_title: "Prazo vencendo em 2 dias",
          escalated_to: "Ana Jurídico (Gestora)",
          reason: "Alerta urgente não tratado há 4+ horas",
          created_at: new Date().toISOString(),
        },
        ...prev,
      ]);

      setEmailLogs((prev) => [
        {
          id: "em-2",
          alert_id: "2",
          to: "ana@revalle.com.br",
          subject: "🔺 ESCALONAMENTO: Prazo vencendo – não tratado há 4h",
          status: "enviado",
          sent_at: new Date().toISOString(),
        },
        ...prev,
      ]);

      toast({
        title: "🔺 Escalonamento ativado",
        description: "Alerta urgente escalonado para gestora Ana Jurídico.",
      });
    }, 6000);

    return () => {
      clearTimeout(timer);
      clearTimeout(slaTimer);
      clearTimeout(sla72Timer);
      clearTimeout(escalationTimer);
    };
  }, [user, simulated]);

  const toggleTreated = useCallback((id: string) => {
    setAlerts((prev) => prev.map((a) => a.id === id ? { ...a, treated: !a.treated } : a));
  }, []);

  const snooze = useCallback((id: string, duration: string) => {
    toast({ title: "Alerta adiado", description: `Adiado por ${duration}. (Demo)` });
  }, []);

  return (
    <AlertsContext.Provider value={{ alerts, escalations, emailLogs, whatsappLogs, untreatedCount, toggleTreated, snooze }}>
      {children}
    </AlertsContext.Provider>
  );
}

export function useAlerts() {
  const ctx = useContext(AlertsContext);
  if (!ctx) throw new Error("useAlerts must be used within AlertsProvider");
  return ctx;
}
