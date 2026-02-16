import { useState } from "react";
import { Plus, FileText, Upload, Clock, AlertTriangle, CheckCircle2, XCircle, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  type EvidenceRequest, type EvidenceItem, type EvidenceCategory,
  evidenceCategoryLabels, evidenceOriginLabels,
} from "@/data/mock";
import { cn } from "@/lib/utils";

const requestStatusStyles: Record<string, string> = {
  aberta: "bg-info/15 text-info",
  parcialmente_atendida: "bg-warning/15 text-warning",
  atendida: "bg-success/15 text-success",
  atrasada: "bg-destructive/10 text-destructive",
};

const requestStatusLabels: Record<string, string> = {
  aberta: "Aberta",
  parcialmente_atendida: "Parcialmente Atendida",
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
  pendente: "Pendente",
  recebido: "Recebido",
  validado: "Validado",
  recusado: "Recusado",
};

function getSlaStatus(request: EvidenceRequest) {
  const now = new Date();
  const due = new Date(request.due_at);
  const created = new Date(request.created_at);
  const total = due.getTime() - created.getTime();
  const elapsed = now.getTime() - created.getTime();
  const percent = Math.min(100, Math.max(0, (elapsed / total) * 100));

  if (request.status === "atendida") return { label: "Concluído", percent: 100, color: "bg-success" };
  if (now > due) return { label: "SLA Estourado", percent: 100, color: "bg-destructive" };
  if (percent > 66) return { label: "SLA em Risco", percent, color: "bg-warning" };
  return { label: "No Prazo", percent, color: "bg-success" };
}

interface Props {
  requests: EvidenceRequest[];
  items: EvidenceItem[];
}

export default function ProvasTab({ requests, items }: Props) {
  const [uploadOpen, setUploadOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Solicitações de Prova */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold">Solicitações de Prova</h3>
          <Button size="sm" variant="outline" className="gap-1.5">
            <Plus className="h-3.5 w-3.5" /> Nova Solicitação
          </Button>
        </div>

        {requests.length === 0 && (
          <p className="text-sm text-muted-foreground">Nenhuma solicitação de prova.</p>
        )}

        {requests.map((r) => {
          const sla = getSlaStatus(r);
          const reqItems = items.filter((i) => i.request_id === r.id);
          return (
            <div key={r.id} className="mb-3 rounded-lg border bg-card p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold">{r.theme}</p>
                    <Badge variant="outline" className={cn("text-[10px]", requestStatusStyles[r.status])}>
                      {requestStatusLabels[r.status]}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{r.description}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {r.assigned_areas.map((a) => (
                      <Badge key={a} variant="secondary" className="text-[10px]">{a}</Badge>
                    ))}
                    <span className="text-[11px] text-muted-foreground">
                      · {r.assigned_users.join(", ")}
                    </span>
                  </div>
                </div>
              </div>

              {/* SLA Progress */}
              <div className="mt-3">
                <div className="mb-1 flex items-center justify-between text-[11px]">
                  <span className="text-muted-foreground">SLA ({r.sla_hours}h)</span>
                  <span className={cn(
                    "font-medium",
                    sla.color === "bg-destructive" ? "text-destructive" :
                    sla.color === "bg-warning" ? "text-warning" : "text-success"
                  )}>
                    {sla.label}
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div className={cn("h-full rounded-full transition-all", sla.color)} style={{ width: `${sla.percent}%` }} />
                </div>
                <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
                  <span>Criado: {new Date(r.created_at).toLocaleDateString("pt-BR")}</span>
                  <span>Prazo: {new Date(r.due_at).toLocaleDateString("pt-BR")}</span>
                </div>
              </div>

              {/* Items attached to this request */}
              {reqItems.length > 0 && (
                <div className="mt-3 border-t pt-3">
                  <p className="mb-2 text-[11px] font-medium text-muted-foreground">{reqItems.length} evidência(s) anexada(s)</p>
                  {reqItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-2 rounded py-1.5 text-xs">
                      <FileText className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      <span className="min-w-0 flex-1 truncate font-medium">{item.filename}</span>
                      <Badge variant="outline" className="text-[9px]">{evidenceCategoryLabels[item.category]}</Badge>
                      <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        {itemStatusIcons[item.status]} {itemStatusLabels[item.status]}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Todas as Evidências */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold">Evidências ({items.length})</h3>
          <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1.5">
                <Upload className="h-3.5 w-3.5" /> Anexar Prova
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Anexar Nova Evidência</DialogTitle>
              </DialogHeader>
              <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setUploadOpen(false); }}>
                <div className="space-y-2">
                  <Label>Arquivo</Label>
                  <Input type="file" />
                </div>
                <div className="space-y-2">
                  <Label>Categoria *</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(evidenceCategoryLabels).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Origem *</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(evidenceOriginLabels).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Data ou período do fato</Label>
                  <Input type="date" />
                </div>
                <div className="space-y-2">
                  <Label>Solicitação vinculada</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Nenhuma (avulsa)" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhuma (avulsa)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full">Enviar Evidência</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {items.length === 0 && (
          <p className="text-sm text-muted-foreground">Nenhuma evidência anexada.</p>
        )}

        <div className="space-y-1.5">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-3 rounded-lg border bg-card p-3">
              <FileText className="h-4 w-4 shrink-0 text-primary" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{item.filename}</p>
                <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                  <span>{evidenceCategoryLabels[item.category]}</span>
                  <span>·</span>
                  <span>{evidenceOriginLabels[item.origin]}</span>
                  <span>·</span>
                  <span>{item.file_size}</span>
                </div>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  Enviado por {item.uploaded_by} em {new Date(item.uploaded_at).toLocaleDateString("pt-BR")}
                  {item.fact_date && ` · Fato: ${new Date(item.fact_date).toLocaleDateString("pt-BR")}`}
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                {itemStatusIcons[item.status]}
                <Badge variant="outline" className="text-[10px]">{itemStatusLabels[item.status]}</Badge>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
