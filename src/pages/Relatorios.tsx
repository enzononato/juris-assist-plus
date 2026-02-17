import { useState, useMemo } from "react";
import {
  BarChart3, TrendingUp, Clock, AlertTriangle, CheckCircle2, FileText,
  Building2, Filter, Download, Users, Shield, CalendarDays, Printer, Share2,
  Calendar,
} from "lucide-react";
import { subMonths, subDays, startOfYear, isAfter, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, LineChart, Line,
} from "recharts";
import {
  mockCases, mockTasks, mockDeadlines, mockEvidenceRequests,
  mockAlerts, mockCompanies, mockDownloadLogs, mockEvidenceItems,
  statusLabels, type CaseStatus, taskStatusLabels,
} from "@/data/mock";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

type PeriodFilter = "todos" | "7d" | "30d" | "3m" | "6m" | "1a" | "ytd" | "custom";

const periodLabels: Record<PeriodFilter, string> = {
  todos: "Todo o período",
  "7d": "Últimos 7 dias",
  "30d": "Último mês",
  "3m": "Último trimestre",
  "6m": "Últimos 6 meses",
  "1a": "Último ano",
  ytd: "Ano atual (YTD)",
  custom: "Personalizado",
};

function getPeriodStartDate(period: PeriodFilter, customStart?: Date): Date | null {
  const now = new Date();
  switch (period) {
    case "todos": return null;
    case "7d": return subDays(now, 7);
    case "30d": return subMonths(now, 1);
    case "3m": return subMonths(now, 3);
    case "6m": return subMonths(now, 6);
    case "1a": return subMonths(now, 12);
    case "ytd": return startOfYear(now);
    case "custom": return customStart || null;
    default: return null;
  }
}

const CHART_COLORS = [
  "hsl(230, 65%, 48%)",
  "hsl(38, 92%, 50%)",
  "hsl(152, 60%, 40%)",
  "hsl(0, 72%, 51%)",
  "hsl(210, 80%, 52%)",
  "hsl(270, 50%, 55%)",
];

