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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  mockCases, mockTasks, mockHearings, mockDeadlines,
  mockEvidenceRequests, mockEvidenceItems, mockCaseChecklists,
  mockResponsaveis, mockTimelineEvents,
  statusLabels, taskStatusLabels, priorityLabels,
  type CaseStatus,
} from "@/data/mock";
import { useAuth } from "@/contexts/AuthContext";
import { useNotificationsContext } from "@/contexts/NotificationsContext";
import ProvasTab from "@/components/provas/ProvasTab";
import ChecklistsTab from "@/components/checklists/ChecklistsTab";
import TimelineTab from "@/components/timeline/TimelineTab";
import ProcessoResumoTab from "@/components/processo/ProcessoResumoTab";
import ProcessoAIResumoTab from "@/components/processo/ProcessoAIResumoTab";
import AndamentosTab from "@/components/processo/AndamentosTab";
import FinanceiroProcessoTab from "@/components/processo/FinanceiroProcessoTab";
import NovaAudienciaDialog from "@/components/processo/NovaAudienciaDialog";
import NovoPrazoDialog from "@/components/processo/NovoPrazoDialog";
import PacoteAudienciaDialog from "@/components/processo/PacoteAudienciaDialog";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

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
  const { canAccessCompany, hasRole } = useAuth();
  const { addNotification } = useNotificationsContext();

  const caso = mockCases.find((c) => c.id === id);

  const [editStatus, setEditStatus] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<CaseStatus>(caso?.status ?? "novo");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [, forceUpdate] = useState(0);
  const isEncerrado = currentStatus === "encerrado";

  // Reabertura
  const [reopenOpen, setReopenOpen] = useState(false);
  const [reopenJustificativa, setReopenJustificativa] = useState("");
  const [reopenInfo, setReopenInfo] = useState<{ date: string; justificativa: string } | null>(null);

  const handleReopen = () => {
    if (!reopenJustificativa.trim()) return;
    const justificativa = reopenJustificativa.trim();
    const now = new Date();
    // Mutate mock data so status persists across re-renders/remounts
    const mockCase = mockCases.find((c) => c.id === id);
    if (mockCase) {
      mockCase.status = "em_andamento";
      mockCase.reopened = true;
      mockCase.reopenedAt = now.toISOString();
      mockCase.reopenedReason = justificativa;
    }
    setCurrentStatus("em_andamento");
    setReopenOpen(false);
    setReopenJustificativa("");
    setReopenInfo({
      date: now.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }),
      justificativa,
    });
    addNotification({
      title: "Processo reaberto",
      description: `O processo ${caso?.case_number} (${caso?.employee}) foi reaberto. Motivo: ${justificativa}`,
      type: "sistema",
    });
    toast({ title: "Processo reaberto com sucesso", description: "Status alterado para Em Andamento." });
  };

  if (!caso) return <div className="p-8 text-muted-foreground">Processo não encontrado.</div>;

  // ACL check
  if (!canAccessCompany(caso.company_id)) {
    return <div className="p-8 text-muted-foreground">Você não tem permissão para acessar este processo.</div>;
  }

  // Confidentiality check
  if (caso.confidentiality === "ultra_restrito" && !hasRole(["admin", "responsavel_juridico_interno"])) {
    return (
      <div className="p-8">
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-center">
          <Shield className="mx-auto mb-3 h-8 w-8 text-destructive" />
          <p className="text-sm font-semibold text-destructive">Acesso Restrito</p>
          <p className="text-xs text-muted-foreground mt-1">Este processo possui sigilo ultra restrito. Apenas administradores e responsáveis jurídicos internos podem visualizá-lo.</p>
          <Button variant="outline" size="sm" className="mt-4" asChild><Link to="/processos">Voltar</Link></Button>
        </div>
      </div>
    );
  }

  const tasks = mockTasks.filter((t) => t.case_id === id);
  const hearings = mockHearings.filter((h) => h.case_id === id);
  const deadlines = mockDeadlines.filter((d) => d.case_id === id);
  const evidenceRequests = mockEvidenceRequests.filter((r) => r.case_id === id);
  const evidenceItems = mockEvidenceItems.filter((i) => i.case_id === id);
  const checklists = mockCaseChecklists.filter((c) => c.case_id === id);
  const timelineEvents = mockTimelineEvents.filter((e) => e.case_id === id);

  const handleDelete = () => {
    toast({ title: "Processo excluído com sucesso." });
    navigate("/processos");
  };

  const handleStatusChange = (newStatus: string) => {
    // Mutate mock data so status persists across re-renders/remounts
    const mockCase = mockCases.find((c) => c.id === id);
    if (mockCase) mockCase.status = newStatus as CaseStatus;
    setCurrentStatus(newStatus as CaseStatus);
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
              <h1 className="text-xl font-bold">{caso.employee}</h1>
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
            <p className="text-sm text-muted-foreground">{caso.company} – {caso.branch}</p>
            {caso.amount != null && (
              <p className="text-sm font-semibold text-primary mt-0.5">
                Valor da causa: {caso.amount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
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
              Este processo foi encerrado. Não é possível criar novas tarefas, prazos ou audiências. Apenas o histórico pode ser consultado.
            </p>
          </div>
          <Button variant="outline" size="sm" className="gap-1.5 shrink-0 text-xs" onClick={() => setReopenOpen(true)}>
            <RotateCcw className="h-3.5 w-3.5" />
            Reabrir processo
          </Button>
        </div>
      )}

      {/* Banner de reabertura — exibido após reabrir o processo */}
      {reopenInfo && !isEncerrado && (
        <div className="mb-4 flex items-start gap-3 rounded-xl border border-success/30 bg-success/5 px-4 py-3">
          <RotateCcw className="mt-0.5 h-4 w-4 shrink-0 text-success" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-success">Processo reaberto</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Reaberto em <span className="font-medium">{reopenInfo.date}</span> — Motivo: {reopenInfo.justificativa}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 shrink-0 text-muted-foreground hover:text-foreground"
            onClick={() => setReopenInfo(null)}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}

      {/* Dialog de reabertura — fora do banner condicional para não ser desmontado */}
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
              <span className="font-medium">{caso.case_number}</span> — {caso.employee}
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
              {reopenJustificativa.trim() === "" && (
                <p className="text-xs text-muted-foreground">Campo obrigatório.</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => { setReopenOpen(false); setReopenJustificativa(""); }}>
              Cancelar
            </Button>
            <Button
              size="sm"
              className="gap-1.5"
              disabled={!reopenJustificativa.trim()}
              onClick={handleReopen}
            >
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
          <TabsTrigger value="checklists">Checklists ({checklists.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="resumo">
          <ProcessoResumoTab caso={caso} />
        </TabsContent>

        <TabsContent value="resumo-ia">
          <ProcessoAIResumoTab caso={caso} />
        </TabsContent>

        <TabsContent value="andamentos">
          <AndamentosTab caseId={id!} caseNumber={caso.case_number} />
        </TabsContent>

        <TabsContent value="timeline">
          <TimelineTab events={timelineEvents} />
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
                    <p className="text-sm font-medium">{h.type}</p>
                    <p className="text-xs text-muted-foreground">{new Date(h.date).toLocaleDateString("pt-BR")} às {h.time}</p>
                    <p className="text-xs text-muted-foreground">{h.court}</p>
                    <Badge variant="outline" className="mt-2 text-[10px]">{h.status}</Badge>
                  </div>
                  <div className="flex items-center gap-1">
                    <PacoteAudienciaDialog hearing={h} evidenceItems={evidenceItems} checklists={checklists} />
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
          <div className="space-y-3">
            {!isEncerrado ? (
              <div className="flex justify-end">
                <Button size="sm" variant="outline" className="gap-1.5 text-xs" asChild>
                  <Link to="/tarefas/nova"><Plus className="h-3.5 w-3.5" /> Nova Tarefa</Link>
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2 rounded-lg border border-dashed border-muted-foreground/30 bg-muted/20 px-4 py-2.5">
                <Lock className="h-3.5 w-3.5 text-muted-foreground/60" />
                <p className="text-xs text-muted-foreground/70">Criação de tarefas bloqueada para processos encerrados.</p>
              </div>
            )}
            {tasks.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma tarefa vinculada.</p>}
            {tasks.map((t) => (
              <div key={t.id} className={cn("flex items-center gap-3 rounded-lg border bg-card p-4", isEncerrado && "opacity-75")}>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{t.title}</p>
                  <div className="mt-1 flex flex-wrap gap-2">
                    <Badge variant="outline" className="text-[10px]">{taskStatusLabels[t.status]}</Badge>
                    <Badge variant="secondary" className="text-[10px]">{priorityLabels[t.priority]}</Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{t.assignees.join(", ")}</p>
                </div>
                {!isEncerrado && (
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => toast({ title: "Tarefa atualizada com sucesso." })}>
                      <Edit className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="provas">
          <ProvasTab requests={evidenceRequests} items={evidenceItems} caseId={id} />
        </TabsContent>

        <TabsContent value="financeiro">
          <FinanceiroProcessoTab caseId={id!} />
        </TabsContent>

        <TabsContent value="checklists">
          <ChecklistsTab checklists={checklists} />
        </TabsContent>
      </Tabs>

      <EditarProcessoDialog
        caso={caso}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onUpdated={() => forceUpdate((n) => n + 1)}
      />
    </div>
  );
}
