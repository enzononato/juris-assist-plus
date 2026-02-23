import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  DollarSign, TrendingUp, TrendingDown, Clock, ArrowUpRight, ArrowDownRight,
  Search, Download, CheckCircle2, Filter, BarChart3, Receipt, Wallet, Plus
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Legend, Line, ComposedChart
} from "recharts";
import { format, subMonths, isAfter, isBefore, parseISO, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "@/hooks/use-toast";

const COLORS = [
  "hsl(var(--primary))", "hsl(var(--destructive))", "hsl(var(--warning))",
  "hsl(var(--success))", "hsl(var(--info))", "hsl(var(--accent-foreground))"
];

const statusLabels: Record<string, string> = { pendente: "Pendente", pago: "Pago", cancelado: "Cancelado" };
const feeTypeLabels: Record<string, string> = { fixo: "Fixo", exito: "Êxito", provisorio: "Provisório", ad_hoc: "Ad Hoc" };

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function exportCSV(rows: Record<string, any>[], filename: string) {
  if (!rows.length) return;
  const BOM = "\uFEFF";
  const headers = Object.keys(rows[0]);
  const csv = BOM + [headers.join(";"), ...rows.map((r) => headers.map((h) => `"${r[h] ?? ""}"`).join(";"))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}_${format(new Date(), "yyyyMMdd")}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function Financeiro() {
  const queryClient = useQueryClient();

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [typeFilter, setTypeFilter] = useState("todos");
  const [periodFilter, setPeriodFilter] = useState("6m");
  const [createOpen, setCreateOpen] = useState(false);
  const [newEntry, setNewEntry] = useState({
    entry_type: "despesa" as "receita" | "despesa",
    description: "",
    amount: "",
    category: "",
    due_date: "",
    case_id: "",
  });

  const { data: allCases = [] } = useQuery({
    queryKey: ["all-cases-select"],
    queryFn: async () => {
      const { data, error } = await supabase.from("cases").select("id, case_number, employee_name").order("case_number");
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: fees } = useQuery({
    queryKey: ["all-fees"],
    queryFn: async () => {
      const { data, error } = await supabase.from("case_fees").select("*, cases(case_number, employee_name)");
      if (error) throw error;
      return data;
    },
  });

  const { data: entries } = useQuery({
    queryKey: ["all-financial-entries"],
    queryFn: async () => {
      const { data, error } = await supabase.from("financial_entries").select("*, cases(case_number, employee_name)");
      if (error) throw error;
      return data;
    },
  });

  const { data: timesheets } = useQuery({
    queryKey: ["all-timesheets"],
    queryFn: async () => {
      const { data, error } = await supabase.from("timesheets").select("*, cases(case_number, employee_name)");
      if (error) throw error;
      return data;
    },
  });

  // Mark as paid mutation
  const markPaid = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("financial_entries").update({
        status: "pago" as any,
        paid_date: format(new Date(), "yyyy-MM-dd"),
      }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-financial-entries"] });
      toast({ title: "Lançamento marcado como pago ✓" });
    },
  });

  const createEntry = useMutation({
    mutationFn: async () => {
      if (!newEntry.description.trim() || !newEntry.amount || !newEntry.case_id) {
        throw new Error("Preencha os campos obrigatórios");
      }
      const { error } = await supabase.from("financial_entries").insert({
        entry_type: newEntry.entry_type,
        description: newEntry.description.trim(),
        amount: parseFloat(newEntry.amount),
        category: newEntry.category.trim() || null,
        due_date: newEntry.due_date || null,
        case_id: newEntry.case_id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-financial-entries"] });
      toast({ title: "Lançamento criado com sucesso ✓" });
      setCreateOpen(false);
      setNewEntry({ entry_type: "despesa", description: "", amount: "", category: "", due_date: "", case_id: "" });
    },
    onError: (err: Error) => {
      toast({ title: "Erro ao criar lançamento", description: err.message, variant: "destructive" });
    },
  });

  // Period months
  const periodMonths = periodFilter === "3m" ? 3 : periodFilter === "12m" ? 12 : 6;

  // Filtered entries
  const filteredEntries = useMemo(() => {
    if (!entries) return [];
    return entries.filter((e) => {
      if (statusFilter !== "todos" && e.status !== statusFilter) return false;
      if (typeFilter !== "todos" && e.entry_type !== typeFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        const match = e.description?.toLowerCase().includes(q)
          || (e as any).cases?.case_number?.toLowerCase().includes(q)
          || e.category?.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [entries, statusFilter, typeFilter, search]);

  const filteredFees = useMemo(() => {
    if (!fees) return [];
    return fees.filter((f) => {
      if (search) {
        const q = search.toLowerCase();
        return f.description?.toLowerCase().includes(q) || (f as any).cases?.case_number?.toLowerCase().includes(q);
      }
      return true;
    });
  }, [fees, search]);

  const filteredTimesheets = useMemo(() => {
    if (!timesheets) return [];
    return timesheets.filter((t) => {
      if (search) {
        const q = search.toLowerCase();
        return t.description?.toLowerCase().includes(q) || t.user_name?.toLowerCase().includes(q) || (t as any).cases?.case_number?.toLowerCase().includes(q);
      }
      return true;
    });
  }, [timesheets, search]);

  // KPIs (from all data, not filtered)
  const totalFees = fees?.reduce((acc, f) => acc + Number(f.amount), 0) ?? 0;
  const totalReceitas = entries?.filter((e) => e.entry_type === "receita" && e.status === "pago").reduce((acc, e) => acc + Number(e.amount), 0) ?? 0;
  const totalDespesas = entries?.filter((e) => e.entry_type === "despesa" && e.status === "pago").reduce((acc, e) => acc + Number(e.amount), 0) ?? 0;
  const pendentes = entries?.filter((e) => e.status === "pendente").reduce((acc, e) => acc + Number(e.amount), 0) ?? 0;
  const totalHoras = timesheets?.reduce((acc, t) => acc + Number(t.hours), 0) ?? 0;
  const totalTimesheetValue = timesheets?.reduce((acc, t) => acc + Number(t.hours) * Number(t.hourly_rate), 0) ?? 0;
  const saldo = totalReceitas - totalDespesas;
  const margemPct = totalReceitas > 0 ? ((saldo / totalReceitas) * 100).toFixed(1) : "0";

  // Chart: Fluxo de caixa acumulado
  const cashFlowData = useMemo(() => {
    let accumulated = 0;
    return Array.from({ length: periodMonths }, (_, i) => {
      const month = subMonths(new Date(), periodMonths - 1 - i);
      const monthStr = format(month, "yyyy-MM");
      const label = format(month, "MMM/yy", { locale: ptBR });
      const receitas = entries?.filter((e) => e.entry_type === "receita" && e.status === "pago" && e.paid_date?.startsWith(monthStr)).reduce((a, e) => a + Number(e.amount), 0) ?? 0;
      const despesas = entries?.filter((e) => e.entry_type === "despesa" && e.status === "pago" && e.paid_date?.startsWith(monthStr)).reduce((a, e) => a + Number(e.amount), 0) ?? 0;
      accumulated += receitas - despesas;
      return { name: label, receitas, despesas, saldo: receitas - despesas, acumulado: accumulated };
    });
  }, [entries, periodMonths]);

  // Chart: Honorários por tipo
  const feesByType = Object.entries(feeTypeLabels).map(([key, label]) => ({
    name: label,
    value: fees?.filter((f) => f.fee_type === key).reduce((a, f) => a + Number(f.amount), 0) ?? 0,
  })).filter((d) => d.value > 0);

  // Chart: Top 5 processos por custo
  const topCases = useMemo(() => {
    if (!entries) return [];
    const caseMap: Record<string, { number: string; total: number }> = {};
    entries.forEach((e) => {
      const cn = (e as any).cases?.case_number || "Sem processo";
      if (!caseMap[cn]) caseMap[cn] = { number: cn, total: 0 };
      caseMap[cn].total += Number(e.amount);
    });
    return Object.values(caseMap).sort((a, b) => b.total - a.total).slice(0, 5);
  }, [entries]);

  // Chart: Despesas por categoria
  const expensesByCategory = useMemo(() => {
    if (!entries) return [];
    const catMap: Record<string, number> = {};
    entries.filter((e) => e.entry_type === "despesa").forEach((e) => {
      const cat = e.category || "Sem categoria";
      catMap[cat] = (catMap[cat] || 0) + Number(e.amount);
    });
    return Object.entries(catMap).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 6);
  }, [entries]);

  // Export handlers
  const handleExportEntries = () => {
    const rows = filteredEntries.map((e) => ({
      Tipo: e.entry_type === "receita" ? "Receita" : "Despesa",
      Descrição: e.description,
      Valor: Number(e.amount).toFixed(2),
      Status: statusLabels[e.status],
      Categoria: e.category || "",
      Vencimento: e.due_date || "",
      Pagamento: e.paid_date || "",
      Processo: (e as any).cases?.case_number || "",
    }));
    exportCSV(rows, "lancamentos_financeiros");
    toast({ title: "CSV exportado com sucesso" });
  };

  const handleExportTimesheets = () => {
    const rows = filteredTimesheets.map((t) => ({
      Responsável: t.user_name,
      Descrição: t.description,
      Horas: Number(t.hours).toFixed(1),
      "Valor/Hora": Number(t.hourly_rate).toFixed(2),
      Total: (Number(t.hours) * Number(t.hourly_rate)).toFixed(2),
      Data: t.work_date,
      Processo: (t as any).cases?.case_number || "",
    }));
    exportCSV(rows, "timesheet");
    toast({ title: "CSV exportado com sucesso" });
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Financeiro</h1>
          <p className="text-sm text-muted-foreground">Gestão financeira, honorários e timesheet</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={periodFilter} onValueChange={setPeriodFilter}>
            <SelectTrigger className="h-8 w-[100px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3m">3 meses</SelectItem>
              <SelectItem value="6m">6 meses</SelectItem>
              <SelectItem value="12m">12 meses</SelectItem>
            </SelectContent>
          </Select>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1.5 rounded-xl shadow-glow-primary" style={{ background: "var(--gradient-primary)" }}>
                <Plus className="h-4 w-4" /> Novo Lançamento
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Novo Lançamento Financeiro</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Tipo *</Label>
                    <Select value={newEntry.entry_type} onValueChange={(v) => setNewEntry({ ...newEntry, entry_type: v as "receita" | "despesa" })}>
                      <SelectTrigger className="h-9 text-xs mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="receita">Receita</SelectItem>
                        <SelectItem value="despesa">Despesa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Valor (R$) *</Label>
                    <Input type="number" step="0.01" min="0" placeholder="0,00" className="h-9 text-xs mt-1"
                      value={newEntry.amount} onChange={(e) => setNewEntry({ ...newEntry, amount: e.target.value })} />
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Processo *</Label>
                  <Select value={newEntry.case_id} onValueChange={(v) => setNewEntry({ ...newEntry, case_id: v })}>
                    <SelectTrigger className="h-9 text-xs mt-1"><SelectValue placeholder="Selecione o processo" /></SelectTrigger>
                    <SelectContent>
                      {allCases.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.case_number} {c.employee_name ? `– ${c.employee_name}` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Descrição *</Label>
                  <Textarea placeholder="Descreva o lançamento..." className="text-xs mt-1 min-h-[60px]"
                    value={newEntry.description} onChange={(e) => setNewEntry({ ...newEntry, description: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Categoria</Label>
                    <Input placeholder="Ex: custas, perícia..." className="h-9 text-xs mt-1"
                      value={newEntry.category} onChange={(e) => setNewEntry({ ...newEntry, category: e.target.value })} />
                  </div>
                  <div>
                    <Label className="text-xs">Vencimento</Label>
                    <Input type="date" className="h-9 text-xs mt-1"
                      value={newEntry.due_date} onChange={(e) => setNewEntry({ ...newEntry, due_date: e.target.value })} />
                  </div>
                </div>
                <Button className="w-full gap-2" onClick={() => createEntry.mutate()} disabled={createEntry.isPending || !newEntry.description.trim() || !newEntry.amount || !newEntry.case_id}>
                  <Plus className="h-4 w-4" /> {createEntry.isPending ? "Criando..." : "Criar Lançamento"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="h-4 w-4 text-primary" />
              <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Honorários</span>
            </div>
            <p className="text-lg font-bold">{formatBRL(totalFees)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <ArrowUpRight className="h-4 w-4 text-success" />
              <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Receitas</span>
            </div>
            <p className="text-lg font-bold text-success">{formatBRL(totalReceitas)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <ArrowDownRight className="h-4 w-4 text-destructive" />
              <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Despesas</span>
            </div>
            <p className="text-lg font-bold text-destructive">{formatBRL(totalDespesas)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-info" />
              <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Saldo</span>
            </div>
            <p className={`text-lg font-bold ${saldo >= 0 ? "text-success" : "text-destructive"}`}>{formatBRL(saldo)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Wallet className="h-4 w-4 text-warning" />
              <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Pendentes</span>
            </div>
            <p className="text-lg font-bold text-warning">{formatBRL(pendentes)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 className="h-4 w-4 text-primary" />
              <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Margem</span>
            </div>
            <p className={`text-lg font-bold ${Number(margemPct) >= 0 ? "text-success" : "text-destructive"}`}>{margemPct}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Horas</span>
            </div>
            <p className="text-lg font-bold">{totalHoras.toFixed(1)}h</p>
            <p className="text-[10px] text-muted-foreground">{formatBRL(totalTimesheetValue)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Receipt className="h-4 w-4 text-primary" />
              Fluxo de Caixa ({periodMonths} meses)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <ComposedChart data={cashFlowData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="name" className="text-[10px]" />
                <YAxis className="text-[10px]" tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => formatBRL(v)} />
                <Bar dataKey="receitas" fill="hsl(var(--success))" fillOpacity={0.7} name="Receitas" radius={[2, 2, 0, 0]} />
                <Bar dataKey="despesas" fill="hsl(var(--destructive))" fillOpacity={0.7} name="Despesas" radius={[2, 2, 0, 0]} />
                <Line type="monotone" dataKey="acumulado" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} name="Acumulado" />
                <Legend />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-primary" />
              Honorários por Tipo
            </CardTitle>
          </CardHeader>
          <CardContent>
            {feesByType.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={feesByType} cx="50%" cy="50%" innerRadius={65} outerRadius={95} paddingAngle={4} dataKey="value">
                    {feesByType.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => formatBRL(v)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[280px] text-sm text-muted-foreground">Nenhum honorário cadastrado</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Top 5 Processos por Volume Financeiro</CardTitle>
          </CardHeader>
          <CardContent>
            {topCases.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={topCases} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis type="number" className="text-[10px]" tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
                  <YAxis type="category" dataKey="number" className="text-[10px]" width={120} />
                  <Tooltip formatter={(v: number) => formatBRL(v)} />
                  <Bar dataKey="total" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} name="Total" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[220px] text-sm text-muted-foreground">Sem dados</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Despesas por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            {expensesByCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={expensesByCategory} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                    {expensesByCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => formatBRL(v)} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[220px] text-sm text-muted-foreground">Sem despesas</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-card p-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Buscar descrição, processo, categoria..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 pl-8 text-xs"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-8 w-[120px] text-xs">
            <Filter className="h-3 w-3 mr-1" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos status</SelectItem>
            <SelectItem value="pendente">Pendente</SelectItem>
            <SelectItem value="pago">Pago</SelectItem>
            <SelectItem value="cancelado">Cancelado</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="h-8 w-[120px] text-xs">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos tipos</SelectItem>
            <SelectItem value="receita">Receita</SelectItem>
            <SelectItem value="despesa">Despesa</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tables */}
      <Tabs defaultValue="entries">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <TabsList>
            <TabsTrigger value="entries">Lançamentos ({filteredEntries.length})</TabsTrigger>
            <TabsTrigger value="fees">Honorários ({filteredFees.length})</TabsTrigger>
            <TabsTrigger value="timesheets">Timesheet ({filteredTimesheets.length})</TabsTrigger>
          </TabsList>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8" onClick={handleExportEntries}>
            <Download className="h-3.5 w-3.5" /> Exportar CSV
          </Button>
        </div>

        <TabsContent value="entries" className="space-y-2 mt-3">
          {filteredEntries.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Nenhum lançamento encontrado.</p>
          ) : filteredEntries.map((e) => (
            <div key={e.id} className="flex items-center gap-3 rounded-lg border bg-card p-3 hover:bg-accent/30 transition-colors">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${e.entry_type === "receita" ? "bg-success/10" : "bg-destructive/10"}`}>
                {e.entry_type === "receita" ? <ArrowUpRight className="h-4 w-4 text-success" /> : <ArrowDownRight className="h-4 w-4 text-destructive" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{e.description}</p>
                <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                  <span className="text-[10px] text-muted-foreground">{(e as any).cases?.case_number}</span>
                  {e.category && <span className="text-[10px] text-muted-foreground">· {e.category}</span>}
                  {e.due_date && <span className="text-[10px] text-muted-foreground">· Venc: {format(parseISO(e.due_date), "dd/MM/yy")}</span>}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <div className="text-right">
                  <p className={`text-sm font-semibold ${e.entry_type === "receita" ? "text-success" : "text-destructive"}`}>
                    {e.entry_type === "receita" ? "+" : "-"}{formatBRL(Number(e.amount))}
                  </p>
                  <Badge
                    variant={e.status === "pago" ? "default" : e.status === "pendente" ? "secondary" : "outline"}
                    className="text-[9px]"
                  >
                    {statusLabels[e.status]}
                  </Badge>
                </div>
                {e.status === "pendente" && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-success hover:text-success hover:bg-success/10"
                    title="Marcar como pago"
                    onClick={() => markPaid.mutate(e.id)}
                    disabled={markPaid.isPending}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="fees" className="space-y-2 mt-3">
          {filteredFees.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Nenhum honorário encontrado.</p>
          ) : filteredFees.map((f) => (
            <div key={f.id} className="flex items-center gap-3 rounded-lg border bg-card p-3 hover:bg-accent/30 transition-colors">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <DollarSign className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{f.description}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] text-muted-foreground">{(f as any).cases?.case_number}</span>
                  <Badge variant="outline" className="text-[9px]">{feeTypeLabels[f.fee_type]}</Badge>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-semibold">{formatBRL(Number(f.amount))}</p>
                <p className="text-[10px] text-muted-foreground">{f.paid_installments}/{f.installments} parcelas</p>
              </div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="timesheets" className="space-y-2 mt-3">
          <div className="flex justify-end">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8" onClick={handleExportTimesheets}>
              <Download className="h-3.5 w-3.5" /> Exportar CSV
            </Button>
          </div>
          {filteredTimesheets.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Nenhum registro de horas encontrado.</p>
          ) : filteredTimesheets.map((t) => (
            <div key={t.id} className="flex items-center gap-3 rounded-lg border bg-card p-3 hover:bg-accent/30 transition-colors">
              <div className="h-8 w-8 rounded-full bg-info/10 flex items-center justify-center shrink-0">
                <Clock className="h-4 w-4 text-info" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{t.description}</p>
                <p className="text-[10px] text-muted-foreground">{t.user_name} · {(t as any).cases?.case_number} · {format(new Date(t.work_date), "dd/MM/yyyy")}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-semibold">{Number(t.hours).toFixed(1)}h</p>
                <p className="text-[10px] text-muted-foreground">{formatBRL(Number(t.hours) * Number(t.hourly_rate))}</p>
              </div>
            </div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
