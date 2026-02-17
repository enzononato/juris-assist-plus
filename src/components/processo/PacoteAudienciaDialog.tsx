import { useState } from "react";
import { Package, FileText, CheckCircle2, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { type Hearing, type EvidenceItem, type CaseChecklist, evidenceCategoryLabels } from "@/data/mock";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface Props {
  hearing: Hearing;
  evidenceItems: EvidenceItem[];
  checklists: CaseChecklist[];
}

export default function PacoteAudienciaDialog({ hearing, evidenceItems, checklists }: Props) {
  const [open, setOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);

  const preAudienciaChecklist = checklists.find((c) => c.type === "pre_audiencia" && c.hearing_id === hearing.id);
  const validatedItems = evidenceItems.filter((i) => i.status === "validado");
  const allItems = evidenceItems;

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      setGenerated(true);
      toast({
        title: "📦 Pacote de Audiência gerado",
        description: `${validatedItems.length} evidências validadas + checklist + informações do processo compilados.`,
      });
    }, 2000);
  };

  const handleDownload = () => {
    toast({
      title: "📥 Download do pacote",
      description: "Pacote ZIP com todas as evidências e documentos preparatórios. (Demo)",
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-1.5 text-xs">
          <Package className="h-3.5 w-3.5" /> Pacote de Audiência
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Pacote Automático de Audiência
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Hearing info */}
          <div className="rounded-lg border bg-muted/30 p-3">
            <p className="text-sm font-semibold">{hearing.type}</p>
            <p className="text-xs text-muted-foreground">
              {new Date(hearing.date).toLocaleDateString("pt-BR")} às {hearing.time} · {hearing.court}
            </p>
            <p className="text-xs text-muted-foreground">Processo: {hearing.case_number}</p>
          </div>

          {/* Package contents */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Conteúdo do Pacote</h3>

            {/* Checklist status */}
            <div className="flex items-center gap-3 rounded-lg border p-3">
              <CheckCircle2 className={cn("h-4 w-4", preAudienciaChecklist ? "text-success" : "text-muted-foreground")} />
              <div className="flex-1">
                <p className="text-sm font-medium">Checklist Pré-Audiência</p>
                {preAudienciaChecklist ? (
                  <p className="text-[11px] text-muted-foreground">
                    {preAudienciaChecklist.items.filter((i) => i.checked).length}/{preAudienciaChecklist.items.length} itens concluídos
                  </p>
                ) : (
                  <p className="text-[11px] text-warning">Checklist não aplicado ainda</p>
                )}
              </div>
            </div>

            {/* Evidence summary */}
            <div className="rounded-lg border p-3">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4 text-primary" />
                <p className="text-sm font-medium">Evidências ({validatedItems.length} validadas / {allItems.length} total)</p>
              </div>
              {validatedItems.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">Nenhuma evidência validada para incluir.</p>
              ) : (
                <div className="space-y-1">
                  {validatedItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-2 text-xs">
                      <CheckCircle2 className="h-3 w-3 text-success shrink-0" />
                      <span className="truncate">{item.filename}</span>
                      <Badge variant="outline" className="text-[9px] shrink-0">{evidenceCategoryLabels[item.category]}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Auto-included docs */}
            <div className="rounded-lg border border-dashed bg-muted/20 p-3">
              <p className="text-xs font-semibold text-muted-foreground mb-1">Documentos gerados automaticamente:</p>
              <ul className="text-xs text-muted-foreground space-y-0.5">
                <li>📋 Resumo do processo (gerado por IA)</li>
                <li>📄 Procuração atualizada</li>
                <li>📊 Linha do tempo dos eventos</li>
                <li>✅ Checklist pré-audiência preenchido</li>
                <li>📑 Índice de evidências com SHA-256</li>
              </ul>
            </div>
          </div>

          {/* Actions */}
          {!generated ? (
            <Button className="w-full gap-2" onClick={handleGenerate} disabled={generating}>
              {generating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Compilando pacote...
                </>
              ) : (
                <>
                  <Package className="h-4 w-4" /> Gerar Pacote de Audiência
                </>
              )}
            </Button>
          ) : (
            <div className="space-y-2">
              <div className="rounded-lg border border-success/30 bg-success/5 p-3 text-center">
                <CheckCircle2 className="mx-auto mb-1 h-5 w-5 text-success" />
                <p className="text-sm font-semibold text-success">Pacote gerado com sucesso!</p>
                <p className="text-[11px] text-muted-foreground">{validatedItems.length} evidências + 5 documentos automáticos</p>
              </div>
              <Button className="w-full gap-2" onClick={handleDownload}>
                <Download className="h-4 w-4" /> Baixar Pacote (.zip)
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
