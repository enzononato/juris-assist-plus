import { WifiOff, Wifi, RefreshCw } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useOfflineProcessos } from "@/hooks/useOfflineProcessos";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function OfflineIndicator() {
  const { isOnline, isOfflineMode, caseCount, lastSyncAt, syncNow } = useOfflineProcessos();

  if (isOnline) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button onClick={syncNow} className="flex items-center gap-1 text-[10px] text-success font-medium hover:opacity-80 transition-opacity">
              <Wifi className="h-3 w-3" />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">Online · {caseCount} processos em cache</p>
            {lastSyncAt && <p className="text-[10px] text-muted-foreground">Sync: {formatDistanceToNow(new Date(lastSyncAt), { addSuffix: true, locale: ptBR })}</p>}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <Badge variant="outline" className="gap-1 text-[10px] border-warning/30 bg-warning/10 text-warning animate-pulse">
      <WifiOff className="h-3 w-3" />
      Offline · {caseCount} processos
    </Badge>
  );
}