export default function Relatorios() {
  const [companyFilter, setCompanyFilter] = useState("todas");
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>("todos");
  const [customStartDate, setCustomStartDate] = useState<Date | undefined>();
  const [customEndDate, setCustomEndDate] = useState<Date | undefined>();
  const [tab, setTab] = useState("visao-geral");

  const periodStart = getPeriodStartDate(periodFilter, customStartDate);
  const periodEnd = periodFilter === "custom" && customEndDate ? customEndDate : new Date();

  const filteredCases = useMemo(() => {
    let cases = companyFilter === "todas"
      ? mockCases
      : mockCases.filter((c) => c.company_id === companyFilter);
    if (periodStart) {
      cases = cases.filter((c) => {
        const filed = new Date(c.filed_at);
        return isAfter(filed, periodStart) && !isAfter(filed, periodEnd);
      });
    }
    return cases;
  }, [companyFilter, periodStart, periodEnd]);
  const caseIds = new Set(filteredCases.map((c) => c.id));

  // KPIs
  const totalRequests = mockEvidenceRequests.filter((r) => caseIds.has(r.case_id));
  const slaMet = totalRequests.filter((r) => r.status === "atendida").length;
  const slaPercent = totalRequests.length > 0 ? Math.round((slaMet / totalRequests.length) * 100) : 0;
  const criticalAlerts = mockAlerts.filter((a) => a.severity === "urgente" && !a.treated).length;
  const overdueTasks = mockTasks.filter((t) => t.status !== "concluida" && caseIds.has(t.case_id || "") && new Date(t.due_at) < new Date()).length;
  const totalEvidence = mockEvidenceItems.filter((i) => caseIds.has(i.case_id)).length;
  const validatedEvidence = mockEvidenceItems.filter((i) => caseIds.has(i.case_id) && i.status === "validado").length;
  const completedTasks = mockTasks.filter((t) => t.status === "concluida").length;
  const totalTasks = mockTasks.length;
  const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Charts
  const statusData = (Object.entries(statusLabels) as [CaseStatus, string][])
    .map(([key, label]) => ({ name: label, value: filteredCases.filter((c) => c.status === key).length }))
    .filter((d) => d.value > 0);

  const themeData = Object.entries(
    filteredCases.reduce((acc, c) => { acc[c.theme] = (acc[c.theme] || 0) + 1; return acc; }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

  const companyData = mockCompanies
    .map((co) => ({
      name: co.name.replace("Revalle ", ""),
      processos: mockCases.filter((c) => c.company_id === co.id).length,
      tarefas: mockTasks.filter((t) => mockCases.find((c) => c.id === t.case_id && c.company_id === co.id)).length,
    }))
    .filter((d) => d.processos > 0 || d.tarefas > 0);

  const monthlyData = [
    { month: "Set", novos: 1, encerrados: 0, sla: 100 },
    { month: "Out", novos: 0, encerrados: 0, sla: 100 },
    { month: "Nov", novos: 1, encerrados: 0, sla: 80 },
    { month: "Dez", novos: 0, encerrados: 0, sla: 90 },
    { month: "Jan", novos: 1, encerrados: 0, sla: 75 },
    { month: "Fev", novos: 2, encerrados: 1, sla: 33 },
  ];

  // Task by assignee
  const assigneeCounts: Record<string, { total: number; concluida: number; pendente: number }> = {};
  mockTasks.filter((t) => !t.case_id || caseIds.has(t.case_id)).forEach((t) => {
    t.assignees.forEach((a) => {
      if (!assigneeCounts[a]) assigneeCounts[a] = { total: 0, concluida: 0, pendente: 0 };
      assigneeCounts[a].total++;
      if (t.status === "concluida") assigneeCounts[a].concluida++;
      else assigneeCounts[a].pendente++;
    });
  });
  const assigneeData = Object.entries(assigneeCounts)
    .map(([name, v]) => ({ name: name.split(" ")[0], concluidas: v.concluida, pendentes: v.pendente }))
    .sort((a, b) => (b.concluidas + b.pendentes) - (a.concluidas + a.pendentes));

  // Radar data for operational health
  const radarData = [
    { metric: "SLA Provas", value: slaPercent },
    { metric: "Alertas Tratados", value: mockAlerts.length > 0 ? Math.round((mockAlerts.filter((a) => a.treated).length / mockAlerts.length) * 100) : 100 },
    { metric: "Tarefas Concluídas", value: taskCompletionRate },
    { metric: "Provas Validadas", value: totalEvidence > 0 ? Math.round((validatedEvidence / totalEvidence) * 100) : 100 },
    { metric: "Prazos Cumpridos", value: mockDeadlines.length > 0 ? Math.round((mockDeadlines.filter((d) => d.status === "cumprido").length / mockDeadlines.length) * 100) : 100 },
  ];

  // Risk score
  const riskScore = Math.round(
    (100 - slaPercent) * 0.3 +
    criticalAlerts * 15 +
    overdueTasks * 10
  );
  const riskLevel = riskScore >= 60 ? "Alto" : riskScore >= 30 ? "Médio" : "Baixo";
  const riskColor = riskScore >= 60 ? "text-destructive" : riskScore >= 30 ? "text-warning" : "text-success";

  const handleExport = (format: string) => {
    toast({ title: `📥 Exportação ${format.toUpperCase()}`, description: `Relatório exportado em ${format.toUpperCase()}. (Demo)` });
  };

  const handlePrint = () => {
    toast({ title: "🖨️ Impressão", description: "Preparando relatório para impressão... (Demo)" });
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight sm:text-2xl">Dashboard Executivo</h1>
          <p className="text-sm text-muted-foreground font-medium">KPIs operacionais, análise executiva e relatórios</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={companyFilter} onValueChange={setCompanyFilter}>
            <SelectTrigger className="w-[180px] h-9 text-xs rounded-xl" aria-label="Filtrar por empresa">
              <Filter className="mr-1.5 h-3.5 w-3.5" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="todas">Todas as empresas</SelectItem>
              {mockCompanies.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={periodFilter} onValueChange={(v) => setPeriodFilter(v as PeriodFilter)}>
            <SelectTrigger className="w-[180px] h-9 text-xs rounded-xl" aria-label="Filtrar por período">
              <Calendar className="mr-1.5 h-3.5 w-3.5" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {(Object.entries(periodLabels) as [PeriodFilter, string][]).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {periodFilter === "custom" && (
            <div className="flex items-center gap-1.5">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className={cn("h-9 text-xs rounded-xl gap-1.5", !customStartDate && "text-muted-foreground")}>
                    <CalendarDays className="h-3.5 w-3.5" />
                    {customStartDate ? format(customStartDate, "dd/MM/yy") : "Início"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarPicker
                    mode="single"
                    selected={customStartDate}
                    onSelect={setCustomStartDate}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
              <span className="text-xs text-muted-foreground">até</span>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className={cn("h-9 text-xs rounded-xl gap-1.5", !customEndDate && "text-muted-foreground")}>
                    <CalendarDays className="h-3.5 w-3.5" />
                    {customEndDate ? format(customEndDate, "dd/MM/yy") : "Fim"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarPicker
                    mode="single"
                    selected={customEndDate}
                    onSelect={setCustomEndDate}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}

          {periodFilter !== "todos" && (
            <Badge variant="outline" className="h-9 rounded-xl text-xs px-3 flex items-center gap-1.5 bg-primary/5 border-primary/20">
              <Calendar className="h-3 w-3 text-primary" />
              {filteredCases.length} processo{filteredCases.length !== 1 ? "s" : ""} no período
            </Badge>
          )}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1.5 text-xs rounded-xl hover:shadow-card transition-all" onClick={() => handleExport("pdf")} aria-label="Exportar PDF">
                  <Download className="h-3.5 w-3.5" /> PDF
                </Button>
              </TooltipTrigger>
              <TooltipContent><p className="text-xs">Exportar relatório em PDF</p></TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1.5 text-xs rounded-xl hover:shadow-card transition-all" onClick={() => handleExport("xlsx")} aria-label="Exportar Excel">
                  <Download className="h-3.5 w-3.5" /> Excel
                </Button>
              </TooltipTrigger>
              <TooltipContent><p className="text-xs">Exportar dados em Excel</p></TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1.5 text-xs rounded-xl hover:shadow-card transition-all" onClick={() => handleExport("csv")} aria-label="Exportar CSV">
                  <Share2 className="h-3.5 w-3.5" /> CSV
                </Button>
              </TooltipTrigger>
              <TooltipContent><p className="text-xs">Exportar dados em CSV</p></TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl hover:shadow-card transition-all" onClick={handlePrint} aria-label="Imprimir">
                  <Printer className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent><p className="text-xs">Imprimir relatório</p></TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Executive Summary KPIs — always visible */}
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-5">
        <KPICard icon={<CheckCircle2 />} label="SLA Provas 72h" value={`${slaPercent}%`} sub={`${slaMet}/${totalRequests.length} cumpridos`} color="text-success" bg="bg-success/10" trend={slaPercent >= 70 ? "up" : "down"} delay={0} />
        <KPICard icon={<AlertTriangle />} label="Alertas Críticos" value={String(criticalAlerts)} sub="não tratados" color="text-destructive" bg="bg-destructive/10" trend={criticalAlerts === 0 ? "up" : "down"} delay={1} />
        <KPICard icon={<Clock />} label="Tarefas Vencidas" value={String(overdueTasks)} sub="em atraso" color="text-warning" bg="bg-warning/10" trend={overdueTasks === 0 ? "up" : "down"} delay={2} />
        <KPICard icon={<FileText />} label="Evidências" value={`${validatedEvidence}/${totalEvidence}`} sub="validadas" color="text-info" bg="bg-info/10" trend={validatedEvidence === totalEvidence ? "up" : "neutral"} delay={3} />
        <KPICard icon={<Shield />} label="Risco Geral" value={riskLevel} sub={`Score: ${riskScore}`} color={riskColor} bg={riskScore >= 60 ? "bg-destructive/10" : riskScore >= 30 ? "bg-warning/10" : "bg-success/10"} trend={riskScore < 30 ? "up" : "down"} delay={4} />
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <div className="mb-5 overflow-x-auto scrollbar-hide">
          <TabsList className="w-max">
            <TabsTrigger value="visao-geral" className="text-xs">Visão Geral</TabsTrigger>
            <TabsTrigger value="processos" className="text-xs">Processos</TabsTrigger>
            <TabsTrigger value="operacional" className="text-xs">Operacional</TabsTrigger>
            <TabsTrigger value="sla" className="text-xs">SLA & Provas</TabsTrigger>
          </TabsList>
        </div>

        {/* VISÃO GERAL */}
        <TabsContent value="visao-geral">
          <div className="grid gap-4 lg:grid-cols-2">
            <ChartCard title="Saúde Operacional" icon={<Shield className="h-4 w-4 text-primary" />} delay={0}>
              <ResponsiveContainer width="100%" height={280}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} />
                  <Radar name="%" dataKey="value" stroke="hsl(230, 65%, 48%)" fill="hsl(230, 65%, 48%)" fillOpacity={0.2} />
                  <RechartsTooltip />
                </RadarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Evolução Mensal" icon={<TrendingUp className="h-4 w-4 text-success" />} delay={1}>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <RechartsTooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} />
                  <Area type="monotone" dataKey="novos" stroke="hsl(230, 65%, 48%)" fill="hsl(230, 65%, 48%)" fillOpacity={0.15} name="Novos" />
                  <Area type="monotone" dataKey="encerrados" stroke="hsl(152, 60%, 40%)" fill="hsl(152, 60%, 40%)" fillOpacity={0.15} name="Encerrados" />
                  <Legend wrapperStyle={{ fontSize: "11px" }} />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Processos por Status" icon={<BarChart3 className="h-4 w-4 text-primary" />} className="lg:col-span-1" delay={2}>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={100} label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                    {statusData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Pie>
                  <RechartsTooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} />
                  <Legend wrapperStyle={{ fontSize: "11px" }} />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Tarefas por Responsável" icon={<Users className="h-4 w-4 text-primary" />} delay={3}>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={assigneeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <RechartsTooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} />
                  <Bar dataKey="concluidas" fill="hsl(152, 60%, 40%)" name="Concluídas" stackId="a" />
                  <Bar dataKey="pendentes" fill="hsl(38, 92%, 50%)" name="Pendentes" stackId="a" radius={[4, 4, 0, 0]} />
                  <Legend wrapperStyle={{ fontSize: "11px" }} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </TabsContent>

        {/* PROCESSOS */}
        <TabsContent value="processos">
          <div className="grid gap-4 lg:grid-cols-2">
            <ChartCard title="Processos por Status" icon={<BarChart3 className="h-4 w-4 text-primary" />} delay={0}>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={100} label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                    {statusData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Pie>
                  <RechartsTooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} />
                  <Legend wrapperStyle={{ fontSize: "11px" }} />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Volume por Tema" icon={<FileText className="h-4 w-4 text-info" />} delay={1}>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={themeData} layout="vertical" margin={{ left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <RechartsTooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} />
                  <Bar dataKey="value" fill="hsl(230, 65%, 48%)" radius={[0, 4, 4, 0]} name="Processos" />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Por Empresa / Filial" icon={<Building2 className="h-4 w-4 text-warning" />} delay={2}>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={companyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <RechartsTooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} />
                  <Bar dataKey="processos" fill="hsl(230, 65%, 48%)" name="Processos" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="tarefas" fill="hsl(38, 92%, 50%)" name="Tarefas" radius={[4, 4, 0, 0]} />
                  <Legend wrapperStyle={{ fontSize: "11px" }} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Sigilo dos Processos" icon={<Shield className="h-4 w-4 text-destructive" />} delay={3}>
              <div className="space-y-4 pt-4">
                {(["normal", "restrito", "ultra_restrito"] as const).map((level) => {
                  const count = filteredCases.filter((c) => c.confidentiality === level).length;
                  const pct = filteredCases.length > 0 ? Math.round((count / filteredCases.length) * 100) : 0;
                  const labels = { normal: "Normal", restrito: "Restrito", ultra_restrito: "Ultra Restrito" };
                  const colors = { normal: "bg-success", restrito: "bg-warning", ultra_restrito: "bg-destructive" };
                  return (
                    <div key={level}>
                      <div className="mb-1.5 flex justify-between text-xs">
                        <span className="font-semibold">{labels[level]}</span>
                        <span className="text-muted-foreground font-medium">{count} ({pct}%)</span>
                      </div>
                      <div className="h-3 overflow-hidden rounded-full bg-muted/60">
                        <div className={cn("h-full rounded-full transition-all duration-700 ease-out", colors[level])} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </ChartCard>
          </div>
        </TabsContent>

        {/* OPERACIONAL */}
        <TabsContent value="operacional">
          <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <KPICard icon={<Users />} label="Responsáveis Ativos" value="5" sub="com alertas configurados" color="text-primary" bg="bg-primary/10" delay={0} />
            <KPICard icon={<CalendarDays />} label="Audiências Próx. 30d" value={String(mockDeadlines.filter((d) => d.status === "pendente").length)} sub="agendadas" color="text-warning" bg="bg-warning/10" delay={1} />
            <KPICard icon={<Shield />} label="Downloads c/ Marca" value={String(mockDownloadLogs.filter((d) => d.watermarked).length)} sub="com marca d'água" color="text-info" bg="bg-info/10" delay={2} />
            <KPICard icon={<TrendingUp />} label="Taxa Conclusão" value={`${taskCompletionRate}%`} sub={`${completedTasks}/${totalTasks} tarefas`} color="text-success" bg="bg-success/10" trend={taskCompletionRate >= 50 ? "up" : "down"} delay={3} />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <ChartCard title="Tarefas por Responsável" icon={<Users className="h-4 w-4 text-primary" />} delay={0}>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={assigneeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <RechartsTooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} />
                  <Bar dataKey="concluidas" fill="hsl(152, 60%, 40%)" name="Concluídas" stackId="a" />
                  <Bar dataKey="pendentes" fill="hsl(38, 92%, 50%)" name="Pendentes" stackId="a" radius={[4, 4, 0, 0]} />
                  <Legend wrapperStyle={{ fontSize: "11px" }} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="SLA Compliance Mensal" icon={<CheckCircle2 className="h-4 w-4 text-success" />} delay={1}>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} domain={[0, 100]} />
                  <RechartsTooltip formatter={(v: number) => `${v}%`} contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} />
                  <Area type="monotone" dataKey="sla" stroke="hsl(152, 60%, 40%)" fill="hsl(152, 60%, 40%)" fillOpacity={0.2} name="SLA %" />
                  {/* Target line */}
                  <Line type="monotone" dataKey={() => 80} stroke="hsl(var(--destructive))" strokeDasharray="5 5" name="Meta 80%" dot={false} />
                  <Legend wrapperStyle={{ fontSize: "11px" }} />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </TabsContent>

        {/* SLA & PROVAS */}
        <TabsContent value="sla">
          <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <KPICard icon={<CheckCircle2 />} label="SLA Cumprido" value={`${slaPercent}%`} sub={`${slaMet} de ${totalRequests.length}`} color="text-success" bg="bg-success/10" trend={slaPercent >= 80 ? "up" : "down"} delay={0} />
            <KPICard icon={<AlertTriangle />} label="Atrasados" value={String(totalRequests.filter((r) => r.status === "atrasada").length)} sub="solicitações" color="text-destructive" bg="bg-destructive/10" delay={1} />
            <KPICard icon={<FileText />} label="Total Evidências" value={String(totalEvidence)} sub={`${validatedEvidence} validadas`} color="text-info" bg="bg-info/10" delay={2} />
            <KPICard icon={<Download />} label="Downloads" value={String(mockDownloadLogs.length)} sub={`${mockDownloadLogs.filter((d) => d.watermarked).length} c/ marca`} color="text-primary" bg="bg-primary/10" delay={3} />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <ChartCard title="Status das Solicitações" icon={<BarChart3 className="h-4 w-4 text-primary" />} delay={0}>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={[
                      { name: "Aberta", value: totalRequests.filter((r) => r.status === "aberta").length },
                      { name: "Parcial", value: totalRequests.filter((r) => r.status === "parcialmente_atendida").length },
                      { name: "Atendida", value: totalRequests.filter((r) => r.status === "atendida").length },
                      { name: "Atrasada", value: totalRequests.filter((r) => r.status === "atrasada").length },
                    ].filter((d) => d.value > 0)}
                    dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={100}
                    label={({ name, value }) => `${name}: ${value}`} labelLine={false}
                  >
                    <Cell fill="hsl(210, 80%, 52%)" />
                    <Cell fill="hsl(38, 92%, 50%)" />
                    <Cell fill="hsl(152, 60%, 40%)" />
                    <Cell fill="hsl(0, 72%, 51%)" />
                  </Pie>
                  <RechartsTooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} />
                  <Legend wrapperStyle={{ fontSize: "11px" }} />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Evidências por Categoria" icon={<FileText className="h-4 w-4 text-info" />} delay={1}>
              <div className="space-y-3 pt-2">
                {Object.entries(
                  mockEvidenceItems.reduce((acc, i) => {
                    const cat = i.category.replace(/_/g, " ");
                    acc[cat] = (acc[cat] || 0) + 1;
                    return acc;
                  }, {} as Record<string, number>)
                ).sort((a, b) => b[1] - a[1]).map(([cat, count], i) => (
                  <div key={cat}>
                    <div className="mb-1 flex justify-between text-xs">
                      <span className="font-semibold capitalize">{cat}</span>
                      <span className="text-muted-foreground font-medium">{count}</span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-muted/60">
                      <div className="h-full rounded-full transition-all duration-700 ease-out" style={{
                        width: `${(count / mockEvidenceItems.length) * 100}%`,
                        backgroundColor: CHART_COLORS[i % CHART_COLORS.length],
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            </ChartCard>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function KPICard({ icon, label, value, sub, color, bg, trend, delay = 0 }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  color: string;
  bg: string;
  trend?: "up" | "down" | "neutral";
  delay?: number;
}) {
  return (
    <div
      className="rounded-xl border bg-card p-4 shadow-soft hover:shadow-card transition-all duration-300 hover:-translate-y-0.5 animate-in fade-in slide-in-from-bottom-2 duration-500"
      style={{ animationDelay: `${delay * 80}ms` }}
      role="article"
      aria-label={`${label}: ${value}`}
    >
      <div className="mb-2 flex items-center justify-between">
        <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl [&>svg]:h-4.5 [&>svg]:w-4.5", bg, color)}>{icon}</div>
        {trend && (
          <span className={cn("text-[10px] font-bold", trend === "up" ? "text-success" : trend === "down" ? "text-destructive" : "text-muted-foreground")}>
            {trend === "up" ? "▲" : trend === "down" ? "▼" : "—"}
          </span>
        )}
      </div>
      <p className="text-2xl font-extrabold tracking-tight">{value}</p>
      <p className="text-[11px] font-semibold text-muted-foreground">{label}</p>
      <p className="text-[10px] text-muted-foreground/70">{sub}</p>
    </div>
  );
}

function ChartCard({ title, icon, children, className, delay = 0 }: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <div
      className={cn("rounded-xl border bg-card p-4 shadow-soft hover:shadow-card transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 duration-500", className)}
      style={{ animationDelay: `${delay * 100}ms` }}
    >
      <div className="mb-3 flex items-center gap-2">
        {icon}
        <h3 className="text-sm font-bold">{title}</h3>
      </div>
      {children}
    </div>
  );
}
