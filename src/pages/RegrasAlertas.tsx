import { useState } from "react";
import { Bell, Plus, Edit, Clock, Calendar, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface AlertRule {
  id: string;
  type: "audiencia" | "prazo" | "tarefa" | "sla_prova";
  name: string;
  offsets: string[];
  channels: string[];
  escalation_hours?: number;
  active: boolean;
}

const typeLabels = { audiencia: "Audiência", prazo: "Prazo", tarefa: "Tarefa", sla_prova: "SLA de Prova" };
const typeColors = { audiencia: "bg-primary/10 text-primary", prazo: "bg-warning/15 text-warning", tarefa: "bg-info/10 text-info", sla_prova: "bg-destructive/10 text-destructive" };

const mockRules: AlertRule[] = [
  { id: "r1", type: "audiencia", name: "Alertas de Audiência", offsets: ["7 dias", "2 dias", "2 horas"], channels: ["In-app", "E-mail", "WhatsApp"], escalation_hours: 4, active: true },
  { id: "r2", type: "prazo", name: "Alertas de Prazo", offsets: ["7 dias", "2 dias", "2 horas"], channels: ["In-app", "E-mail", "WhatsApp"], escalation_hours: 4, active: true },
  { id: "r3", type: "tarefa", name: "Alertas de Tarefa", offsets: ["24 horas", "No vencimento"], channels: ["In-app", "E-mail"], active: true },
  { id: "r4", type: "sla_prova", name: "Alertas de SLA de Prova", offsets: ["48 horas (Em Risco)", "72 horas (Atrasado)"], channels: ["In-app", "E-mail", "WhatsApp"], escalation_hours: 2, active: true },
];

export default function RegrasAlertas() {
  const [addOpen, setAddOpen] = useState(false);

  return (
    <div className="p-4 md:p-6 lg:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Bell className="h-6 w-6 text-primary" /> Regras de Alertas e SLAs
          </h1>
          <p className="text-sm text-muted-foreground">Configuração de offsets, canais e escalonamento</p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5 text-xs"><Plus className="h-3.5 w-3.5" /> Nova Regra</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>Nova Regra de Alerta</DialogTitle></DialogHeader>
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); toast({ title: "Regra criada (Demo)" }); setAddOpen(false); }}>
              <div className="space-y-2"><Label>Nome *</Label><Input required /></div>
              <div className="space-y-2">
                <Label>Tipo *</Label>
                <Select><SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(typeLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Offsets (separados por vírgula)</Label>
                <Input placeholder="7 dias, 2 dias, 2 horas" />
              </div>
              <div className="space-y-2">
                <Label>Escalonamento (horas sem tratamento)</Label>
                <Input type="number" placeholder="4" />
              </div>
              <Button type="submit" className="w-full">Criar Regra</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Global settings */}
      <div className="mb-6 rounded-xl border bg-card p-4 space-y-3">
        <h3 className="text-sm font-semibold">Configurações Globais</h3>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="space-y-1">
            <Label className="text-xs">Timezone</Label>
            <Select defaultValue="america_bahia">
              <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="america_bahia">America/Bahia (BRT -3)</SelectItem>
                <SelectItem value="america_sao_paulo">America/São Paulo (BRT -3)</SelectItem>
                <SelectItem value="america_recife">America/Recife (BRT -3)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Horário de envio (início)</Label>
            <Input type="time" defaultValue="07:00" className="h-8 text-xs" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Horário de envio (fim)</Label>
            <Input type="time" defaultValue="22:00" className="h-8 text-xs" />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs">Enviar alertas nos finais de semana</span>
          <Switch defaultChecked={false} />
        </div>
      </div>

      {/* Rules */}
      <div className="space-y-3">
        {mockRules.map((rule) => (
          <div key={rule.id} className="rounded-xl border bg-card p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <Badge className={cn("text-[10px] border-0", typeColors[rule.type])}>{typeLabels[rule.type]}</Badge>
                <p className="text-sm font-semibold">{rule.name}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Switch checked={rule.active} />
                <Button variant="ghost" size="icon" className="h-8 w-8"><Edit className="h-3.5 w-3.5" /></Button>
              </div>
            </div>

            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <div>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Offsets</p>
                <div className="flex flex-wrap gap-1">
                  {rule.offsets.map((o) => (
                    <Badge key={o} variant="outline" className="text-[10px]">
                      <Clock className="mr-0.5 h-2.5 w-2.5" /> {o}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Canais</p>
                <div className="flex flex-wrap gap-1">
                  {rule.channels.map((c) => <Badge key={c} variant="secondary" className="text-[10px]">{c}</Badge>)}
                </div>
              </div>
              {rule.escalation_hours && (
                <div>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Escalonamento</p>
                  <Badge className="text-[10px] bg-destructive/10 text-destructive border-0">
                    <AlertTriangle className="mr-0.5 h-2.5 w-2.5" /> Após {rule.escalation_hours}h sem tratamento
                  </Badge>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
