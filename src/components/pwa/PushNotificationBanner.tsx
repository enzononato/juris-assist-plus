import { useState, useEffect } from "react";
import { Bell, BellOff, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNotifications } from "@/hooks/useNotifications";
import { cn } from "@/lib/utils";

const DISMISSED_KEY = "siag_push_dismissed";

export default function PushNotificationBanner() {
  const { permission, isSupported, requestPermission } = useNotifications();
  const [dismissed, setDismissed] = useState(() => localStorage.getItem(DISMISSED_KEY) === "true");
  const [requesting, setRequesting] = useState(false);

  if (!isSupported || permission === "granted" || permission === "denied" || dismissed) return null;

  const handleEnable = async () => {
    setRequesting(true);
    await requestPermission();
    setRequesting(false);
  };

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem(DISMISSED_KEY, "true");
  };

  return (
    <div className="mx-4 mt-3 mb-1 flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 animate-in fade-in slide-in-from-top-2 duration-500">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
        <Bell className="h-4 w-4 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-foreground">Ative as notificações</p>
        <p className="text-[10px] text-muted-foreground">Receba alertas de prazos, audiências e tarefas em tempo real.</p>
      </div>
      <Button size="sm" className="h-8 text-xs rounded-lg gap-1.5 shrink-0" onClick={handleEnable} disabled={requesting}
        style={{ background: "var(--gradient-primary)" }}>
        <Bell className="h-3 w-3" />
        {requesting ? "..." : "Ativar"}
      </Button>
      <button onClick={handleDismiss} className="text-muted-foreground hover:text-foreground transition-colors shrink-0">
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
