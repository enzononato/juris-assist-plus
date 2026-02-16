import { useState } from "react";
import { FileText, Plus, Edit, Trash2, CheckCircle2, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { mockChecklistTemplates, checklistTypeLabels } from "@/data/mock";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const typeColors: Record<string, string> = {
  pre_audiencia: "bg-primary/10 text-primary",
  pos_audiencia: "bg-info/10 text-info",
  provas_por_tema: "bg-warning/15 text-warning",
};

export default function ChecklistTemplates() {
  const [addOpen, setAddOpen] = useState(false);

  return (
    <div className="p-4 md:p-6 lg:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" /> Templates de Checklists
          </h1>
          <p className="text-sm text-muted-foreground">Modelos parametrizáveis para processos</p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5 text-xs"><Plus className="h-3.5 w-3.5" /> Novo Template</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>Novo Template de Checklist</DialogTitle></DialogHeader>
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); toast({ title: "Template criado (Demo)" }); setAddOpen(false); }}>
              <div className="space-y-2"><Label>Nome *</Label><Input required placeholder="Ex: Checklist Pré-Audiência Padrão" /></div>
              <div className="space-y-2">
                <Label>Tipo *</Label>
                <Select><SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(checklistTypeLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Tema (se Provas por Tema)</Label><Input placeholder="Ex: Horas Extras" /></div>
              <div className="space-y-2"><Label>Itens (um por linha)</Label><Textarea rows={6} placeholder={"Provas anexadas ao processo?\nDocumentos enviados ao jurídico?\nTestemunhas confirmadas?"} /></div>
              <Button type="submit" className="w-full">Criar Template</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {mockChecklistTemplates.map((tmpl) => (
          <div key={tmpl.id} className="rounded-xl border bg-card p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold">{tmpl.name}</p>
                  <Badge className={cn("text-[9px] border-0", typeColors[tmpl.type])}>{checklistTypeLabels[tmpl.type]}</Badge>
                </div>
                {tmpl.theme && <p className="mt-0.5 text-[11px] text-muted-foreground">Tema: {tmpl.theme}</p>}
              </div>
              <div className="flex gap-1 shrink-0">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toast({ title: "Template duplicado (Demo)" })}><Copy className="h-3.5 w-3.5" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8"><Edit className="h-3.5 w-3.5" /></Button>
              </div>
            </div>
            <div className="mt-3 space-y-1">
              {tmpl.items.map((item) => (
                <div key={item.id} className="flex items-center gap-2 text-xs">
                  <CheckCircle2 className="h-3 w-3 text-muted-foreground/40" />
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
            <p className="mt-2 text-[10px] text-muted-foreground">{tmpl.items.length} itens</p>
          </div>
        ))}
      </div>
    </div>
  );
}
