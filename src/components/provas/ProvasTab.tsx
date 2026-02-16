import { useState } from "react";
import {
  Plus, FileText, Upload, Clock, AlertTriangle, CheckCircle2, XCircle,
  Filter, Download, Eye, Shield, Hash, ChevronDown, ChevronUp,
  History, Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import {
  type EvidenceRequest, type EvidenceItem, type EvidenceCategory, type EvidenceOrigin,
  type DownloadLog,
  evidenceCategoryLabels, evidenceOriginLabels, mockDownloadLogs, mockCases,
} from "@/data/mock";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

const requestStatusStyles: Record<string, string> = {
  aberta: "bg-info/15 text-info",
  parcialmente_atendida: "bg-warning/15 text-warning",
  atendida: "bg-success/15 text-success",
  atrasada: "bg-destructive/10 text-destructive",
};
const requestStatusLabels: Record<string, string> = {
  aberta: "Aberta",
  parcialmente_atendida: "Parcial",
  atendida: "Atendida",
  atrasada: "Atrasada",
};
const itemStatusIcons: Record<string, React.ReactNode> = {
  pendente: <Clock className="h-3.5 w-3.5 text-muted-foreground" />,
  recebido: <Upload className="h-3.5 w-3.5 text-info" />,
  validado: <CheckCircle2 className="h-3.5 w-3.5 text-success" />,
  recusado: <XCircle className="h-3.5 w-3.5 text-destructive" />,
};
const itemStatusLabels: Record<string, string> = {
  pendente: "Pendente", recebido: "Recebido", validado: "Validado", recusado: "Recusado",
};

function getSlaStatus(request: EvidenceRequest) {
  const now = new Date(2026, 1, 16, 12, 0, 0); // mock current time
  const due = new Date(request.due_at);
  const created = new Date(request.created_at);
  const total = due.getTime() - created.getTime();
  const elapsed = now.getTime() - created.getTime();
  const remaining = due.getTime() - now.getTime();
  const percent = Math.min(100, Math.max(0, (elapsed / total) * 100));
  const hoursLeft = Math.max(0, remaining / 3600000);

  if (request.status === "atendida") return { label: "Concluído", percent: 100, color: "bg-success", hoursLeft: 0 };
  if (now > due) return { label: "SLA Estourado", percent: 100, color: "bg-destructive", hoursLeft: 0 };
  if (hoursLeft <= 24) return { label: `${Math.round(hoursLeft)}h restantes – Em Risco`, percent, color: "bg-destructive", hoursLeft };
  if (hoursLeft <= 48) return { label: `${Math.round(hoursLeft)}h restantes – Atenção`, percent, color: "bg-warning", hoursLeft };
  return { label: `${Math.round(hoursLeft)}h restantes`, percent, color: "bg-success", hoursLeft };
}

interface Props {
  requests: EvidenceRequest[];
  items: EvidenceItem[];
  caseId?: string;
}

export default function ProvasTab({ requests, items, caseId }: Props) {
  const [uploadOpen, setUploadOpen] = useState(false);
  const [newRequestOpen, setNewRequestOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState("solicitacoes");
  const [categoryFilter, setCategoryFilter] = useState<string>("todas");
  const [originFilter, setOriginFilter] = useState<string>("todas");
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const [showFilters, setShowFilters] = useState(false);
  const [expandedRequest, setExpandedRequest] = useState<string | null>(null);
  const [downloadLogOpen, setDownloadLogOpen] = useState(false);
  const [selectedItemForLog, setSelectedItemForLog] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const caso = caseId ? mockCases.find((c) => c.id === caseId) : undefined;
  const isConfidential = caso && caso.confidentiality !== "normal";

  // Filter items
  const filteredItems = items.filter((i) => {
    if (categoryFilter !== "todas" && i.category !== categoryFilter) return false;
    if (originFilter !== "todas" && i.origin !== originFilter) return false;
    if (statusFilter !== "todos" && i.status !== statusFilter) return false;
    if (searchQuery && !i.filename.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const activeFilters = (categoryFilter !== "todas" ? 1 : 0) + (originFilter !== "todas" ? 1 : 0) + (statusFilter !== "todos" ? 1 : 0);

  const handleDownload = (item: EvidenceItem) => {
    if (isConfidential) {
      toast({
        title: "📄 Download com marca d'água",
        description: `Arquivo "${item.filename}" baixado com marca d'água (Ana Jurídico · ${new Date().toLocaleString("pt-BR")}). Registrado no log de auditoria.`,
      });
    } else {
      toast({
        title: "📥 Download iniciado",
        description: `"${item.filename}" (${item.file_size}) — Demo, sem backend.`,
      });
    }
  };

  const logsForItem = selectedItemForLog
    ? mockDownloadLogs.filter((l) => l.evidence_item_id === selectedItemForLog)
    : [];

  return (
    <div className="space-y-4">
      {/* Header with tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <TabsList>
            <TabsTrigger value="solicitacoes" className="text-xs">
              Solicitações ({requests.length})
            </TabsTrigger>
            <TabsTrigger value="evidencias" className="text-xs">
              Evidências ({items.length})
            </TabsTrigger>
            <TabsTrigger value="logs" className="text-xs">
              Log de Downloads
            </TabsTrigger>
          </TabsList>
          <div className="flex gap-2">
            {selectedTab === "solicitacoes" && (
              <Dialog open={newRequestOpen} onOpenChange={setNewRequestOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline" className="gap-1.5 text-xs">
                    <Plus className="h-3.5 w-3.5" /> Nova Solicitação
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader><DialogTitle>Criar Solicitação de Prova</DialogTitle></DialogHeader>
                  <NewRequestForm onClose={() => setNewRequestOpen(false)} />
                </DialogContent>
              </Dialog>
            )}
            {selectedTab === "evidencias" && (
              <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-1.5 text-xs">
                    <Upload className="h-3.5 w-3.5" /> Anexar Prova
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader><DialogTitle>Anexar Nova Evidência</DialogTitle></DialogHeader>
                  <UploadForm requests={requests} onClose={() => setUploadOpen(false)} />
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        {/* ===== SOLICITAÇÕES ===== */}
        <TabsContent value="solicitacoes" className="mt-4">
          {requests.length === 0 ? (
            <EmptyState icon={<FileText />} text="Nenhuma solicitação de prova criada." />
          ) : (
            <div className="space-y-3">
              {requests.map((r) => {
                const sla = getSlaStatus(r);
                const reqItems = items.filter((i) => i.request_id === r.id);
                const expanded = expandedRequest === r.id;
                return (
                  <div key={r.id} className="rounded-xl border bg-card overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-semibold">{r.theme}</p>
                            <Badge className={cn("border-0 text-[10px]", requestStatusStyles[r.status])}>
                              {requestStatusLabels[r.status]}
                            </Badge>
                            {sla.color === "bg-destructive" && (
                              <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
                            )}
                          </div>
                          <p className="mt-1 text-xs text-muted-foreground">{r.description}</p>
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {r.assigned_areas.map((a) => (
                              <Badge key={a} variant="secondary" className="text-[10px]">{a}</Badge>
                            ))}
                            <span className="text-[11px] text-muted-foreground">· {r.assigned_users.join(", ")}</span>
                          </div>
                        </div>
                        <button onClick={() => setExpandedRequest(expanded ? null : r.id)} className="shrink-0 text-muted-foreground hover:text-foreground">
                          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </button>
                      </div>

                      {/* SLA Bar */}
                      <div className="mt-3">
                        <div className="mb-1 flex items-center justify-between text-[11px]">
                          <span className="text-muted-foreground">SLA ({r.sla_hours}h)</span>
                          <span className={cn("font-medium",
                            sla.color === "bg-destructive" ? "text-destructive" :
                            sla.color === "bg-warning" ? "text-warning" : "text-success"
                          )}>{sla.label}</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                          <div className={cn("h-full rounded-full transition-all", sla.color)} style={{ width: `${sla.percent}%` }} />
                        </div>
                        <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
                          <span>Criado: {new Date(r.created_at).toLocaleDateString("pt-BR")} {new Date(r.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>
                          <span>Prazo: {new Date(r.due_at).toLocaleDateString("pt-BR")} {new Date(r.due_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>
                        </div>
                      </div>
                    </div>

                    {/* Expanded: show items */}
                    {expanded && (
                      <div className="border-t bg-muted/30 p-4 animate-in fade-in duration-200">
                        <p className="mb-2 text-[11px] font-semibold text-muted-foreground">
                          {reqItems.length} evidência(s) vinculada(s)
                        </p>
                        {reqItems.length === 0 ? (
                          <p className="text-xs text-muted-foreground italic">Nenhuma evidência anexada ainda.</p>
                        ) : (
                          <div className="space-y-1.5">
                            {reqItems.map((item) => (
                              <EvidenceRow key={item.id} item={item} onDownload={handleDownload} isConfidential={isConfidential} onShowLog={(id) => { setSelectedItemForLog(id); setDownloadLogOpen(true); }} />
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* ===== EVIDÊNCIAS ===== */}
        <TabsContent value="evidencias" className="mt-4">
          {/* Filters */}
          <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar arquivo..."
                className="h-8 pl-8 text-xs"
              />
            </div>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="h-3.5 w-3.5" /> Filtros
              {activeFilters > 0 && <Badge className="ml-1 h-4 min-w-4 rounded-full bg-primary px-1 text-[9px] text-primary-foreground">{activeFilters}</Badge>}
            </Button>
          </div>

          {showFilters && (
            <div className="mb-3 flex flex-wrap gap-2 rounded-xl border bg-card p-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[160px] h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas categorias</SelectItem>
                  {Object.entries(evidenceCategoryLabels).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={originFilter} onValueChange={setOriginFilter}>
                <SelectTrigger className="w-[150px] h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas origens</SelectItem>
                  {Object.entries(evidenceOriginLabels).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[130px] h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos status</SelectItem>
                  {Object.entries(itemStatusLabels).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {activeFilters > 0 && (
                <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => { setCategoryFilter("todas"); setOriginFilter("todas"); setStatusFilter("todos"); }}>
                  Limpar
                </Button>
              )}
            </div>
          )}

          {filteredItems.length === 0 ? (
            <EmptyState icon={<FileText />} text="Nenhuma evidência encontrada." />
          ) : (
            <div className="space-y-2">
              {filteredItems.map((item) => (
                <EvidenceRow key={item.id} item={item} onDownload={handleDownload} isConfidential={isConfidential} showDetails onShowLog={(id) => { setSelectedItemForLog(id); setDownloadLogOpen(true); }} />
              ))}
            </div>
          )}
        </TabsContent>

        {/* ===== LOGS ===== */}
        <TabsContent value="logs" className="mt-4">
          <DownloadLogsView items={items} />
        </TabsContent>
      </Tabs>

      {/* Download log dialog */}
      <Dialog open={downloadLogOpen} onOpenChange={setDownloadLogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="h-4 w-4" /> Log de Downloads
            </DialogTitle>
          </DialogHeader>
          {logsForItem.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">Nenhum download registrado.</p>
          ) : (
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {logsForItem.map((log) => (
                <div key={log.id} className="flex items-center gap-3 rounded-lg border p-3">
                  <Download className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium">{log.user}</p>
                    <p className="text-[10px] text-muted-foreground">{new Date(log.downloaded_at).toLocaleString("pt-BR")}</p>
                  </div>
                  {log.watermarked && (
                    <Badge className="text-[9px] bg-warning/15 text-warning border-0">
                      <Shield className="mr-0.5 h-2.5 w-2.5" /> Marca d'água
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ===== SUB-COMPONENTS =====

function EvidenceRow({ item, onDownload, isConfidential, showDetails, onShowLog }: {
  item: EvidenceItem;
  onDownload: (i: EvidenceItem) => void;
  isConfidential?: boolean;
  showDetails?: boolean;
  onShowLog: (id: string) => void;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border bg-card p-3 transition-colors hover:bg-accent/20">
      <FileText className="h-4 w-4 shrink-0 text-primary" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{item.filename}</p>
        <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
          <span>{evidenceCategoryLabels[item.category]}</span>
          <span>·</span>
          <span>{evidenceOriginLabels[item.origin]}</span>
          <span>·</span>
          <span>{item.file_size}</span>
        </div>
        {showDetails && (
          <div className="mt-0.5 text-[10px] text-muted-foreground">
            Enviado por {item.uploaded_by} em {new Date(item.uploaded_at).toLocaleDateString("pt-BR")}
            {item.fact_date && ` · Fato: ${new Date(item.fact_date).toLocaleDateString("pt-BR")}`}
          </div>
        )}
        {item.sha256 && showDetails && (
          <div className="mt-0.5 flex items-center gap-1 text-[9px] text-muted-foreground/60">
            <Hash className="h-2.5 w-2.5" />
            <span className="font-mono truncate max-w-[200px]">{item.sha256.slice(0, 16)}...</span>
          </div>
        )}
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <span className="flex items-center gap-1 text-[10px]">
          {itemStatusIcons[item.status]}
          <span className="hidden sm:inline">{itemStatusLabels[item.status]}</span>
        </span>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onShowLog(item.id)} title="Log de downloads">
          <History className="h-3.5 w-3.5" />
        </Button>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onDownload(item)} title="Download">
          <Download className="h-3.5 w-3.5" />
          {isConfidential && <Shield className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 text-warning" />}
        </Button>
      </div>
    </div>
  );
}

function DownloadLogsView({ items }: { items: EvidenceItem[] }) {
  const allLogs = mockDownloadLogs
    .map((log) => ({ ...log, item: items.find((i) => i.id === log.evidence_item_id) }))
    .filter((l) => l.item)
    .sort((a, b) => new Date(b.downloaded_at).getTime() - new Date(a.downloaded_at).getTime());

  if (allLogs.length === 0) {
    return <EmptyState icon={<History />} text="Nenhum download registrado." />;
  }

  return (
    <div className="space-y-2">
      {allLogs.map((log) => (
        <div key={log.id} className="flex items-center gap-3 rounded-lg border bg-card p-3">
          <Download className="h-4 w-4 shrink-0 text-muted-foreground" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium truncate">{log.item!.filename}</p>
            <p className="text-[11px] text-muted-foreground">
              {log.user} · {new Date(log.downloaded_at).toLocaleString("pt-BR")}
            </p>
          </div>
          {log.watermarked && (
            <Badge className="text-[9px] bg-warning/15 text-warning border-0 shrink-0">
              <Shield className="mr-0.5 h-2.5 w-2.5" /> Marca d'água
            </Badge>
          )}
        </div>
      ))}
    </div>
  );
}

function EmptyState({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed p-12 text-center">
      <span className="text-muted-foreground/40 [&>svg]:h-8 [&>svg]:w-8">{icon}</span>
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  );
}

function NewRequestForm({ onClose }: { onClose: () => void }) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: "Solicitação criada", description: "Tarefas geradas para as áreas responsáveis e alertas de SLA agendados. (Demo)" });
    onClose();
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <Label>Processo *</Label>
        <Select><SelectTrigger><SelectValue placeholder="Selecione o processo..." /></SelectTrigger>
          <SelectContent>
            {mockCases.map((c) => <SelectItem key={c.id} value={c.id}>{c.employee} – {c.case_number}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Tema da solicitação *</Label>
        <Select><SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
          <SelectContent>
            <SelectItem value="jornada">Jornada de Trabalho</SelectItem>
            <SelectItem value="assedio">Assédio Moral</SelectItem>
            <SelectItem value="fgts">FGTS</SelectItem>
            <SelectItem value="verbas">Verbas Rescisórias</SelectItem>
            <SelectItem value="rescisao">Rescisão Indireta</SelectItem>
            <SelectItem value="outro">Outro</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Descrição</Label>
        <Textarea placeholder="Descreva as provas necessárias..." rows={3} />
      </div>
      <div className="space-y-2">
        <Label>Áreas responsáveis *</Label>
        <div className="flex flex-wrap gap-2">
          {["DP", "RH", "VENDAS", "LOGÍSTICA", "FROTA"].map((area) => (
            <label key={area} className="flex items-center gap-1.5 text-xs">
              <Checkbox /> {area}
            </label>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <Label>Usuários específicos</Label>
        <Input placeholder="Buscar usuário..." />
      </div>
      <div className="space-y-2">
        <Label>Prazo SLA (horas)</Label>
        <Input type="number" defaultValue={72} min={1} />
      </div>
      <div className="rounded-lg border border-dashed bg-muted/30 p-3">
        <p className="text-xs text-muted-foreground">
          ✅ Ao criar, o sistema irá: gerar checklist de provas, criar tarefas para as áreas, agendar alertas (48h e 72h).
        </p>
      </div>
      <Button type="submit" className="w-full">Criar Solicitação</Button>
    </form>
  );
}

function UploadForm({ requests, onClose }: { requests: EvidenceRequest[]; onClose: () => void }) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: "Evidência anexada", description: "Hash SHA-256 gerado e metadados salvos. (Demo)" });
    onClose();
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <Label>Arquivo *</Label>
        <div className="rounded-lg border-2 border-dashed p-6 text-center hover:bg-accent/20 transition-colors cursor-pointer">
          <Upload className="mx-auto h-6 w-6 text-muted-foreground mb-2" />
          <p className="text-xs text-muted-foreground">Arraste ou clique para selecionar</p>
          <Input type="file" className="hidden" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Categoria *</Label>
          <Select><SelectTrigger className="text-xs"><SelectValue placeholder="Selecione..." /></SelectTrigger>
            <SelectContent>
              {Object.entries(evidenceCategoryLabels).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Origem *</Label>
          <Select><SelectTrigger className="text-xs"><SelectValue placeholder="Selecione..." /></SelectTrigger>
            <SelectContent>
              {Object.entries(evidenceOriginLabels).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Data início do fato</Label>
          <Input type="date" />
        </div>
        <div className="space-y-2">
          <Label>Data fim do fato</Label>
          <Input type="date" />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Solicitação vinculada</Label>
        <Select><SelectTrigger className="text-xs"><SelectValue placeholder="Nenhuma (avulsa)" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Nenhuma (avulsa)</SelectItem>
            {requests.map((r) => (
              <SelectItem key={r.id} value={r.id}>{r.theme} – {requestStatusLabels[r.status]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="rounded-lg border border-dashed bg-muted/30 p-3">
        <p className="text-xs text-muted-foreground">
          🔒 O hash SHA-256 será gerado automaticamente para preservação de integridade.
        </p>
      </div>
      <Button type="submit" className="w-full">Enviar Evidência</Button>
    </form>
  );
}
