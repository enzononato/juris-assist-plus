import { Bell, CheckCheck, CheckSquare } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNotificationsContext } from "@/contexts/NotificationsContext";
import { cn } from "@/lib/utils";

const typeIcon: Record<string, string> = {
  tarefa: "✅",
  alerta: "🔔",
  sistema: "⚙️",
};

export default function InAppNotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotificationsContext();
  const recent = notifications.slice(0, 8);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-8 w-8 rounded-xl text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span
              className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-bold text-white shadow-sm"
              style={{ background: "var(--gradient-primary)" }}
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80 max-h-[440px] overflow-y-auto">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notificações</span>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Badge variant="default" className="text-[10px] h-4 px-1.5">{unreadCount}</Badge>
            )}
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-[10px] text-primary hover:underline font-semibold flex items-center gap-0.5"
              >
                <CheckCheck className="h-3 w-3" />
                Marcar todas
              </button>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {recent.length === 0 ? (
          <div className="p-6 text-center text-sm text-muted-foreground">
            <Bell className="h-8 w-8 mx-auto mb-2 opacity-20" />
            Nenhuma notificação
          </div>
        ) : (
          recent.map((n) => (
            <DropdownMenuItem
              key={n.id}
              className={cn(
                "flex items-start gap-2.5 px-3 py-2.5 cursor-pointer focus:bg-accent",
                !n.read && "bg-primary/5"
              )}
              onClick={() => markAsRead(n.id)}
            >
              <span className="mt-0.5 text-base shrink-0">{typeIcon[n.type] ?? "🔔"}</span>
              <div className="flex-1 min-w-0">
                <p className={cn("text-xs leading-snug line-clamp-2", !n.read && "font-semibold")}>
                  {n.title}
                </p>
                {n.description && (
                  <p className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">{n.description}</p>
                )}
                <p className="text-[10px] text-muted-foreground/60 mt-1">
                  {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: ptBR })}
                </p>
              </div>
              {!n.read && (
                <div className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1.5" />
              )}
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
