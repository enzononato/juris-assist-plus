import { useParams, Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { ArrowLeft, Shield, Edit, Trash2, Plus, X, Lock, RotateCcw, RefreshCw } from "lucide-react";
import EditarProcessoDialog from "@/components/processo/EditarProcessoDialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { statusLabels, taskStatusLabels, priorityLabels, type CaseStatus } from "@/data/mock";
import { useAuth } from "@/contexts/AuthContext";
import { useNotificationsContext } from "@/contexts/NotificationsContext";
import ProvasTab from "@/components/provas/ProvasTab";
import ChecklistsTab from "@/components/checklists/ChecklistsTab";
import TimelineTab from "@/components/timeline/TimelineTab";
import ProcessoResumoTab from "@/components/processo/ProcessoResumoTab";
import ProcessoAIResumoTab from "@/components/processo/ProcessoAIResumoTab";
import AndamentosTab from "@/components/processo/AndamentosTab";
import FinanceiroProcessoTab from "@/components/processo/FinanceiroProcessoTab";
import DocumentosProcessoTab from "@/components/processo/DocumentosProcessoTab";
import NovaAudienciaDialog from "@/components/processo/NovaAudienciaDialog";
import NovoPrazoDialog from "@/components/processo/NovoPrazoDialog";
import PacoteAudienciaDialog from "@/components/processo/PacoteAudienciaDialog";
import TasksTabContent from "@/components/processo/TasksTabContent";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const statusColors: Record<CaseStatus, string> = {
  novo: "bg-info/15 text-info",
  em_andamento: "bg-primary/10 text-primary",
  audiencia_marcada: "bg-warning/15 text-warning",
  sentenca: "bg-success/15 text-success",
  recurso: "bg-destructive/10 text-destructive",
  encerrado: "bg-muted text-muted-foreground",
};

export default function ProcessoDetalhe() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasRole, user } = useAuth();
  const { addNotification } = useNotificationsContext();
  const queryClient = useQueryClient();

  // ── Fetch case from Supabase ──
  const { data: caso, isLoading: loadingCase } = useQuery({
    queryKey: ["case-detail", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cases")
        .select("*, companies(name)")
        .eq("id", id!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // ── Fetch related data ──
  const { data: tasks = [] } = useQuery({
    queryKey: ["case-tasks", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("tasks").select("*").eq("case_id", id!).order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!id,
  });

  const { data: hearings = [] } = useQuery({
    queryKey: ["case-hearings", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("hearings").select("*").eq("case_id", id!).order("date", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!id,
  });

  const { data: deadlines = [] } = useQuery({
    queryKey: ["case-deadlines", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("deadlines").select("*").eq("case_id", id!).order("due_at", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!id,
  });

  const { data: evidenceRequests = [] } = useQuery({
    queryKey: ["case-evidence-requests", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("evidence_requests").select("*").eq("case_id", id!);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!id,
  });

  const { data: evidenceItems = [] } = useQuery({
    queryKey: ["case-evidence-items", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("evidence_items").select("*").eq("case_id", id!);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!id,
  });

  const { data: checklists = [] } = useQuery({
    queryKey: ["case-checklists", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("case_checklists").select("*").eq("case_id", id!);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!id,
  });

  const { data: timelineEvents = [] } = useQuery({
    queryKey: ["case-timeline", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("timeline_events").select("*").eq("case_id", id!).order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!id,
  });

  const [editStatus, setEditStatus] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  // Reabertura
  const [reopenOpen, setReopenOpen] = useState(false);
  const [reopenJustificativa, setReopenJustificativa] = useState("");

  const currentStatus = (caso?.status as CaseStatus) ?? "novo";
  const isEncerrado = currentStatus === "encerrado";

  const handleReopen = async () => {
    if (!reopenJustificativa.trim() || !caso) return;
    const { error } = await supabase.from("cases").update({
      status: "em_andamento" as any,
      reopened: true,
      reopened_at: new Date().toISOString(),
      reopened_reason: reopenJustificativa.trim(),
    }).eq("id", caso.id);
    if (error) { toast({ title: "Erro ao reabrir", description: error.message, variant: "destructive" }); return; }
    queryClient.invalidateQueries({ queryKey: ["case-detail", id] });
    queryClient.invalidateQueries({ queryKey: ["all-cases"] });
    setReopenOpen(false);
    setReopenJustificativa("");
    addNotification({
      title: "Processo reaberto",
      description: `O processo ${caso.case_number} foi reaberto. Motivo: ${reopenJustificativa.trim()}`,
      type: "sistema",
    });
    toast({ title: "Processo reaberto com sucesso", description: "Status alterado para Em Andamento." });
  };

  if (loadingCase) {
    return (
      <div className="p-4 md:p-6 lg:p-8 space-y-5 animate-in fade-in duration-500">
        {[1, 2, 3].map((i) => <div key={i} className="h-20 rounded-xl bg-muted/50 animate-pulse" />)}
      </div>
    );
  }

  if (!caso) return <div className="p-8 text-muted-foreground">Processo não encontrado.</div>;

  // Confidentiality check
  if (caso.confidentiality === "ultra_restrito" && !hasRole(["admin", "responsavel_juridico_interno"])) {
    return (
      <div className="p-8">
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-center">
          <Shield className="mx-auto mb-3 h-8 w-8 text-destructive" />
          <p className="text-sm font-semibold text-destructive">Acesso Restrito</p>
          <p className="text-xs text-muted-foreground mt-1">Este processo possui sigilo ultra restrito.</p>
          <Button variant="outline" size="sm" className="mt-4" asChild><Link to="/processos">Voltar</Link></Button>
        </div>
      </div>
    );
  }

  // Build a compat object for child components that expect the old Case shape
  const casoCompat = {
    ...caso,
    employee: caso.employee_name ?? "",
    company: (caso as any).companies?.name ?? "",
    branch: caso.branch ?? "",
    lawyer: caso.lawyer ?? "",
    theme: caso.theme ?? "",
    court: caso.court ?? "",
    responsible: caso.responsible ?? "",
    filed_at: caso.filed_at ?? caso.created_at,
    confidentiality: caso.confidentiality as 'normal' | 'restrito' | 'ultra_restrito',
  };

  const handleDelete = async () => {
    const { error } = await supabase.from("cases").delete().eq("id", caso.id);
    if (error) { toast({ title: "Erro ao excluir", description: error.message, variant: "destructive" }); return; }
    queryClient.invalidateQueries({ queryKey: ["all-cases"] });
    toast({ title: "Processo excluído com sucesso." });
    navigate("/processos");
  };

  const handleStatusChange = async (newStatus: string) => {
    const { error } = await supabase.from("cases").update({ status: newStatus as any }).eq("id", caso.id);
    if (error) { toast({ title: "Erro ao alterar status", description: error.message, variant: "destructive" }); return; }
    queryClient.invalidateQueries({ queryKey: ["case-detail", id] });
    queryClient.invalidateQueries({ queryKey: ["all-cases"] });
    setEditStatus(false);
    toast({ title: `Status alterado para ${statusLabels[newStatus as CaseStatus]}` });
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <Button variant="ghost" size="sm" asChild className="gap-1 text-muted-foreground">
            <Link to="/processos"><ArrowLeft className="h-4 w-4" /> Voltar</Link>
          </Button>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditDialogOpen(true)}>
              <Edit className="h-3.5 w-3.5" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Excluir processo?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação não pode ser desfeita. O processo {caso.case_number} e todos os dados relacionados serão removidos.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Excluir</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold">{caso.employee_name ?? "—"}</h1>
              {caso.confidentiality !== "normal" && (
                <Badge variant="outline" className="text-[9px] border-destructive/30 text-destructive gap-1">
                  <Shield className="h-2.5 w-2.5" />
                  {caso.confidentiality === "ultra_restrito" ? "Ultra Restrito" : "Restrito"}
                </Badge>
              )}
              {caso.reopened && (
                <Badge variant="outline" className="text-[9px] border-warning/40 bg-warning/10 text-warning gap-1">
                  <RefreshCw className="h-2.5 w-2.5" />
                  Reaberto
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{caso.case_number}</p>
            <p className="text-sm text-muted-foreground">{(caso as any).companies?.name ?? "—"}{caso.branch ? ` – ${caso.branch}` : ""}</p>
            {caso.amount != null && (
              <p className="text-sm font-semibold text-primary mt-0.5">
                Valor da causa: {Number(caso.amount).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {editStatus ? (
              <div className="flex items-center gap-1">
                <Select value={currentStatus} onValueChange={handleStatusChange}>
                  <SelectTrigger className="h-8 w-[160px] text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.entries(statusLabels) as [CaseStatus, string][]).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditStatus(false)}>
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            ) : (
              <Badge
                variant="outline"
                className={cn("cursor-pointer text-[10px]", statusColors[currentStatus])}
                onClick={() => setEditStatus(true)}
              >
                {statusLabels[currentStatus]}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Banner de modo leitura para processos encerrados */}
      {isEncerrado && (
        <div className="mb-4 flex items-start gap-3 rounded-xl border border-muted-foreground/20 bg-muted/40 px-4 py-3">
          <Lock className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-muted-foreground">Processo encerrado — modo leitura</p>
            <p className="text-xs text-muted-foreground/70 mt-0.5">
              Este processo foi encerrado. Não é possível criar novas tarefas, prazos ou audiências.
            </p>
          </div>
          <Button variant="outline" size="sm" className="gap-1.5 shrink-0 text-xs" onClick={() => setReopenOpen(true)}>
            <RotateCcw className="h-3.5 w-3.5" />
            Reabrir processo
          </Button>
        </div>
      )}

      {/* Dialog de reabertura */}
      <Dialog open={reopenOpen} onOpenChange={setReopenOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reabrir processo</DialogTitle>
            <DialogDescription>
              Informe o motivo da reabertura. Uma notificação será enviada para os responsáveis.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="rounded-lg border border-muted bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
              <span className="font-medium">{caso.case_number}</span> — {caso.employee_name}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="reopen-justificativa" className="text-sm">
                Justificativa <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="reopen-justificativa"
                placeholder="Descreva o motivo da reabertura..."
                className="min-h-[100px] resize-none text-sm"
                value={reopenJustificativa}
                onChange={(e) => setReopenJustificativa(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => { setReopenOpen(false); setReopenJustificativa(""); }}>
              Cancelar
            </Button>
            <Button size="sm" className="gap-1.5" disabled={!reopenJustificativa.trim()} onClick={handleReopen}>
              <RotateCcw className="h-3.5 w-3.5" />
              Confirmar reabertura
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Tabs defaultValue="resumo">
        <TabsList className="mb-4 w-full justify-start overflow-x-auto">
          <TabsTrigger value="resumo">Resumo</TabsTrigger>
          <TabsTrigger value="resumo-ia">Resumo IA</TabsTrigger>
          <TabsTrigger value="andamentos">Andamentos</TabsTrigger>
          <TabsTrigger value="timeline">Timeline ({timelineEvents.length})</TabsTrigger>
          <TabsTrigger value="prazos">Prazos ({deadlines.length})</TabsTrigger>
          <TabsTrigger value="audiencias">Audiências ({hearings.length})</TabsTrigger>
          <TabsTrigger value="tarefas">Tarefas ({tasks.length})</TabsTrigger>
          <TabsTrigger value="provas">Provas ({evidenceRequests.length})</TabsTrigger>
          <TabsTrigger value="financeiro">Financeiro</TabsTrigger>
          <TabsTrigger value="documentos">Documentos</TabsTrigger>
          <TabsTrigger value="checklists">Checklists ({checklists.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="resumo">
          <ProcessoResumoTab caso={casoCompat as any} />
        </TabsContent>

        <TabsContent value="resumo-ia">
          <ProcessoAIResumoTab caso={casoCompat as any} />
        </TabsContent>

        <TabsContent value="andamentos">
          <AndamentosTab caseId={id!} caseNumber={caso.case_number} />
        </TabsContent>

        <TabsContent value="timeline">
          <TimelineTab events={timelineEvents as any} />
        </TabsContent>

        <TabsContent value="prazos">
          <div className="space-y-3">
            {!isEncerrado && (
              <div className="flex justify-end">
                <NovoPrazoDialog caseId={id} />
              </div>
            )}
            {isEncerrado && (
              <div className="flex items-center gap-2 rounded-lg border border-dashed border-muted-foreground/30 bg-muted/20 px-4 py-2.5">
                <Lock className="h-3.5 w-3.5 text-muted-foreground/60" />
                <p className="text-xs text-muted-foreground/70">Criação de prazos bloqueada para processos encerrados.</p>
              </div>
            )}
            {deadlines.length === 0 && <p className="text-sm text-muted-foreground">Nenhum prazo cadastrado.</p>}
            {deadlines.map((d) => (
              <div key={d.id} className={cn("flex items-center gap-3 rounded-lg border bg-card p-4", isEncerrado && "opacity-75")}>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{d.title}</p>
                  <p className="text-xs text-muted-foreground">Vencimento: {new Date(d.due_at).toLocaleDateString("pt-BR")}</p>
                  <Badge variant="outline" className="mt-2 text-[10px]">{d.status}</Badge>
                </div>
                {!isEncerrado && (
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => toast({ title: "Prazo atualizado com sucesso." })}>
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => toast({ title: "Prazo excluído com sucesso." })}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="audiencias">
          <div className="space-y-3">
            {!isEncerrado && (
              <div className="flex justify-end gap-2">
                <NovaAudienciaDialog caseId={id} />
              </div>
            )}
            {isEncerrado && (
              <div className="flex items-center gap-2 rounded-lg border border-dashed border-muted-foreground/30 bg-muted/20 px-4 py-2.5">
                <Lock className="h-3.5 w-3.5 text-muted-foreground/60" />
                <p className="text-xs text-muted-foreground/70">Criação de audiências bloqueada para processos encerrados.</p>
              </div>
            )}
            {hearings.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma audiência cadastrada.</p>}
            {hearings.map((h) => (
              <div key={h.id} className={cn("rounded-lg border bg-card p-4", isEncerrado && "opacity-75")}>
                <div className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{h.type ?? "Audiência"}</p>
                    <p className="text-xs text-muted-foreground">{new Date(h.date).toLocaleDateString("pt-BR")} às {h.time ?? "—"}</p>
                    <p className="text-xs text-muted-foreground">{h.court ?? ""}</p>
                    <Badge variant="outline" className="mt-2 text-[10px]">{h.status}</Badge>
                  </div>
                  <div className="flex items-center gap-1">
                    <PacoteAudienciaDialog hearing={h as any} evidenceItems={evidenceItems as any} checklists={checklists as any} />
                    {!isEncerrado && (
                      <>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => toast({ title: "Audiência atualizada com sucesso." })}>
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => toast({ title: "Audiência excluída com sucesso." })}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="tarefas">
          <TasksTabContent
            tasks={tasks}
            isEncerrado={isEncerrado}
            userRole={user?.role}
            currentUserName={user?.name ?? ""}
            onTaskUpdated={() => queryClient.invalidateQueries({ queryKey: ["case-tasks", id] })}
          />
        </TabsContent>

        <TabsContent value="provas">
          <ProvasTab requests={evidenceRequests as any} items={evidenceItems as any} caseId={id} />
        </TabsContent>

        <TabsContent value="financeiro">
          <FinanceiroProcessoTab caseId={id!} />
        </TabsContent>

        <TabsContent value="documentos">
          <DocumentosProcessoTab caseId={id!} caseData={casoCompat as any} />
        </TabsContent>

        <TabsContent value="checklists">
          <ChecklistsTab checklists={checklists as any} />
        </TabsContent>
      </Tabs>

      <EditarProcessoDialog
        caso={casoCompat as any}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onUpdated={() => queryClient.invalidateQueries({ queryKey: ["case-detail", id] })}
      />
    </div>
  );
}
