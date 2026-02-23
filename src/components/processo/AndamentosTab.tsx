import { useState } from "react";
import { RefreshCw, Scale, Clock, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useNotifications } from "@/hooks/useNotifications";
import { useNotificationsContext } from "@/contexts/NotificationsContext";

interface AndamentosTabProps {
  caseId: string;
  caseNumber: string;
}

export default function AndamentosTab({ caseId, caseNumber }: AndamentosTabProps) {
  const [syncing, setSyncing] = useState(false);
  const queryClient = useQueryClient();
  const { sendNotification } = useNotifications();
  const { addNotification } = useNotificationsContext();

  const { data: movements, isLoading } = useQuery({
    queryKey: ["case-movements", caseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("case_movements")
        .select("*")
        .eq("case_id", caseId)
        .order("movement_date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: syncLog } = useQuery({
    queryKey: ["case-sync-log", caseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("case_sync_log")
        .select("*")
        .eq("case_id", caseId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const handleSync = async () => {
    setSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke("fetch-movements", {
        body: { case_id: caseId },
      });
      if (error) throw error;
      const result = data?.results?.[0];
      const newCount = result?.new_movements ?? 0;
      if (newCount > 0) {
        toast({ title: `${newCount} novo(s) andamento(s) encontrado(s)!` });
        sendNotification(`⚖️ ${newCount} novo(s) andamento(s)`, {
          body: `Processo ${caseNumber}: ${newCount} novos andamentos encontrados no DataJud.`,
          tag: `mov-${caseId}-${Date.now()}`,
        });
        addNotification({
          title: `${newCount} novo(s) andamento(s) no processo ${caseNumber}`,
          description: `Sincronização detectou ${newCount} novos andamentos processuais via DataJud.`,
          type: "alerta",
        });
      } else {
        toast({ title: "Nenhum novo andamento encontrado.", description: "Tudo atualizado." });
      }
      queryClient.invalidateQueries({ queryKey: ["case-movements", caseId] });
      queryClient.invalidateQueries({ queryKey: ["case-sync-log", caseId] });
    } catch (err) {
      console.error(err);
      toast({ title: "Erro ao sincronizar", description: "Tente novamente em alguns minutos.", variant: "destructive" });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Scale className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">Andamentos Processuais</h3>
          <Badge variant="secondary" className="text-[10px]">DataJud/CNJ</Badge>
        </div>
        <div className="flex items-center gap-2">
          {syncLog?.last_synced_at && (
            <span className="text-[10px] text-muted-foreground">
              Última sincronização: {format(new Date(syncLog.last_synced_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
            </span>
          )}
          <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={handleSync} disabled={syncing}>
            <RefreshCw className={`h-3.5 w-3.5 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "Sincronizando..." : "Atualizar"}
          </Button>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 rounded-lg bg-muted/50 animate-pulse" />
          ))}
        </div>
      ) : !movements || movements.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <AlertCircle className="h-8 w-8 text-muted-foreground/50 mb-3" />
          <p className="text-sm font-medium text-muted-foreground">Nenhum andamento encontrado</p>
          <p className="text-xs text-muted-foreground/70 mt-1">
            Clique em "Atualizar" para buscar andamentos no DataJud para o processo {caseNumber}.
          </p>
        </div>
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-[17px] top-2 bottom-2 w-px bg-border" />

          <div className="space-y-1">
            {movements.map((mov, i) => (
              <div key={mov.id} className="relative flex gap-3 py-2">
                {/* Dot */}
                <div className="relative z-10 mt-1.5 flex h-[9px] w-[9px] shrink-0 items-center justify-center rounded-full bg-primary ring-2 ring-background ml-[13px]" />
                {/* Content */}
                <div className="flex-1 min-w-0 rounded-lg border bg-card p-3 hover:bg-accent/30 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium leading-tight">{mov.title}</p>
                    <div className="flex items-center gap-1 shrink-0">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                        {format(new Date(mov.movement_date), "dd/MM/yyyy", { locale: ptBR })}
                      </span>
                    </div>
                  </div>
                  {mov.description && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{mov.description}</p>
                  )}
                  {mov.court && (
                    <Badge variant="outline" className="mt-1.5 text-[9px]">{mov.court}</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
