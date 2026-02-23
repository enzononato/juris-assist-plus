import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DollarSign, Clock, Plus, ArrowUpRight, ArrowDownRight, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface FinanceiroProcessoTabProps {
  caseId: string;
}

const feeTypeLabels: Record<string, string> = { fixo: "Fixo", exito: "Êxito", provisorio: "Provisório", ad_hoc: "Ad Hoc" };
const statusLabels: Record<string, string> = { pendente: "Pendente", pago: "Pago", cancelado: "Cancelado" };

function formatBRL(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function parseCurrencyToNumber(formatted: string): number {
  const clean = formatted.replace(/[^\d]/g, "");
  return clean ? parseInt(clean, 10) / 100 : 0;
}

function formatCurrencyInput(value: string): string {
  const clean = value.replace(/[^\d]/g, "");
  if (!clean) return "";
  const num = parseInt(clean, 10) / 100;
  return num.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function handleCurrencyChange(setter: (v: string) => void) {
  return (e: React.ChangeEvent<HTMLInputElement>) => {
    setter(formatCurrencyInput(e.target.value));
  };
}

export default function FinanceiroProcessoTab({ caseId }: FinanceiroProcessoTabProps) {
  const queryClient = useQueryClient();
  const [feeOpen, setFeeOpen] = useState(false);
  const [entryOpen, setEntryOpen] = useState(false);
  const [tsOpen, setTsOpen] = useState(false);

  // Fee form
  const [feeType, setFeeType] = useState("fixo");
  const [feeDesc, setFeeDesc] = useState("");
  const [feeAmount, setFeeAmount] = useState("");
  const [feeInstallments, setFeeInstallments] = useState("1");

  // Entry form
  const [entryType, setEntryType] = useState("despesa");
  const [entryDesc, setEntryDesc] = useState("");
  const [entryAmount, setEntryAmount] = useState("");
  const [entryCategory, setEntryCategory] = useState("");
  const [entryDueDate, setEntryDueDate] = useState("");

  // Timesheet form
  const [tsUserName, setTsUserName] = useState("");
  const [tsDesc, setTsDesc] = useState("");
  const [tsHours, setTsHours] = useState("");
  const [tsRate, setTsRate] = useState("");
  const [tsDate, setTsDate] = useState(format(new Date(), "yyyy-MM-dd"));

  const { data: fees } = useQuery({
    queryKey: ["case-fees", caseId],
    queryFn: async () => {
      const { data, error } = await supabase.from("case_fees").select("*").eq("case_id", caseId).order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: entries } = useQuery({
    queryKey: ["case-entries", caseId],
    queryFn: async () => {
      const { data, error } = await supabase.from("financial_entries").select("*").eq("case_id", caseId).order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: timesheets } = useQuery({
    queryKey: ["case-timesheets", caseId],
    queryFn: async () => {
      const { data, error } = await supabase.from("timesheets").select("*").eq("case_id", caseId).order("work_date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const addFee = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("case_fees").insert({
        case_id: caseId,
        fee_type: feeType as any,
        description: feeDesc,
        amount: parseCurrencyToNumber(feeAmount),
        installments: parseInt(feeInstallments),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["case-fees", caseId] });
      toast({ title: "Honorário adicionado" });
      setFeeOpen(false);
      setFeeDesc("");
      setFeeAmount("");
    },
  });

  const addEntry = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("financial_entries").insert({
        case_id: caseId,
        entry_type: entryType as any,
        description: entryDesc,
        amount: parseCurrencyToNumber(entryAmount),
        category: entryCategory || null,
        due_date: entryDueDate || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["case-entries", caseId] });
      toast({ title: "Lançamento adicionado" });
      setEntryOpen(false);
      setEntryDesc("");
      setEntryAmount("");
    },
  });

  const addTimesheet = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("timesheets").insert({
        case_id: caseId,
        user_name: tsUserName,
        description: tsDesc,
        hours: parseFloat(tsHours),
        hourly_rate: parseFloat(tsRate) || 0,
        work_date: tsDate,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["case-timesheets", caseId] });
      toast({ title: "Horas registradas" });
      setTsOpen(false);
      setTsDesc("");
      setTsHours("");
    },
  });

  const deleteFee = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("case_fees").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["case-fees", caseId] }),
  });

  const deleteEntry = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("financial_entries").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["case-entries", caseId] }),
  });

  const totalFees = fees?.reduce((a, f) => a + Number(f.amount), 0) ?? 0;
  const totalReceitas = entries?.filter((e) => e.entry_type === "receita").reduce((a, e) => a + Number(e.amount), 0) ?? 0;
  const totalDespesas = entries?.filter((e) => e.entry_type === "despesa").reduce((a, e) => a + Number(e.amount), 0) ?? 0;
  const totalHoras = timesheets?.reduce((a, t) => a + Number(t.hours), 0) ?? 0;

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <div className="rounded-lg border bg-card p-3 text-center">
          <p className="text-[10px] text-muted-foreground uppercase">Honorários</p>
          <p className="text-sm font-bold">{formatBRL(totalFees)}</p>
        </div>
        <div className="rounded-lg border bg-card p-3 text-center">
          <p className="text-[10px] text-muted-foreground uppercase">Receitas</p>
          <p className="text-sm font-bold text-success">{formatBRL(totalReceitas)}</p>
        </div>
        <div className="rounded-lg border bg-card p-3 text-center">
          <p className="text-[10px] text-muted-foreground uppercase">Despesas</p>
          <p className="text-sm font-bold text-destructive">{formatBRL(totalDespesas)}</p>
        </div>
        <div className="rounded-lg border bg-card p-3 text-center">
          <p className="text-[10px] text-muted-foreground uppercase">Horas</p>
          <p className="text-sm font-bold">{totalHoras.toFixed(1)}h</p>
        </div>
      </div>

      <Tabs defaultValue="fees">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="fees">Honorários ({fees?.length ?? 0})</TabsTrigger>
          <TabsTrigger value="entries">Lançamentos ({entries?.length ?? 0})</TabsTrigger>
          <TabsTrigger value="timesheets">Timesheet ({timesheets?.length ?? 0})</TabsTrigger>
        </TabsList>

        {/* FEES */}
        <TabsContent value="fees" className="space-y-2 mt-3">
          <div className="flex justify-end">
            <Button size="sm" className="gap-1 text-xs" onClick={() => setFeeOpen(true)}>
              <Plus className="h-3.5 w-3.5" /> Honorário
            </Button>
          </div>
          {(!fees || fees.length === 0) ? (
            <p className="text-sm text-muted-foreground text-center py-6">Nenhum honorário.</p>
          ) : fees.map((f) => (
            <div key={f.id} className="flex items-center gap-3 rounded-lg border bg-card p-3">
              <DollarSign className="h-4 w-4 text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{f.description}</p>
                <Badge variant="outline" className="text-[9px] mt-1">{feeTypeLabels[f.fee_type]}</Badge>
              </div>
              <div className="text-right shrink-0 flex items-center gap-2">
                <div>
                  <p className="text-sm font-semibold">{formatBRL(Number(f.amount))}</p>
                  <p className="text-[10px] text-muted-foreground">{f.paid_installments}/{f.installments} parcelas</p>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteFee.mutate(f.id)}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </TabsContent>

        {/* ENTRIES */}
        <TabsContent value="entries" className="space-y-2 mt-3">
          <div className="flex justify-end">
            <Button size="sm" className="gap-1 text-xs" onClick={() => setEntryOpen(true)}>
              <Plus className="h-3.5 w-3.5" /> Lançamento
            </Button>
          </div>
          {(!entries || entries.length === 0) ? (
            <p className="text-sm text-muted-foreground text-center py-6">Nenhum lançamento.</p>
          ) : entries.map((e) => (
            <div key={e.id} className="flex items-center gap-3 rounded-lg border bg-card p-3">
              {e.entry_type === "receita" ? <ArrowUpRight className="h-4 w-4 text-success shrink-0" /> : <ArrowDownRight className="h-4 w-4 text-destructive shrink-0" />}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{e.description}</p>
                <p className="text-[10px] text-muted-foreground">{e.category ?? "Sem categoria"} · <Badge variant="outline" className="text-[9px]">{statusLabels[e.status]}</Badge></p>
              </div>
              <div className="text-right shrink-0 flex items-center gap-2">
                <p className={`text-sm font-semibold ${e.entry_type === "receita" ? "text-success" : "text-destructive"}`}>
                  {e.entry_type === "receita" ? "+" : "-"}{formatBRL(Number(e.amount))}
                </p>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteEntry.mutate(e.id)}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </TabsContent>

        {/* TIMESHEETS */}
        <TabsContent value="timesheets" className="space-y-2 mt-3">
          <div className="flex justify-end">
            <Button size="sm" className="gap-1 text-xs" onClick={() => setTsOpen(true)}>
              <Plus className="h-3.5 w-3.5" /> Registrar Horas
            </Button>
          </div>
          {(!timesheets || timesheets.length === 0) ? (
            <p className="text-sm text-muted-foreground text-center py-6">Nenhum registro.</p>
          ) : timesheets.map((t) => (
            <div key={t.id} className="flex items-center gap-3 rounded-lg border bg-card p-3">
              <Clock className="h-4 w-4 text-info shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{t.description}</p>
                <p className="text-[10px] text-muted-foreground">{t.user_name} · {format(new Date(t.work_date), "dd/MM/yyyy")}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-semibold">{Number(t.hours).toFixed(1)}h</p>
                <p className="text-[10px] text-muted-foreground">{formatBRL(Number(t.hours) * Number(t.hourly_rate))}</p>
              </div>
            </div>
          ))}
        </TabsContent>
      </Tabs>

      {/* Dialog: Add Fee */}
      <Dialog open={feeOpen} onOpenChange={setFeeOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Novo Honorário</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Tipo</Label>
              <Select value={feeType} onValueChange={setFeeType}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(feeTypeLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Descrição</Label>
              <Input value={feeDesc} onChange={(e) => setFeeDesc(e.target.value)} placeholder="Ex: Honorários advocatícios" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Valor (R$)</Label>
                <Input value={feeAmount} onChange={handleCurrencyChange(setFeeAmount)} placeholder="0,00" inputMode="numeric" />
              </div>
              <div>
                <Label className="text-xs">Parcelas</Label>
                <Input type="number" value={feeInstallments} onChange={(e) => setFeeInstallments(e.target.value)} min="1" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button size="sm" disabled={!feeDesc || !feeAmount} onClick={() => addFee.mutate()}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Add Entry */}
      <Dialog open={entryOpen} onOpenChange={setEntryOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Novo Lançamento</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Tipo</Label>
              <Select value={entryType} onValueChange={setEntryType}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="receita">Receita</SelectItem>
                  <SelectItem value="despesa">Despesa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Descrição</Label>
              <Input value={entryDesc} onChange={(e) => setEntryDesc(e.target.value)} placeholder="Ex: Custas processuais" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Valor (R$)</Label>
                <Input value={entryAmount} onChange={handleCurrencyChange(setEntryAmount)} placeholder="0,00" inputMode="numeric" />
              </div>
              <div>
                <Label className="text-xs">Categoria</Label>
                <Input value={entryCategory} onChange={(e) => setEntryCategory(e.target.value)} placeholder="Ex: Perícia" />
              </div>
            </div>
            <div>
              <Label className="text-xs">Vencimento</Label>
              <Input type="date" value={entryDueDate} onChange={(e) => setEntryDueDate(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button size="sm" disabled={!entryDesc || !entryAmount} onClick={() => addEntry.mutate()}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Add Timesheet */}
      <Dialog open={tsOpen} onOpenChange={setTsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Registrar Horas</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Responsável</Label>
              <Input value={tsUserName} onChange={(e) => setTsUserName(e.target.value)} placeholder="Nome do profissional" />
            </div>
            <div>
              <Label className="text-xs">Descrição</Label>
              <Input value={tsDesc} onChange={(e) => setTsDesc(e.target.value)} placeholder="Ex: Elaboração de petição" />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label className="text-xs">Horas</Label>
                <Input type="number" step="0.5" value={tsHours} onChange={(e) => setTsHours(e.target.value)} placeholder="2.0" />
              </div>
              <div>
                <Label className="text-xs">Valor/Hora (R$)</Label>
                <Input type="number" value={tsRate} onChange={(e) => setTsRate(e.target.value)} placeholder="150" />
              </div>
              <div>
                <Label className="text-xs">Data</Label>
                <Input type="date" value={tsDate} onChange={(e) => setTsDate(e.target.value)} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button size="sm" disabled={!tsUserName || !tsDesc || !tsHours} onClick={() => addTimesheet.mutate()}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
