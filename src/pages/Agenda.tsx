import { useState, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  ChevronLeft, ChevronRight, CalendarDays, Clock, CheckCircle2,
  Filter, AlertTriangle, ListTodo, Calendar as CalendarIcon,
  CalendarCheck, Gavel, Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { HeaderSkeleton, StatSkeleton, CalendarSkeleton } from "@/components/ui/page-skeleton";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

import {
  MONTHS, WEEKDAYS_FULL, TODAY,
  type ViewType, type EventFilterType, type AssignmentFilter, type CalendarEvent, type AgendaDataSource,
  formatDateStr, getEventsForDate, getWeekDays, isSameDay, downloadICS,
} from "@/components/agenda/agendaHelpers";
import { EventModal } from "@/components/agenda/AgendaEventModal";
import { StatMini, MonthView, WeekView, DayView, YearView } from "@/components/agenda/AgendaViews";
import { CreateAgendaEventDialog } from "@/components/agenda/CreateAgendaEventDialog";

export default function Agenda() {
  const { user } = useAuth();
  const currentUserName = user?.name ?? "Thiago";
  const userRole = user?.role;
  const isAdmin = userRole === "admin" || userRole === "responsavel_juridico_interno";

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState<ViewType>("mes");
  const [typeFilter, setTypeFilter] = useState<EventFilterType>("todos");
  const [assignmentFilter, setAssignmentFilter] = useState<AssignmentFilter>(isAdmin ? "todos" : "minhas");
  const [companyFilter, setCompanyFilter] = useState("todas");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [timeOverrides, setTimeOverrides] = useState<Record<string, string>>({});
  const [createDialog, setCreateDialog] = useState<{ date: Date; hour?: number } | null>(null);

  // ── Supabase Queries ──
  const { data: hearings = [], isLoading: loadingH } = useQuery({
    queryKey: ["agenda-hearings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hearings")
        .select("id, case_id, date, time, type, court, status, cases(case_number, employee_name, company_id, status, responsible)")
        .neq("status", "cancelada");
      if (error) throw error;
      return (data ?? []) as any[];
    },
  });

  const { data: deadlines = [], isLoading: loadingD } = useQuery({
    queryKey: ["agenda-deadlines"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("deadlines")
        .select("id, case_id, title, due_at, status, cases(case_number, employee_name, company_id, responsible)")
        .neq("status", "cumprido");
      if (error) throw error;
      return (data ?? []) as any[];
    },
  });

  const { data: tasks = [], isLoading: loadingT } = useQuery({
    queryKey: ["agenda-tasks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tasks")
        .select("id, title, due_at, status, case_id, assignees, show_in_calendar, cases(case_number, employee_name, company_id, responsible)")
        .neq("status", "concluida")
        .eq("show_in_calendar", true);
      if (error) throw error;
      return (data ?? []) as any[];
    },
  });

  const { data: companies = [] } = useQuery({
    queryKey: ["agenda-companies"],
    queryFn: async () => {
      const { data, error } = await supabase.from("companies").select("id, name").order("name");
      if (error) throw error;
      return data ?? [];
    },
  });

  const isLoading = loadingH || loadingD || loadingT;

  const agendaData: AgendaDataSource = useMemo(() => ({
    hearings,
    deadlines,
    tasks,
  }), [hearings, deadlines, tasks]);

  const handleSaveTime = useCallback((eventKey: string, newTime: string) => {
    setTimeOverrides((prev) => ({ ...prev, [eventKey]: newTime }));
    setSelectedEvent((prev) => prev ? { ...prev, time: newTime, hour: parseInt(newTime.split(":")[0]) } : null);
  }, []);

  const prev = () => {
    const d = new Date(selectedDate);
    if (view === "ano") d.setFullYear(d.getFullYear()-1);
    else if (view === "mes") d.setMonth(d.getMonth()-1);
    else if (view === "semana") d.setDate(d.getDate()-7);
    else d.setDate(d.getDate()-1);
    setSelectedDate(d);
  };
  const next = () => {
    const d = new Date(selectedDate);
    if (view === "ano") d.setFullYear(d.getFullYear()+1);
    else if (view === "mes") d.setMonth(d.getMonth()+1);
    else if (view === "semana") d.setDate(d.getDate()+7);
    else d.setDate(d.getDate()+1);
    setSelectedDate(d);
  };
  const goToToday = () => setSelectedDate(new Date(TODAY));
  const handleDayClick = (date: Date) => { setSelectedDate(date); if (view === "mes") setView("dia"); };
  const handleMonthClick = (date: Date) => { setSelectedDate(date); setView("mes"); };
  const handleAddClick = (date: Date, hour?: number) => setCreateDialog({ date, hour });

  const handleExportCSV = () => {
    const dates: Date[] = [];
    if (view === "mes") {
      const year = selectedDate.getFullYear();
      const month = selectedDate.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      for (let i = 1; i <= daysInMonth; i++) dates.push(new Date(year, month, i));
    } else if (view === "semana") {
      dates.push(...getWeekDays(selectedDate));
    } else {
      dates.push(selectedDate);
    }
    const allEvents: (CalendarEvent & { dateLabel: string })[] = [];
    dates.forEach((d) => {
      const evs = getEventsForDate(d, typeFilter, assignmentFilter, companyFilter, currentUserName, userRole, agendaData);
      evs.forEach((e) => allEvents.push({ ...e, dateLabel: d.toLocaleDateString("pt-BR") }));
    });
    if (allEvents.length === 0) { toast({ title: "Nenhum evento para exportar." }); return; }
    const BOM = "\uFEFF";
    const headers = ["Tipo", "Título", "Data", "Hora", "Processo", "Colaborador", "Detalhe"];
    const typeLabel: Record<string, string> = { audiencia: "Audiência", prazo: "Prazo", tarefa: "Tarefa" };
    const rows = allEvents.map((e) => [
      typeLabel[e.type] ?? e.type, `"${(e.title ?? "").replace(/"/g, '""')}"`, e.dateLabel,
      e.time ?? "", e.caseNumber ?? "", e.employee ?? "", `"${(e.detail ?? "").replace(/"/g, '""')}"`,
    ]);
    const csv = BOM + [headers, ...rows].map((r) => r.join(";")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url;
    a.download = `agenda_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click(); URL.revokeObjectURL(url);
    toast({ title: `📥 CSV exportado com ${allEvents.length} evento(s)` });
  };

  const headerText = useMemo(() => {
    if (view === "ano") return `${selectedDate.getFullYear()}`;
    if (view === "mes") return `${MONTHS[selectedDate.getMonth()]} ${selectedDate.getFullYear()}`;
    if (view === "semana") {
      const week = getWeekDays(selectedDate);
      const f = week[0]; const l = week[6];
      const fm = MONTHS[f.getMonth()].slice(0,3); const lm = MONTHS[l.getMonth()].slice(0,3);
      if (f.getMonth()===l.getMonth()) return `${f.getDate()}–${l.getDate()} ${fm} ${f.getFullYear()}`;
      return `${f.getDate()} ${fm} – ${l.getDate()} ${lm} ${l.getFullYear()}`;
    }
    return `${WEEKDAYS_FULL[selectedDate.getDay()]}, ${selectedDate.getDate()} de ${MONTHS[selectedDate.getMonth()]}`;
  }, [view, selectedDate]);

  const periodStats = useMemo(() => {
    const dates: Date[] = [];
    if (view === "ano") {
      const year = selectedDate.getFullYear();
      for (let m = 0; m < 12; m++) {
        const daysInMonth = new Date(year, m + 1, 0).getDate();
        for (let d = 1; d <= daysInMonth; d++) dates.push(new Date(year, m, d));
      }
    } else if (view === "mes") {
      const year = selectedDate.getFullYear();
      const month = selectedDate.getMonth();
      const daysInMonth = new Date(year, month+1, 0).getDate();
      for (let i = 1; i <= daysInMonth; i++) dates.push(new Date(year, month, i));
    } else if (view === "semana") {
      dates.push(...getWeekDays(selectedDate));
    } else {
      dates.push(selectedDate);
    }
    let audiencias = 0, prazos = 0, tarefas = 0;
    dates.forEach((d) => {
      const events = getEventsForDate(d, "todos", assignmentFilter, companyFilter, currentUserName, userRole, agendaData);
      events.forEach((e) => {
        if (e.type === "audiencia") audiencias++;
        else if (e.type === "prazo") prazos++;
        else tarefas++;
      });
    });
    return { audiencias, prazos, tarefas, total: audiencias + prazos + tarefas };
  }, [selectedDate, view, assignmentFilter, companyFilter, agendaData, currentUserName, userRole]);

  const activeFilters = (typeFilter !== "todos" ? 1 : 0) + (assignmentFilter !== "todos" ? 1 : 0) + (companyFilter !== "todas" ? 1 : 0);
  const isToday = isSameDay(selectedDate, TODAY);

  // Próximos eventos from Supabase
  const upcomingHearings = useMemo(() => {
    const todayStr = formatDateStr(new Date());
    return hearings
      .filter((h: any) => h.date >= todayStr && h.cases?.status !== "encerrado")
      .sort((a: any, b: any) => a.date.localeCompare(b.date))
      .slice(0, 5);
  }, [hearings]);

  const upcomingDeadlines = useMemo(() => {
    const todayStr = formatDateStr(new Date());
    return deadlines
      .filter((d: any) => d.due_at.slice(0, 10) >= todayStr)
      .sort((a: any, b: any) => a.due_at.localeCompare(b.due_at))
      .slice(0, 5);
  }, [deadlines]);

  const viewProps = {
    typeFilter, assignmentFilter, companyFilter,
    currentUser: currentUserName, userRole, data: agendaData,
  };

  if (isLoading) {
    return (
      <div className="p-4 md:p-6 lg:p-8 space-y-5 animate-in fade-in duration-500">
        <HeaderSkeleton />
        <StatSkeleton count={4} />
        <CalendarSkeleton />
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="p-4 md:p-6 lg:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Header */}
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-extrabold tracking-tight sm:text-2xl">Agenda</h1>
            <p className="text-sm text-muted-foreground font-medium">Audiências, prazos e tarefas</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              className="gap-1.5 rounded-xl shadow-glow-primary text-xs"
              style={{ background: "var(--gradient-primary)" }}
              onClick={() => handleAddClick(selectedDate)}
            >
              <Plus className="h-3.5 w-3.5" /> Novo Evento
            </Button>
            <Button variant={showFilters ? "secondary" : "outline"} size="sm" className="gap-1.5 text-xs rounded-lg" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="h-3.5 w-3.5" />
              Filtros
              {activeFilters > 0 && (
                <Badge className="ml-0.5 h-4 min-w-4 rounded-full px-1 text-[9px] border-0" style={{ background: "var(--gradient-primary)" }}>
                  {activeFilters}
                </Badge>
              )}
            </Button>
            <Tabs value={view} onValueChange={(v) => setView(v as ViewType)}>
              <TabsList className="h-9">
                <TabsTrigger value="dia" className="text-xs px-3">Dia</TabsTrigger>
                <TabsTrigger value="semana" className="text-xs px-3">Semana</TabsTrigger>
                <TabsTrigger value="mes" className="text-xs px-3">Mês</TabsTrigger>
                <TabsTrigger value="ano" className="text-xs px-3">Ano</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Stat counters */}
        <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
          <StatMini icon={<CalendarIcon className="h-4 w-4 text-foreground" />} label="Total no período" value={periodStats.total} color="bg-card" />
          <StatMini icon={<Gavel className="h-4 w-4 text-primary" />} label="Audiências" value={periodStats.audiencias} color="bg-primary/5" />
          <StatMini icon={<AlertTriangle className="h-4 w-4 text-warning" />} label="Prazos" value={periodStats.prazos} color="bg-warning/5" />
          <StatMini icon={<ListTodo className="h-4 w-4 text-success" />} label="Tarefas" value={periodStats.tarefas} color="bg-success/5" />
        </div>

        {/* Filters bar */}
        {showFilters && (
          <div className="mb-4 flex flex-wrap gap-3 rounded-xl border bg-card/50 p-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as EventFilterType)}>
              <SelectTrigger className="w-[150px] h-9 text-xs rounded-lg">
                <CalendarDays className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="todos">Todos os tipos</SelectItem>
                <SelectItem value="audiencia">Audiências</SelectItem>
                <SelectItem value="prazo">Prazos</SelectItem>
                <SelectItem value="tarefa">Tarefas</SelectItem>
              </SelectContent>
            </Select>
            <Select value={assignmentFilter} onValueChange={(v) => setAssignmentFilter(v as AssignmentFilter)}>
              <SelectTrigger className="w-[170px] h-9 text-xs rounded-lg">
                <CheckCircle2 className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="todos">Todas atribuições</SelectItem>
                <SelectItem value="minhas">Minhas atribuições</SelectItem>
              </SelectContent>
            </Select>
            <Select value={companyFilter} onValueChange={setCompanyFilter}>
              <SelectTrigger className="w-[180px] h-9 text-xs rounded-lg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="todas">Todas as empresas</SelectItem>
                {companies.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {activeFilters > 0 && (
              <Button variant="ghost" size="sm" className="h-9 text-xs text-muted-foreground"
                onClick={() => { setTypeFilter("todos"); setAssignmentFilter("todos"); setCompanyFilter("todas"); }}>
                Limpar filtros
              </Button>
            )}
          </div>
        )}

        {/* Nav with Today button */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={prev}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {!isToday && (
              <Button variant="outline" size="sm" className="h-7 text-[11px] rounded-lg gap-1 px-2.5" onClick={goToToday}>
                <CalendarCheck className="h-3 w-3" /> Hoje
              </Button>
            )}
          </div>
          <h2 className="text-sm font-bold sm:text-lg">{headerText}</h2>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={next}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Calendar */}
        <div className="flex gap-4">
          <div className="flex-1 min-w-0">
            {view === "ano" && <YearView selectedDate={selectedDate} onMonthClick={handleMonthClick} {...viewProps} />}
            {view === "mes" && <MonthView selectedDate={selectedDate} onDayClick={handleDayClick} onAddClick={handleAddClick} {...viewProps} />}
            {view === "semana" && <WeekView selectedDate={selectedDate} onEventClick={setSelectedEvent} onAddClick={handleAddClick} {...viewProps} />}
            {view === "dia" && <DayView selectedDate={selectedDate} onEventClick={setSelectedEvent} onAddClick={handleAddClick} {...viewProps} />}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-primary" /> Audiência</span>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-warning" /> Prazo</span>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-success" /> Tarefa</span>
        </div>

        {/* Próximos Eventos */}
        <div className="mt-6">
          <h3 className="mb-3 text-sm font-bold">Próximos Eventos</h3>
          <div className="space-y-2">
            {upcomingHearings.map((h: any) => (
              <Link key={h.id} to={`/processos/${h.case_id}`}
                className="group flex items-center gap-3 rounded-xl border bg-card p-3.5 shadow-soft transition-all hover:shadow-card hover:-translate-y-0.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                  <Gavel className="h-4 w-4 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{h.type} – {h.cases?.employee_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(h.date + "T00:00:00").toLocaleDateString("pt-BR")}
                    {h.time && ` às ${h.time}`} · {h.court}
                  </p>
                </div>
                <Badge variant="outline" className="text-[10px] bg-primary/5 text-primary border-primary/20">Audiência</Badge>
              </Link>
            ))}
            {upcomingDeadlines.map((d: any) => (
              <Link key={d.id} to={`/processos/${d.case_id}`}
                className="group flex items-center gap-3 rounded-xl border bg-card p-3.5 shadow-soft transition-all hover:shadow-card hover:-translate-y-0.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-warning/10 shrink-0">
                  <Clock className="h-4 w-4 text-warning" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{d.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(d.due_at).toLocaleDateString("pt-BR")} · {d.cases?.employee_name}
                  </p>
                </div>
                <Badge variant="outline" className="text-[10px] bg-warning/5 text-warning border-warning/20">Prazo</Badge>
              </Link>
            ))}
            {upcomingHearings.length === 0 && upcomingDeadlines.length === 0 && (
              <p className="text-sm text-muted-foreground/60 text-center py-4">Nenhum evento próximo</p>
            )}
          </div>
        </div>

        {/* Event Modal */}
        {selectedEvent && <EventModal event={selectedEvent} onClose={() => setSelectedEvent(null)} onSaveTime={handleSaveTime} />}

        {/* Create Event Dialog */}
        {createDialog && (
          <CreateAgendaEventDialog
            initialDate={createDialog.date}
            initialHour={createDialog.hour}
            onClose={() => setCreateDialog(null)}
          />
        )}
      </div>
    </TooltipProvider>
  );
}
