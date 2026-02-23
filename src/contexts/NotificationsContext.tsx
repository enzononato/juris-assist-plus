import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";

export type NotifType = "tarefa" | "alerta" | "sistema";

export interface InAppNotification {
  id: string;
  title: string;
  description: string;
  type: NotifType;
  read: boolean;
  created_at: string;
}

const STORAGE_KEY = "siag_notifications";

function loadNotifications(): InAppNotification[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

interface NotificationsContextType {
  notifications: InAppNotification[];
  unreadCount: number;
  addNotification: (n: Omit<InAppNotification, "id" | "read" | "created_at">) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<InAppNotification[]>(loadNotifications);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
  }, [notifications]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const addNotification = useCallback(
    (n: Omit<InAppNotification, "id" | "read" | "created_at">) => {
      setNotifications((prev) => [
        {
          ...n,
          id: `notif-${Date.now()}-${Math.random()}`,
          read: false,
          created_at: new Date().toISOString(),
        },
        ...prev,
      ]);
    },
    []
  );

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  return (
    <NotificationsContext.Provider
      value={{ notifications, unreadCount, addNotification, markAsRead, markAllAsRead }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotificationsContext() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error("useNotificationsContext must be used within NotificationsProvider");
  return ctx;
}
