import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DollarSign, TrendingUp, TrendingDown, Clock, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts";
import { format, startOfMonth, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";

const COLORS = ["hsl(var(--primary))", "hsl(var(--destructive))", "hsl(var(--warning))", "hsl(var(--success))", "hsl(var(--info))"];

const statusLabels: Record<string, string> = {
  pendente: "Pendente",
  pago: "Pago",
  cancelado: "Cancelado",
};

const feeTypeLabels: Record<string, string> = {
  fixo: "Fixo",
  exito: "Êxito",
  provisorio: "Provisório",
  ad_hoc: "Ad Hoc",
};

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function Financeiro() {
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

  // KPIs
  const totalFees = fees?.reduce((acc, f) => acc + Number(f.amount), 0) ?? 0;
  const totalReceitas = entries?.filter((e) => e.entry_type === "receita" && e.status === "pago").reduce((acc, e) => acc + Number(e.amount), 0) ?? 0;
  const totalDespesas = entries?.filter((e) => e.entry_type === "despesa" && e.status === "pago").reduce((acc, e) => acc + Number(e.amount), 0) ?? 0;
  const pendentes = entries?.filter((e) => e.status === "pendente").reduce((acc, e) => acc + Number(e.amount), 0) ?? 0;
  const totalHoras = timesheets?.reduce((acc, t) => acc + Number(t.hours), 0) ?? 0;
  const totalTimesheetValue = timesheets?.reduce((acc, t) => acc + Number(t.hours) * Number(t.hourly_rate), 0) ?? 0;

  // Chart: Receitas vs Despesas por mês (últimos 6 meses)
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const month = subMonths(new Date(), 5 - i);
    const monthStr = format(month, "yyyy-MM");
    const label = format(month, "MMM/yy", { locale: ptBR });
    const receitas = entries?.filter((e) => e.entry_type === "receita" && e.status === "pago" && e.paid_date?.startsWith(monthStr)).reduce((a, e) => a + Number(e.amount), 0) ?? 0;
    const despesas = entries?.filter((e) => e.entry_type === "despesa" && e.status === "pago" && e.paid_date?.startsWith(monthStr)).reduce((a, e) => a + Number(e.amount), 0) ?? 0;
    return { name: label, receitas, despesas };
  });

  // Chart: Honorários por tipo
  const feesByType = Object.entries(feeTypeLabels).map(([key, label]) => ({
    name: label,
    value: fees?.filter((f) => f.fee_type === key).reduce((a, f) => a + Number(f.amount), 0) ?? 0,
  })).filter((d) => d.value > 0);

  // Chart: Status dos lançamentos
  const entriesByStatus = Object.entries(statusLabels).map(([key, label]) => ({
    name: label,
    value: entries?.filter((e) => e.status === key).reduce((a, e) => a + Number(e.amount), 0) ?? 0,
  })).filter((d) => d.value > 0);

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-2xl font-bold">Financeiro</h1>
        <p className="text-sm text-muted-foreground">Gestão financeira, honorários e timesheet</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
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
            <p className={`text-lg font-bold ${totalReceitas - totalDespesas >= 0 ? "text-success" : "text-destructive"}`}>
              {formatBRL(totalReceitas - totalDespesas)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-4 w-4 text-warning" />
              <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Pendentes</span>
            </div>
            <p className="text-lg font-bold text-warning">{formatBRL(pendentes)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Horas</span>
            </div>
            <p className="text-lg font-bold">{totalHoras.toFixed(1)}h</p>
            <p className="text-[10px] text-muted-foreground">{formatBRL(totalTimesheetValue)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Receitas vs Despesas (6 meses)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="name" className="text-[10px]" />
                <YAxis className="text-[10px]" tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => formatBRL(v)} />
                <Area type="monotone" dataKey="receitas" stackId="1" stroke="hsl(var(--success))" fill="hsl(var(--success))" fillOpacity={0.3} name="Receitas" />
                <Area type="monotone" dataKey="despesas" stackId="2" stroke="hsl(var(--destructive))" fill="hsl(var(--destructive))" fillOpacity={0.3} name="Despesas" />
                <Legend />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Honorários por Tipo</CardTitle>
          </CardHeader>
          <CardContent>
            {feesByType.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={feesByType} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                    {feesByType.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => formatBRL(v)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[250px] text-sm text-muted-foreground">Nenhum honorário cadastrado</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tables */}
      <Tabs defaultValue="entries">
        <TabsList>
          <TabsTrigger value="entries">Lançamentos ({entries?.length ?? 0})</TabsTrigger>
          <TabsTrigger value="fees">Honorários ({fees?.length ?? 0})</TabsTrigger>
          <TabsTrigger value="timesheets">Timesheet ({timesheets?.length ?? 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="entries" className="space-y-2 mt-3">
          {(!entries || entries.length === 0) ? (
            <p className="text-sm text-muted-foreground text-center py-8">Nenhum lançamento financeiro cadastrado.</p>
          ) : entries.map((e) => (
            <div key={e.id} className="flex items-center gap-3 rounded-lg border bg-card p-3">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${e.entry_type === "receita" ? "bg-success/10" : "bg-destructive/10"}`}>
                {e.entry_type === "receita" ? <ArrowUpRight className="h-4 w-4 text-success" /> : <ArrowDownRight className="h-4 w-4 text-destructive" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{e.description}</p>
                <p className="text-[10px] text-muted-foreground">{(e as any).cases?.case_number} · {e.category ?? "Sem categoria"}</p>
              </div>
              <div className="text-right shrink-0">
                <p className={`text-sm font-semibold ${e.entry_type === "receita" ? "text-success" : "text-destructive"}`}>
                  {e.entry_type === "receita" ? "+" : "-"}{formatBRL(Number(e.amount))}
                </p>
                <Badge variant="outline" className="text-[9px]">{statusLabels[e.status]}</Badge>
              </div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="fees" className="space-y-2 mt-3">
          {(!fees || fees.length === 0) ? (
            <p className="text-sm text-muted-foreground text-center py-8">Nenhum honorário cadastrado.</p>
          ) : fees.map((f) => (
            <div key={f.id} className="flex items-center gap-3 rounded-lg border bg-card p-3">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <DollarSign className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{f.description}</p>
                <p className="text-[10px] text-muted-foreground">{(f as any).cases?.case_number} · {feeTypeLabels[f.fee_type]}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-semibold">{formatBRL(Number(f.amount))}</p>
                <p className="text-[10px] text-muted-foreground">{f.paid_installments}/{f.installments} parcelas</p>
              </div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="timesheets" className="space-y-2 mt-3">
          {(!timesheets || timesheets.length === 0) ? (
            <p className="text-sm text-muted-foreground text-center py-8">Nenhum registro de horas.</p>
          ) : timesheets.map((t) => (
            <div key={t.id} className="flex items-center gap-3 rounded-lg border bg-card p-3">
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
