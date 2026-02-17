import { useState, useEffect, useCallback } from "react";

export type NotificationPermission = "granted" | "denied" | "default" | "unsupported";

interface UseNotificationsReturn {
  permission: NotificationPermission;
  isSupported: boolean;
  requestPermission: () => Promise<void>;
  sendNotification: (title: string, options?: NotificationOptions) => void;
}

export function useNotifications(): UseNotificationsReturn {
  const isSupported = typeof window !== "undefined" && "Notification" in window;

  const [permission, setPermission] = useState<NotificationPermission>(
    isSupported ? (Notification.permission as NotificationPermission) : "unsupported"
  );

  useEffect(() => {
    if (isSupported) {
      setPermission(Notification.permission as NotificationPermission);
    }
  }, [isSupported]);

  const requestPermission = useCallback(async () => {
    if (!isSupported) return;
    try {
      const result = await Notification.requestPermission();
      setPermission(result as NotificationPermission);
    } catch {
      // Safari fallback
      Notification.requestPermission((result) => {
        setPermission(result as NotificationPermission);
      });
    }
  }, [isSupported]);

  const sendNotification = useCallback(
    (title: string, options?: NotificationOptions) => {
      if (!isSupported || permission !== "granted") return;

      try {
        const notifOptions: NotificationOptions & Record<string, unknown> = {
          icon: "/pwa-192x192.png",
          badge: "/pwa-192x192.png",
          tag: options?.tag || `alert-${Date.now()}`,
          ...options,
        };
        (notifOptions as any).renotify = true;
        const notification = new Notification(title, notifOptions);

        notification.onclick = () => {
          window.focus();
          notification.close();
        };

        // Auto-close after 8s
        setTimeout(() => notification.close(), 8000);
      } catch {
        // Service worker notification fallback
        if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
          navigator.serviceWorker.ready.then((registration) => {
            registration.showNotification(title, {
              icon: "/pwa-192x192.png",
              badge: "/pwa-192x192.png",
              ...options,
            });
          });
        }
      }
    },
    [isSupported, permission]
  );

  return { permission, isSupported, requestPermission, sendNotification };
}
