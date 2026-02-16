import { useState } from "react";
import {
  BarChart3, TrendingUp, Clock, AlertTriangle, CheckCircle2, FileText,
  Building2, Filter,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line, Area, AreaChart,
} from "recharts";
import {
  mockCases, mockTasks, mockDeadlines, mockEvidenceRequests,
  mockAlerts, mockCompanies, statusLabels, type CaseStatus,
} from "@/data/mock";
import { cn } from "@/lib/utils";

const CHART_COLORS = [
  "hsl(230, 65%, 48%)", // primary
  "hsl(38, 92%, 50%)",  // warning
  "hsl(152, 60%, 40%)", // success
  "hsl(0, 72%, 51%)",   // destructive
  "hsl(210, 80%, 52%)", // info
  "hsl(270, 50%, 55%)", // purple
];

export default function Relatorios() {
  const [companyFilter, setCompanyFilter] = useState("todas");

  const filteredCases = companyFilter === "todas"
    ? mockCases
    : mockCases.filter((c) => c.company_id === companyFilter);

  const caseIds = new Set(filteredCases.map((c) => c.id));

  // KPIs
  const totalRequests = mockEvidenceRequests.filter((r) => caseIds.has(r.case_id));
  const slaMet = totalRequests.filter((r) => r.status === "atendida").length;
  const slaPercent = totalRequests.length > 0 ? Math.round((slaMet / totalRequests.length) * 100) : 0;

  const criticalAlerts = mockAlerts.filter((a) => a.severity === "urgente" && !a.treated).length;
  const overdueTasks = mockTasks.filter((t) => t.status !== "concluida" && caseIds.has(t.case_id || "") && new Date(t.due_at) < new Date()).length;
  const avgResponseDays = 4.2; // mock

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

  const monthlyData = [
    { month: "Set", novos: 1, encerrados: 0 },
    { month: "Out", novos: 0, encerrados: 0 },
    { month: "Nov", novos: 1, encerrados: 0 },
    { month: "Dez", novos: 0, encerrados: 0 },
    { month: "Jan", novos: 1, encerrados: 0 },
    { month: "Fev", novos: 2, encerrados: 1 },
  ];

  return (
    <div className="p-4 md:p-6 lg:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Relatórios</h1>
          <p className="text-sm text-muted-foreground">KPIs e dashboards visuais</p>
        </div>
        <Select value={companyFilter} onValueChange={setCompanyFilter}>
          <SelectTrigger className="w-[200px] h-9 text-xs">
            <Filter className="mr-1.5 h-3.5 w-3.5" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas as empresas</SelectItem>
            {mockCompanies.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* KPI Cards */}
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KPICard icon={<CheckCircle2 />} label="SLA Provas 72h" value={`${slaPercent}%`} sub={`${slaMet}/${totalRequests.length} cumpridos`} color="text-success" bg="bg-success/10" />
        <KPICard icon={<AlertTriangle />} label="Alertas Críticos" value={String(criticalAlerts)} sub="não tratados" color="text-destructive" bg="bg-destructive/10" />
        <KPICard icon={<Clock />} label="Tarefas Vencidas" value={String(overdueTasks)} sub="em atraso" color="text-warning" bg="bg-warning/10" />
        <KPICard icon={<TrendingUp />} label="Tempo Médio Resposta" value={`${avgResponseDays}d`} sub="citação → documentação" color="text-info" bg="bg-info/10" />
      </div>

      {/* Charts grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Status Distribution */}
        <ChartCard title="Processos por Status" icon={<BarChart3 className="h-4 w-4 text-primary" />}>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                {statusData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Pie>
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: "11px" }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* By Theme */}
        <ChartCard title="Volume por Tema" icon={<FileText className="h-4 w-4 text-info" />}>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={themeData} layout="vertical" margin={{ left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 16%, 90%)" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="value" fill="hsl(230, 65%, 48%)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* By Company */}
        <ChartCard title="Por Empresa / Filial" icon={<Building2 className="h-4 w-4 text-warning" />}>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={companyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 16%, 90%)" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="processos" fill="hsl(230, 65%, 48%)" name="Processos" radius={[4, 4, 0, 0]} />
              <Bar dataKey="tarefas" fill="hsl(38, 92%, 50%)" name="Tarefas" radius={[4, 4, 0, 0]} />
              <Legend wrapperStyle={{ fontSize: "11px" }} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Monthly trend */}
        <ChartCard title="Evolução Mensal" icon={<TrendingUp className="h-4 w-4 text-success" />}>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 16%, 90%)" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Area type="monotone" dataKey="novos" stroke="hsl(230, 65%, 48%)" fill="hsl(230, 65%, 48%)" fillOpacity={0.15} name="Novos" />
              <Area type="monotone" dataKey="encerrados" stroke="hsl(152, 60%, 40%)" fill="hsl(152, 60%, 40%)" fillOpacity={0.15} name="Encerrados" />
              <Legend wrapperStyle={{ fontSize: "11px" }} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}

function KPICard({ icon, label, value, sub, color, bg }: { icon: React.ReactNode; label: string; value: string; sub: string; color: string; bg: string }) {
  return (
    <div className="rounded-xl border bg-card p-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className={cn("mb-2 flex h-9 w-9 items-center justify-center rounded-lg [&>svg]:h-5 [&>svg]:w-5", bg, color)}>{icon}</div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-[11px] font-medium text-muted-foreground">{label}</p>
      <p className="text-[10px] text-muted-foreground/70">{sub}</p>
    </div>
  );
}

function ChartCard({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border bg-card p-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-3 flex items-center gap-2">
        {icon}
        <h3 className="text-sm font-semibold">{title}</h3>
      </div>
      {children}
    </div>
  );
}
