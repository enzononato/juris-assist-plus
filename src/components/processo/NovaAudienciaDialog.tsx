import { useState } from "react";
import { CalendarDays, Sparkles, CheckCircle2, Bell, ClipboardList, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { mockCases } from "@/data/mock";
import { toast } from "@/hooks/use-toast";

interface Props {
  caseId?: string;
  trigger?: React.ReactNode;
}

export default function NovaAudienciaDialog({ caseId, trigger }: Props) {
  const [open, setOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      setGenerated(true);
    }, 2000);
  };

  const handleClose = () => {
    setOpen(false);
    if (generated) {
      toast({
        title: "🎯 Pacote de Audiência criado",
        description: "Audiência agendada, checklist pré-audiência, alertas (7d/2d/2h), tarefa 'Confirmar testemunhas' e resumo IA gerados automaticamente.",
      });
    }
    setTimeout(() => { setGenerated(false); setGenerating(false); }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => v ? setOpen(true) : handleClose()}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm" variant="outline" className="gap-1.5 text-xs">
            <CalendarDays className="h-3.5 w-3.5" /> Nova Audiência
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-primary" />
            Criar Audiência + Pacote Automático
          </DialogTitle>
        </DialogHeader>

        {!generated ? (
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label>Processo *</Label>
              <Select defaultValue={caseId}>
                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>
                  {mockCases.map((c) => <SelectItem key={c.id} value={c.id}>{c.employee} – {c.case_number}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Data *</Label>
                <Input type="date" required />
              </div>
              <div className="space-y-2">
                <Label>Horário *</Label>
                <Input type="time" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Tipo *</Label>
              <Select>
                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="inicial">Audiência Inicial</SelectItem>
                  <SelectItem value="instrucao">Audiência de Instrução</SelectItem>
                  <SelectItem value="julgamento">Audiência de Julgamento</SelectItem>
                  <SelectItem value="conciliacao">Audiência de Conciliação</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Vara / Tribunal</Label>
              <Input placeholder="Ex: 1ª Vara do Trabalho de Juazeiro" />
            </div>

            <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 space-y-2">
              <p className="text-xs font-semibold text-primary flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" /> Pacote Automático
              </p>
              <p className="text-[11px] text-muted-foreground">
                Ao criar, o sistema gerará automaticamente:
              </p>
              <div className="space-y-1 text-[11px]">
                <div className="flex items-center gap-2">
                  <ClipboardList className="h-3 w-3 text-primary" />
                  <span>Checklist pré-audiência (6 itens)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Bell className="h-3 w-3 text-warning" />
                  <span>Alertas: 7 dias, 2 dias e 2 horas antes</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-3 w-3 text-info" />
                  <span>Tarefa: "Confirmar testemunhas"</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-3 w-3 text-primary" />
                  <span>Resumo IA do caso para audiência</span>
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full gap-2" disabled={generating}>
              {generating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Gerando pacote automático...
                </>
              ) : (
                "Criar Audiência + Pacote"
              )}
            </Button>
          </form>
        ) : (
          <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col items-center gap-2 py-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
                <CheckCircle2 className="h-6 w-6 text-success" />
              </div>
              <p className="text-sm font-semibold">Pacote gerado com sucesso!</p>
            </div>

            <div className="space-y-2">
              {[
                { icon: <CalendarDays className="h-4 w-4 text-primary" />, label: "Audiência agendada", badge: "Criado" },
                { icon: <ClipboardList className="h-4 w-4 text-primary" />, label: "Checklist pré-audiência (6 itens)", badge: "Criado" },
                { icon: <Bell className="h-4 w-4 text-warning" />, label: "3 alertas agendados (7d/2d/2h)", badge: "Agendado" },
                { icon: <User className="h-4 w-4 text-info" />, label: "Tarefa: Confirmar testemunhas", badge: "Criado" },
                { icon: <Sparkles className="h-4 w-4 text-primary" />, label: "Resumo IA do caso", badge: "Gerado" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 rounded-lg border bg-card p-3">
                  {item.icon}
                  <span className="text-sm flex-1">{item.label}</span>
                  <Badge className="text-[10px] bg-success/15 text-success border-0">{item.badge}</Badge>
                </div>
              ))}
            </div>

            <Button className="w-full" onClick={handleClose}>Fechar</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
