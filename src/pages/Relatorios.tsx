import { useState, useMemo } from "react";
import {
  BarChart3, TrendingUp, Clock, AlertTriangle, CheckCircle2, FileText,
  Building2, Filter, Download, Users, Shield, CalendarDays, Printer, Share2,
  Calendar, DollarSign, Scale, Gavel, Flame, Target, PiggyBank, LayoutGrid,
  Eye, EyeOff, GripVertical, Plus,
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
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, LineChart, Line,
  ScatterChart, Scatter, ZAxis, Treemap,
} from "recharts";
import {
  mockCases, mockTasks, mockDeadlines, mockEvidenceRequests,
  mockAlerts, mockCompanies, mockDownloadLogs, mockEvidenceItems,
  statusLabels, type CaseStatus, taskStatusLabels,
} from "@/data/mock";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { KPICard, ChartCard, CHART_COLORS } from "@/components/relatorios/RelatoriosShared";

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

// Risk heatmap color helper
function getRiskColor(score: number): string {
  if (score >= 80) return "hsl(0, 72%, 51%)";
  if (score >= 60) return "hsl(0, 72%, 60%)";
  if (score >= 40) return "hsl(38, 92%, 50%)";
  if (score >= 20) return "hsl(38, 92%, 65%)";
  return "hsl(152, 60%, 40%)";
}

function getRiskBg(score: number): string {
  if (score >= 80) return "bg-destructive/20";
  if (score >= 60) return "bg-destructive/10";
  if (score >= 40) return "bg-warning/15";
  if (score >= 20) return "bg-warning/10";
  return "bg-success/10";
}

// Provisão calculation
function calcProvisao(status: CaseStatus, amount: number): { prob: number; provisao: number } {
  const probMap: Record<CaseStatus, number> = {
    novo: 0.3, em_andamento: 0.4, audiencia_marcada: 0.5,
    sentenca: 0.7, recurso: 0.6, encerrado: 0,
  };
  const prob = probMap[status] ?? 0.3;
  return { prob, provisao: amount * prob };
}

// Widget types for customizable dashboard
interface DashWidget {
  id: string;
  label: string;
  icon: React.ReactNode;
  visible: boolean;
}

const DEFAULT_WIDGETS: DashWidget[] = [
  { id: "kpi-risk", label: "KPIs de Risco", icon: <Shield className="h-3.5 w-3.5" />, visible: true },
  { id: "heatmap-mini", label: "Heatmap Resumo", icon: <Flame className="h-3.5 w-3.5" />, visible: true },
  { id: "provisao-total", label: "Provisão Total", icon: <PiggyBank className="h-3.5 w-3.5" />, visible: true },
  { id: "bench-top5", label: "Top 5 Temas", icon: <Target className="h-3.5 w-3.5" />, visible: true },
  { id: "timeline-processos", label: "Timeline Processos", icon: <TrendingUp className="h-3.5 w-3.5" />, visible: true },
  { id: "radar-saude", label: "Radar Saúde", icon: <Shield className="h-3.5 w-3.5" />, visible: false },
  { id: "tarefas-resp", label: "Tarefas/Responsável", icon: <Users className="h-3.5 w-3.5" />, visible: false },
  { id: "sla-mensal", label: "SLA Mensal", icon: <CheckCircle2 className="h-3.5 w-3.5" />, visible: false },
];

