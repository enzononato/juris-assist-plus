import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from "react";
import { mockAlerts, type Alert, type AlertSeverity } from "@/data/mock";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/hooks/useNotifications";

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
  notificationPermission: string;
  isNotificationsSupported: boolean;
  requestNotificationPermission: () => Promise<void>;
}

const AlertsContext = createContext<AlertsContextType | undefined>(undefined);

export function AlertsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { permission: notificationPermission, isSupported: isNotificationsSupported, requestPermission: requestNotificationPermission, sendNotification } = useNotifications();
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts);
  const [escalations, setEscalations] = useState<EscalationLog[]>([]);
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
  const [whatsappLogs, setWhatsappLogs] = useState<WhatsAppLog[]>([]);
  const [simulated, setSimulated] = useState(false);
  const prevAlertCountRef = useRef(alerts.length);

  const untreatedCount = alerts.filter((a) => !a.treated).length;

  // Auto-alerts disabled: no active cases/hearings to generate alerts for
  // When real data from Supabase is integrated, this logic will be replaced

  const toggleTreated = useCallback((id: string) => {
    setAlerts((prev) => prev.map((a) => a.id === id ? { ...a, treated: !a.treated } : a));
  }, []);

  const snooze = useCallback((id: string, duration: string) => {
    toast({ title: "Alerta adiado", description: `Adiado por ${duration}.` });
  }, []);

  // Send push notification when new alerts arrive
  useEffect(() => {
    if (alerts.length > prevAlertCountRef.current) {
      const newAlerts = alerts.slice(0, alerts.length - prevAlertCountRef.current);
      newAlerts.forEach((a) => {
        const severityEmoji = a.severity === "urgente" ? "🔴" : a.severity === "atencao" ? "⚠️" : "ℹ️";
        sendNotification(`${severityEmoji} ${a.title}`, {
          body: a.description,
          tag: `alert-${a.id}`,
        });
      });
    }
    prevAlertCountRef.current = alerts.length;
  }, [alerts, sendNotification]);

  return (
    <AlertsContext.Provider value={{ alerts, escalations, emailLogs, whatsappLogs, untreatedCount, toggleTreated, snooze, notificationPermission, isNotificationsSupported, requestNotificationPermission }}>
      {children}
    </AlertsContext.Provider>
  );
}

export function useAlerts() {
  const ctx = useContext(AlertsContext);
  if (!ctx) throw new Error("useAlerts must be used within AlertsProvider");
  return ctx;
}