export default function Relatorios() {
  const [companyFilter, setCompanyFilter] = useState("todas");
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>("todos");
  const [customStartDate, setCustomStartDate] = useState<Date | undefined>();
  const [customEndDate, setCustomEndDate] = useState<Date | undefined>();
  const [tab, setTab] = useState("visao-geral");
  const [widgets, setWidgets] = useState<DashWidget[]>(() => {
    const saved = localStorage.getItem("siag_dashboard_widgets");
    return saved ? JSON.parse(saved) : DEFAULT_WIDGETS;
  });

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

  // Charts data
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

  const monthlyData = useMemo(() => {
    const months: { month: string; novos: number; encerrados: number; emAndamento: number; sla: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = subMonths(new Date(), i);
      const label = format(d, "MMM/yy", { locale: ptBR });
      const y = d.getFullYear();
      const m = d.getMonth();
      const novos = mockCases.filter((c) => { const f = new Date(c.filed_at); return f.getFullYear() === y && f.getMonth() === m; }).length;
      const emAndamento = mockCases.filter((c) => { const f = new Date(c.filed_at); return f.getFullYear() < y || (f.getFullYear() === y && f.getMonth() <= m); }).length;
      months.push({ month: label, novos, encerrados: 0, emAndamento, sla: 100 - i * 3 });
    }
    return months;
  }, []);

  const amountByCompany = useMemo(() =>
    mockCompanies.map((co) => {
      const cases = filteredCases.filter((c) => c.company_id === co.id);
      return { name: co.name.replace("Revalle ", ""), valor: cases.reduce((s, c) => s + (c.amount ?? 0), 0) / 1000, processos: cases.length };
    }).filter((d) => d.processos > 0).sort((a, b) => b.valor - a.valor),
  [filteredCases]);

  const amountByTheme = useMemo(() => {
    const acc: Record<string, number> = {};
    filteredCases.forEach((c) => { acc[c.theme] = (acc[c.theme] ?? 0) + (c.amount ?? 0); });
    return Object.entries(acc).map(([name, valor]) => ({ name, valor: valor / 1000 })).sort((a, b) => b.valor - a.valor);
  }, [filteredCases]);

  const totalAmount = filteredCases.reduce((s, c) => s + (c.amount ?? 0), 0);
  const avgAmount = filteredCases.length > 0 ? totalAmount / filteredCases.length : 0;
  const withDeadline = filteredCases.filter((c) => c.next_deadline).length;
  const withHearing = filteredCases.filter((c) => c.next_hearing).length;

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

  const radarData = [
    { metric: "SLA Provas", value: slaPercent },
    { metric: "Alertas Tratados", value: mockAlerts.length > 0 ? Math.round((mockAlerts.filter((a) => a.treated).length / mockAlerts.length) * 100) : 100 },
    { metric: "Tarefas Concluídas", value: taskCompletionRate },
    { metric: "Provas Validadas", value: totalEvidence > 0 ? Math.round((validatedEvidence / totalEvidence) * 100) : 100 },
    { metric: "Prazos Cumpridos", value: mockDeadlines.length > 0 ? Math.round((mockDeadlines.filter((d) => d.status === "cumprido").length / mockDeadlines.length) * 100) : 100 },
  ];

  const riskScore = Math.round((100 - slaPercent) * 0.3 + criticalAlerts * 15 + overdueTasks * 10);
  const riskLevel = riskScore >= 60 ? "Alto" : riskScore >= 30 ? "Médio" : "Baixo";
  const riskColor = riskScore >= 60 ? "text-destructive" : riskScore >= 30 ? "text-warning" : "text-success";

  // === BI AVANÇADO DATA ===

  // Heatmap: risk per branch × theme
  const heatmapData = useMemo(() => {
    const branches = [...new Set(filteredCases.map((c) => c.branch))];
    const themes = [...new Set(filteredCases.map((c) => c.theme))];
    return branches.map((branch) => {
      const row: any = { branch };
      themes.forEach((theme) => {
        const cases = filteredCases.filter((c) => c.branch === branch && c.theme === theme);
        const count = cases.length;
        const totalVal = cases.reduce((s, c) => s + (c.amount ?? 0), 0);
        const riskCases = cases.filter((c) => c.status !== "encerrado").length;
        const score = count === 0 ? 0 : Math.min(100, Math.round((riskCases / Math.max(count, 1)) * 50 + (totalVal / 100000) * 30 + count * 5));
        row[theme] = score;
        row[`${theme}_count`] = count;
        row[`${theme}_value`] = totalVal;
      });
      return row;
    });
  }, [filteredCases]);

  const heatmapThemes = useMemo(() => [...new Set(filteredCases.map((c) => c.theme))], [filteredCases]);

  // Benchmarking: avg values by theme and status
  const benchmarkData = useMemo(() => {
    const themes = [...new Set(filteredCases.map((c) => c.theme))];
    return themes.map((theme) => {
      const cases = filteredCases.filter((c) => c.theme === theme);
      const total = cases.reduce((s, c) => s + (c.amount ?? 0), 0);
      const avg = cases.length > 0 ? total / cases.length : 0;
      const max = Math.max(...cases.map((c) => c.amount ?? 0));
      const min = Math.min(...cases.filter((c) => (c.amount ?? 0) > 0).map((c) => c.amount ?? 0));
      const encerrados = cases.filter((c) => c.status === "encerrado");
      const avgEncerrado = encerrados.length > 0 ? encerrados.reduce((s, c) => s + (c.amount ?? 0), 0) / encerrados.length : 0;
      return { theme, count: cases.length, total: total / 1000, avg: avg / 1000, max: max / 1000, min: min / 1000, avgEncerrado: avgEncerrado / 1000 };
    }).sort((a, b) => b.total - a.total);
  }, [filteredCases]);

  // Provisão financeira
  const provisaoData = useMemo(() => {
    return filteredCases.filter((c) => c.status !== "encerrado").map((c) => {
      const { prob, provisao } = calcProvisao(c.status, c.amount ?? 0);
      return { ...c, prob, provisao };
    });
  }, [filteredCases]);

  const totalProvisao = provisaoData.reduce((s, c) => s + c.provisao, 0);
  const provisaoByStatus = useMemo(() => {
    const acc: Record<string, { provisao: number; count: number }> = {};
    provisaoData.forEach((c) => {
      const label = statusLabels[c.status] || c.status;
      if (!acc[label]) acc[label] = { provisao: 0, count: 0 };
      acc[label].provisao += c.provisao;
      acc[label].count++;
    });
    return Object.entries(acc).map(([name, v]) => ({ name, provisao: v.provisao / 1000, count: v.count }));
  }, [provisaoData]);

  const provisaoByCompany = useMemo(() => {
    return mockCompanies.map((co) => {
      const cases = provisaoData.filter((c) => c.company_id === co.id);
      return { name: co.name.replace("Revalle ", ""), provisao: cases.reduce((s, c) => s + c.provisao, 0) / 1000, count: cases.length };
    }).filter((d) => d.count > 0).sort((a, b) => b.provisao - a.provisao);
  }, [provisaoData]);

  // Widget toggle
  const toggleWidget = (id: string) => {
    setWidgets((prev) => {
      const next = prev.map((w) => w.id === id ? { ...w, visible: !w.visible } : w);
      localStorage.setItem("siag_dashboard_widgets", JSON.stringify(next));
      return next;
    });
  };

  const handleExport = (fmt: string) => {
    toast({ title: `📥 Exportação ${fmt.toUpperCase()}`, description: `Relatório exportado em ${fmt.toUpperCase()}. (Demo)` });
  };
  const handlePrint = () => {
    toast({ title: "🖨️ Impressão", description: "Preparando relatório para impressão... (Demo)" });
  };

  // Render widget content
  const renderWidget = (widgetId: string) => {
    switch (widgetId) {
      case "kpi-risk":
        return (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <KPICard icon={<Shield />} label="Risco Geral" value={riskLevel} sub={`Score: ${riskScore}`} color={riskColor} bg={riskScore >= 60 ? "bg-destructive/10" : riskScore >= 30 ? "bg-warning/10" : "bg-success/10"} trend={riskScore < 30 ? "up" : "down"} />
            <KPICard icon={<DollarSign />} label="Provisão Total" value={`R$ ${(totalProvisao / 1000).toFixed(0)}k`} sub={`${provisaoData.length} processos ativos`} color="text-warning" bg="bg-warning/10" />
            <KPICard icon={<AlertTriangle />} label="Alertas Críticos" value={String(criticalAlerts)} sub="não tratados" color="text-destructive" bg="bg-destructive/10" trend={criticalAlerts === 0 ? "up" : "down"} />
            <KPICard icon={<CheckCircle2 />} label="SLA Provas" value={`${slaPercent}%`} sub={`${slaMet}/${totalRequests.length}`} color="text-success" bg="bg-success/10" trend={slaPercent >= 70 ? "up" : "down"} />
          </div>
        );
      case "heatmap-mini":
        return (
          <ChartCard title="Heatmap de Riscos (Filial × Tema)" icon={<Flame className="h-4 w-4 text-destructive" />}>
            <div className="overflow-x-auto">
              <table className="w-full text-[10px]">
                <thead>
                  <tr>
                    <th className="text-left p-1.5 font-semibold text-muted-foreground">Filial</th>
                    {heatmapThemes.map((t) => <th key={t} className="p-1.5 font-semibold text-muted-foreground text-center">{t}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {heatmapData.map((row: any) => (
                    <tr key={row.branch}>
                      <td className="p-1.5 font-medium">{row.branch}</td>
                      {heatmapThemes.map((t) => {
                        const score = row[t] ?? 0;
                        const count = row[`${t}_count`] ?? 0;
                        return (
                          <td key={t} className="p-1">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className={cn("rounded-md p-1.5 text-center font-bold transition-all cursor-default",
                                    score === 0 ? "bg-muted/30 text-muted-foreground" : getRiskBg(score))}
                                    style={score > 0 ? { color: getRiskColor(score) } : undefined}>
                                    {score === 0 ? "—" : score}
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="text-xs">{row.branch} × {t}</p>
                                  <p className="text-xs">{count} processo(s) · Score: {score}</p>
                                  <p className="text-xs">Valor: R$ {((row[`${t}_value`] ?? 0) / 1000).toFixed(0)}k</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center gap-2 mt-3 text-[9px] text-muted-foreground justify-end">
              <span>Baixo</span>
              <div className="flex gap-0.5">
                {[0, 20, 40, 60, 80].map((v) => (
                  <div key={v} className="w-5 h-3 rounded-sm" style={{ backgroundColor: getRiskColor(v) }} />
                ))}
              </div>
              <span>Alto</span>
            </div>
          </ChartCard>
        );
      case "provisao-total":
        return (
          <ChartCard title="Provisão Financeira por Status" icon={<PiggyBank className="h-4 w-4 text-warning" />}>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={provisaoByStatus}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => `${v}k`} />
                <RechartsTooltip formatter={(v: number) => [`R$ ${v.toFixed(0)}k`, "Provisão"]} contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))", fontSize: 12 }} />
                <Bar dataKey="provisao" radius={[6, 6, 0, 0]} name="Provisão (R$ mil)">
                  {provisaoByStatus.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        );
      case "bench-top5":
        return (
          <ChartCard title="Benchmarking — Valor Médio por Tema (R$ mil)" icon={<Target className="h-4 w-4 text-info" />}>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={benchmarkData.slice(0, 7)} layout="vertical" margin={{ left: 8, right: 16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => `${v}k`} />
                <YAxis type="category" dataKey="theme" width={120} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                <RechartsTooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))", fontSize: 12 }}
                  formatter={(v: number, name: string) => [`R$ ${v.toFixed(0)}k`, name]} />
                <Bar dataKey="avg" fill="hsl(230, 65%, 48%)" name="Média" radius={[0, 4, 4, 0]} />
                <Bar dataKey="max" fill="hsl(0, 72%, 51%)" name="Máximo" radius={[0, 4, 4, 0]} />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        );
      case "timeline-processos":
        return (
          <ChartCard title="Evolução Mensal" icon={<TrendingUp className="h-4 w-4 text-success" />}>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <RechartsTooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} />
                <Area type="monotone" dataKey="novos" stroke="hsl(230, 65%, 48%)" fill="hsl(230, 65%, 48%)" fillOpacity={0.15} name="Novos" />
                <Area type="monotone" dataKey="emAndamento" stroke="hsl(152, 60%, 40%)" fill="hsl(152, 60%, 40%)" fillOpacity={0.15} name="Acumulado" />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        );
      case "radar-saude":
        return (
          <ChartCard title="Saúde Operacional" icon={<Shield className="h-4 w-4 text-primary" />}>
            <ResponsiveContainer width="100%" height={260}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} />
                <Radar name="%" dataKey="value" stroke="hsl(230, 65%, 48%)" fill="hsl(230, 65%, 48%)" fillOpacity={0.2} />
                <RechartsTooltip />
              </RadarChart>
            </ResponsiveContainer>
          </ChartCard>
        );
      case "tarefas-resp":
        return (
          <ChartCard title="Tarefas por Responsável" icon={<Users className="h-4 w-4 text-primary" />}>
            <ResponsiveContainer width="100%" height={260}>
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
        );
      case "sla-mensal":
        return (
          <ChartCard title="SLA Compliance Mensal" icon={<CheckCircle2 className="h-4 w-4 text-success" />}>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} domain={[0, 100]} />
                <RechartsTooltip formatter={(v: number) => `${v}%`} contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} />
                <Area type="monotone" dataKey="sla" stroke="hsl(152, 60%, 40%)" fill="hsl(152, 60%, 40%)" fillOpacity={0.2} name="SLA %" />
                <Line type="monotone" dataKey={() => 80} stroke="hsl(var(--destructive))" strokeDasharray="5 5" name="Meta 80%" dot={false} />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight sm:text-2xl">Dashboard Executivo</h1>
          <p className="text-sm text-muted-foreground font-medium">KPIs operacionais, BI avançado e relatórios</p>
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
                  <CalendarPicker mode="single" selected={customStartDate} onSelect={setCustomStartDate} initialFocus className={cn("p-3 pointer-events-auto")} />
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
                  <CalendarPicker mode="single" selected={customEndDate} onSelect={setCustomEndDate} initialFocus className={cn("p-3 pointer-events-auto")} />
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
                <Button variant="outline" size="sm" className="gap-1.5 text-xs rounded-xl hover:shadow-card transition-all" onClick={() => handleExport("pdf")}><Download className="h-3.5 w-3.5" /> PDF</Button>
              </TooltipTrigger>
              <TooltipContent><p className="text-xs">Exportar relatório em PDF</p></TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1.5 text-xs rounded-xl hover:shadow-card transition-all" onClick={() => handleExport("xlsx")}><Download className="h-3.5 w-3.5" /> Excel</Button>
              </TooltipTrigger>
              <TooltipContent><p className="text-xs">Exportar dados em Excel</p></TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1.5 text-xs rounded-xl hover:shadow-card transition-all" onClick={() => handleExport("csv")}><Share2 className="h-3.5 w-3.5" /> CSV</Button>
              </TooltipTrigger>
              <TooltipContent><p className="text-xs">Exportar dados em CSV</p></TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl hover:shadow-card transition-all" onClick={handlePrint}><Printer className="h-3.5 w-3.5" /></Button>
              </TooltipTrigger>
              <TooltipContent><p className="text-xs">Imprimir relatório</p></TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Executive Summary KPIs */}
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-5">
        <KPICard icon={<CheckCircle2 />} label="SLA Provas 72h" value={`${slaPercent}%`} sub={`${slaMet}/${totalRequests.length} cumpridos`} color="text-success" bg="bg-success/10" trend={slaPercent >= 70 ? "up" : "down"} delay={0} />
        <KPICard icon={<AlertTriangle />} label="Alertas Críticos" value={String(criticalAlerts)} sub="não tratados" color="text-destructive" bg="bg-destructive/10" trend={criticalAlerts === 0 ? "up" : "down"} delay={1} />
        <KPICard icon={<Clock />} label="Tarefas Vencidas" value={String(overdueTasks)} sub="em atraso" color="text-warning" bg="bg-warning/10" trend={overdueTasks === 0 ? "up" : "down"} delay={2} />
        <KPICard icon={<PiggyBank />} label="Provisão Total" value={`R$ ${(totalProvisao / 1000).toFixed(0)}k`} sub={`${provisaoData.length} processos`} color="text-warning" bg="bg-warning/10" delay={3} />
        <KPICard icon={<Shield />} label="Risco Geral" value={riskLevel} sub={`Score: ${riskScore}`} color={riskColor} bg={riskScore >= 60 ? "bg-destructive/10" : riskScore >= 30 ? "bg-warning/10" : "bg-success/10"} trend={riskScore < 30 ? "up" : "down"} delay={4} />
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <div className="mb-5 overflow-x-auto scrollbar-hide">
          <TabsList className="w-max">
            <TabsTrigger value="visao-geral" className="text-xs">Visão Geral</TabsTrigger>
            <TabsTrigger value="heatmap" className="text-xs gap-1"><Flame className="h-3 w-3" />Heatmap</TabsTrigger>
            <TabsTrigger value="benchmarking" className="text-xs gap-1"><Target className="h-3 w-3" />Benchmarking</TabsTrigger>
            <TabsTrigger value="provisao" className="text-xs gap-1"><PiggyBank className="h-3 w-3" />Provisão</TabsTrigger>
            <TabsTrigger value="processos" className="text-xs">Processos</TabsTrigger>
            <TabsTrigger value="operacional" className="text-xs">Operacional</TabsTrigger>
            <TabsTrigger value="sla" className="text-xs">SLA & Provas</TabsTrigger>
            <TabsTrigger value="meu-painel" className="text-xs gap-1"><LayoutGrid className="h-3 w-3" />Meu Painel</TabsTrigger>
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

        {/* HEATMAP */}
        <TabsContent value="heatmap">
          <div className="space-y-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <KPICard icon={<Flame />} label="Maior Risco" value={heatmapData.length > 0 ? heatmapData.reduce((max: any, r: any) => {
                const maxScore = Math.max(...heatmapThemes.map((t) => r[t] ?? 0));
                return maxScore > (max.score ?? 0) ? { branch: r.branch, score: maxScore } : max;
              }, { branch: "N/A", score: 0 }).branch : "N/A"} sub="filial com maior score" color="text-destructive" bg="bg-destructive/10" />
              <KPICard icon={<Building2 />} label="Filiais Analisadas" value={String(heatmapData.length)} sub="com processos ativos" color="text-primary" bg="bg-primary/10" />
              <KPICard icon={<FileText />} label="Temas Mapeados" value={String(heatmapThemes.length)} sub="categorias de risco" color="text-info" bg="bg-info/10" />
              <KPICard icon={<DollarSign />} label="Exposição Total" value={`R$ ${(totalAmount / 1000).toFixed(0)}k`} sub="valor total em risco" color="text-warning" bg="bg-warning/10" />
            </div>

            <ChartCard title="Mapa de Calor — Risco por Filial × Tema" icon={<Flame className="h-4 w-4 text-destructive" />}>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr>
                      <th className="text-left p-2 font-semibold text-muted-foreground border-b">Filial</th>
                      {heatmapThemes.map((t) => <th key={t} className="p-2 font-semibold text-muted-foreground text-center border-b">{t}</th>)}
                      <th className="p-2 font-semibold text-muted-foreground text-center border-b">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {heatmapData.map((row: any) => {
                      const totalScore = heatmapThemes.reduce((s, t) => s + (row[t] ?? 0), 0);
                      return (
                        <tr key={row.branch} className="hover:bg-muted/30 transition-colors">
                          <td className="p-2 font-medium border-b">{row.branch}</td>
                          {heatmapThemes.map((t) => {
                            const score = row[t] ?? 0;
                            const count = row[`${t}_count`] ?? 0;
                            const value = row[`${t}_value`] ?? 0;
                            return (
                              <td key={t} className="p-1.5 border-b">
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div className={cn("rounded-lg p-2 text-center font-bold text-sm transition-all cursor-default min-w-[48px]",
                                        score === 0 ? "bg-muted/30 text-muted-foreground/50" : "")}
                                        style={score > 0 ? { backgroundColor: `${getRiskColor(score)}20`, color: getRiskColor(score) } : undefined}>
                                        {score === 0 ? "—" : score}
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent className="space-y-1">
                                      <p className="font-semibold">{row.branch} × {t}</p>
                                      <p>{count} processo(s)</p>
                                      <p>Valor: R$ {(value / 1000).toFixed(0)}k</p>
                                      <p>Score de risco: {score}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </td>
                            );
                          })}
                          <td className="p-2 text-center font-bold border-b">{totalScore}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center gap-3 mt-4 text-[10px] text-muted-foreground justify-center">
                <span className="font-medium">Legenda:</span>
                {[
                  { label: "Baixo (0-20)", color: getRiskColor(10) },
                  { label: "Moderado (20-40)", color: getRiskColor(30) },
                  { label: "Médio (40-60)", color: getRiskColor(50) },
                  { label: "Alto (60-80)", color: getRiskColor(70) },
                  { label: "Crítico (80+)", color: getRiskColor(90) },
                ].map((l) => (
                  <div key={l.label} className="flex items-center gap-1">
                    <div className="w-4 h-3 rounded-sm" style={{ backgroundColor: l.color }} />
                    <span>{l.label}</span>
                  </div>
                ))}
              </div>
            </ChartCard>
          </div>
        </TabsContent>

        {/* BENCHMARKING */}
        <TabsContent value="benchmarking">
          <div className="space-y-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <KPICard icon={<DollarSign />} label="Valor Médio" value={`R$ ${(avgAmount / 1000).toFixed(0)}k`} sub="por processo" color="text-primary" bg="bg-primary/10" />
              <KPICard icon={<Scale />} label="Maior Valor" value={`R$ ${(Math.max(...filteredCases.map((c) => c.amount ?? 0)) / 1000).toFixed(0)}k`} sub="processo individual" color="text-destructive" bg="bg-destructive/10" />
              <KPICard icon={<Target />} label="Temas Analisados" value={String(benchmarkData.length)} sub="com processos" color="text-info" bg="bg-info/10" />
              <KPICard icon={<BarChart3 />} label="Total Processos" value={String(filteredCases.length)} sub="no período" color="text-success" bg="bg-success/10" />
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <ChartCard title="Comparativo de Valores por Tema (R$ mil)" icon={<Target className="h-4 w-4 text-info" />}>
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={benchmarkData} layout="vertical" margin={{ left: 8, right: 16 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => `${v}k`} />
                    <YAxis type="category" dataKey="theme" width={130} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                    <RechartsTooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))", fontSize: 12 }}
                      formatter={(v: number, name: string) => [`R$ ${v.toFixed(0)}k`, name]} />
                    <Bar dataKey="min" fill="hsl(152, 60%, 40%)" name="Mínimo" radius={[0, 2, 2, 0]} />
                    <Bar dataKey="avg" fill="hsl(230, 65%, 48%)" name="Média" radius={[0, 2, 2, 0]} />
                    <Bar dataKey="max" fill="hsl(0, 72%, 51%)" name="Máximo" radius={[0, 4, 4, 0]} />
                    <Legend wrapperStyle={{ fontSize: "11px" }} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Média vs Encerrados por Tema (R$ mil)" icon={<Scale className="h-4 w-4 text-warning" />}>
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={benchmarkData.filter((d) => d.avgEncerrado > 0)} layout="vertical" margin={{ left: 8, right: 16 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => `${v}k`} />
                    <YAxis type="category" dataKey="theme" width={130} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                    <RechartsTooltip formatter={(v: number, name: string) => [`R$ ${v.toFixed(0)}k`, name]} contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))", fontSize: 12 }} />
                    <Bar dataKey="avg" fill="hsl(230, 65%, 48%)" name="Média Geral" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="avgEncerrado" fill="hsl(38, 92%, 50%)" name="Média Encerrados" radius={[0, 4, 4, 0]} />
                    <Legend wrapperStyle={{ fontSize: "11px" }} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>

            {/* Benchmark table */}
            <ChartCard title="Tabela de Benchmarking Detalhada" icon={<BarChart3 className="h-4 w-4 text-primary" />}>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2 font-semibold">Tema</th>
                      <th className="p-2 text-center font-semibold">Qtd</th>
                      <th className="p-2 text-right font-semibold">Total (R$ mil)</th>
                      <th className="p-2 text-right font-semibold">Média (R$ mil)</th>
                      <th className="p-2 text-right font-semibold">Mín (R$ mil)</th>
                      <th className="p-2 text-right font-semibold">Máx (R$ mil)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {benchmarkData.map((d) => (
                      <tr key={d.theme} className="border-b hover:bg-muted/30 transition-colors">
                        <td className="p-2 font-medium">{d.theme}</td>
                        <td className="p-2 text-center">{d.count}</td>
                        <td className="p-2 text-right">R$ {d.total.toFixed(0)}k</td>
                        <td className="p-2 text-right font-semibold">R$ {d.avg.toFixed(0)}k</td>
                        <td className="p-2 text-right text-success">R$ {d.min.toFixed(0)}k</td>
                        <td className="p-2 text-right text-destructive">R$ {d.max.toFixed(0)}k</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ChartCard>
          </div>
        </TabsContent>

        {/* PROVISÃO */}
        <TabsContent value="provisao">
          <div className="space-y-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <KPICard icon={<PiggyBank />} label="Provisão Total" value={`R$ ${(totalProvisao / 1000).toFixed(0)}k`} sub={`${provisaoData.length} processos`} color="text-warning" bg="bg-warning/10" />
              <KPICard icon={<DollarSign />} label="Exposição Bruta" value={`R$ ${(totalAmount / 1000).toFixed(0)}k`} sub="valor total dos processos" color="text-destructive" bg="bg-destructive/10" />
              <KPICard icon={<Target />} label="% Provisionado" value={totalAmount > 0 ? `${Math.round((totalProvisao / totalAmount) * 100)}%` : "0%"} sub="da exposição total" color="text-info" bg="bg-info/10" />
              <KPICard icon={<Scale />} label="Prob. Média" value={provisaoData.length > 0 ? `${Math.round(provisaoData.reduce((s, c) => s + c.prob, 0) / provisaoData.length * 100)}%` : "0%"} sub="probabilidade de perda" color="text-primary" bg="bg-primary/10" />
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <ChartCard title="Provisão por Status (R$ mil)" icon={<PiggyBank className="h-4 w-4 text-warning" />}>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={provisaoByStatus} dataKey="provisao" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={110} paddingAngle={3}
                      label={({ name, provisao }) => `${name}: R$${provisao.toFixed(0)}k`} labelLine={false}>
                      {provisaoByStatus.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                    </Pie>
                    <RechartsTooltip formatter={(v: number) => [`R$ ${v.toFixed(0)}k`, "Provisão"]} contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))", fontSize: 12 }} />
                    <Legend wrapperStyle={{ fontSize: "11px" }} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Provisão por Empresa (R$ mil)" icon={<Building2 className="h-4 w-4 text-primary" />}>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={provisaoByCompany} margin={{ top: 4, right: 8, left: 0, bottom: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} angle={-30} textAnchor="end" interval={0} />
                    <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => `${v}k`} />
                    <RechartsTooltip formatter={(v: number) => [`R$ ${v.toFixed(0)}k`, "Provisão"]} contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))", fontSize: 12 }} />
                    <Bar dataKey="provisao" radius={[6, 6, 0, 0]} name="Provisão (R$ mil)">
                      {provisaoByCompany.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>

            {/* Provisão detail table */}
            <ChartCard title="Detalhamento da Provisão por Processo" icon={<FileText className="h-4 w-4 text-info" />}>
              <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
                <table className="w-full text-xs">
                  <thead className="sticky top-0 bg-card">
                    <tr className="border-b">
                      <th className="text-left p-2 font-semibold">Processo</th>
                      <th className="text-left p-2 font-semibold">Reclamante</th>
                      <th className="p-2 text-center font-semibold">Status</th>
                      <th className="p-2 text-right font-semibold">Valor (R$)</th>
                      <th className="p-2 text-center font-semibold">Prob. Perda</th>
                      <th className="p-2 text-right font-semibold">Provisão (R$)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {provisaoData.sort((a, b) => b.provisao - a.provisao).map((c) => (
                      <tr key={c.id} className="border-b hover:bg-muted/30 transition-colors">
                        <td className="p-2 font-mono text-[10px]">{c.case_number}</td>
                        <td className="p-2">{c.employee}</td>
                        <td className="p-2 text-center"><Badge variant="outline" className="text-[9px]">{statusLabels[c.status]}</Badge></td>
                        <td className="p-2 text-right">{((c.amount ?? 0) / 1000).toFixed(0)}k</td>
                        <td className="p-2 text-center font-semibold" style={{ color: getRiskColor(c.prob * 100) }}>{Math.round(c.prob * 100)}%</td>
                        <td className="p-2 text-right font-semibold">R$ {(c.provisao / 1000).toFixed(0)}k</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="sticky bottom-0 bg-card border-t-2">
                    <tr>
                      <td colSpan={3} className="p-2 font-bold">TOTAL</td>
                      <td className="p-2 text-right font-bold">R$ {(totalAmount / 1000).toFixed(0)}k</td>
                      <td className="p-2 text-center font-bold">{totalAmount > 0 ? Math.round((totalProvisao / totalAmount) * 100) : 0}%</td>
                      <td className="p-2 text-right font-bold text-warning">R$ {(totalProvisao / 1000).toFixed(0)}k</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </ChartCard>
          </div>
        </TabsContent>

        {/* PROCESSOS - kept from original */}
        <TabsContent value="processos">
          <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <KPICard icon={<Scale />} label="Total de Processos" value={String(filteredCases.length)} sub="no período selecionado" color="text-primary" bg="bg-primary/10" delay={0} />
            <KPICard icon={<DollarSign />} label="Valor Total" value={`R$ ${(totalAmount / 1000).toFixed(0)}k`} sub={`Média: R$ ${(avgAmount / 1000).toFixed(0)}k`} color="text-success" bg="bg-success/10" delay={1} />
            <KPICard icon={<Gavel />} label="Com Audiência" value={String(withHearing)} sub="audiências marcadas" color="text-warning" bg="bg-warning/10" delay={2} />
            <KPICard icon={<Clock />} label="Com Prazo" value={String(withDeadline)} sub="prazos pendentes" color="text-info" bg="bg-info/10" delay={3} />
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <ChartCard title="Processos por Status" icon={<BarChart3 className="h-4 w-4 text-primary" />} delay={0}>
              {statusData.length === 0 ? (
                <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">Nenhum processo no período</div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="45%" innerRadius={60} outerRadius={110} paddingAngle={3} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                      {statusData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                    </Pie>
                    <RechartsTooltip formatter={(value: number, name: string) => [`${value} processo(s)`, name]} contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))", fontSize: 12 }} />
                    <Legend wrapperStyle={{ fontSize: "11px" }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </ChartCard>
            <ChartCard title="Valor da Causa por Empresa (R$ mil)" icon={<DollarSign className="h-4 w-4 text-success" />} delay={1}>
              {amountByCompany.length === 0 ? (
                <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">Sem dados de valor no período</div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={amountByCompany} margin={{ top: 4, right: 8, left: 0, bottom: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} angle={-30} textAnchor="end" interval={0} />
                    <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => `${v}k`} />
                    <RechartsTooltip formatter={(value: number) => [`R$ ${value.toFixed(0)}k`, "Valor total"]} contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))", fontSize: 12 }} />
                    <Bar dataKey="valor" radius={[6, 6, 0, 0]} name="Valor (R$ mil)">
                      {amountByCompany.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </ChartCard>
            <ChartCard title="Linha do Tempo — Processos por Mês (12m)" icon={<TrendingUp className="h-4 w-4 text-success" />} className="lg:col-span-2" delay={2}>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={monthlyData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradNovos" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(230, 65%, 48%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(230, 65%, 48%)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradAcum" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(152, 60%, 40%)" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="hsl(152, 60%, 40%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <RechartsTooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))", fontSize: 12 }} />
                  <Area type="monotone" dataKey="novos" stroke="hsl(230, 65%, 48%)" fill="url(#gradNovos)" strokeWidth={2} name="Novos no mês" dot={{ r: 4, fill: "hsl(230, 65%, 48%)" }} activeDot={{ r: 6 }} />
                  <Area type="monotone" dataKey="emAndamento" stroke="hsl(152, 60%, 40%)" fill="url(#gradAcum)" strokeWidth={2} name="Acumulado ativo" dot={false} />
                  <Legend wrapperStyle={{ fontSize: "11px" }} />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>
            <ChartCard title="Valor da Causa por Tema (R$ mil)" icon={<FileText className="h-4 w-4 text-info" />} delay={3}>
              {amountByTheme.length === 0 ? (
                <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">Sem dados de valor no período</div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={amountByTheme} layout="vertical" margin={{ left: 8, right: 16, top: 4, bottom: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => `${v}k`} />
                    <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                    <RechartsTooltip formatter={(value: number) => [`R$ ${value.toFixed(0)}k`, "Valor total"]} contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))", fontSize: 12 }} />
                    <Bar dataKey="valor" radius={[0, 6, 6, 0]} name="Valor (R$ mil)">
                      {amountByTheme.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </ChartCard>
            <ChartCard title="Volume por Tema" icon={<Building2 className="h-4 w-4 text-warning" />} delay={4}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={themeData} layout="vertical" margin={{ left: 8, right: 16, top: 4, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <RechartsTooltip formatter={(value: number) => [`${value} processo(s)`, "Quantidade"]} contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))", fontSize: 12 }} />
                  <Bar dataKey="value" fill="hsl(38, 92%, 50%)" radius={[0, 6, 6, 0]} name="Processos" />
                </BarChart>
              </ResponsiveContainer>
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

        {/* MEU PAINEL - Customizable Dashboard */}
        <TabsContent value="meu-painel">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Escolha quais widgets exibir no seu painel personalizado</p>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                    <LayoutGrid className="h-3.5 w-3.5" /> Configurar Widgets
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-3" align="end">
                  <p className="text-xs font-semibold mb-2">Widgets disponíveis</p>
                  <div className="space-y-2">
                    {widgets.map((w) => (
                      <div key={w.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs">
                          {w.icon}
                          <span>{w.label}</span>
                        </div>
                        <Switch checked={w.visible} onCheckedChange={() => toggleWidget(w.id)} className="scale-75" />
                      </div>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              {widgets.filter((w) => w.visible).map((w) => (
                <div key={w.id} className={cn(
                  w.id === "kpi-risk" || w.id === "heatmap-mini" ? "lg:col-span-2" : ""
                )}>
                  {renderWidget(w.id)}
                </div>
              ))}
            </div>

            {widgets.filter((w) => w.visible).length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-12">
                Nenhum widget selecionado. Clique em "Configurar Widgets" para adicionar.
              </p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
