import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  ChevronLeft, ChevronRight, CalendarDays, Clock, CheckCircle2,
  Filter, Download, X, ExternalLink, CalendarCheck, Gavel, AlertTriangle,
  ListTodo, Calendar as CalendarIcon, PanelRightOpen, PanelRightClose,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  mockHearings, mockDeadlines, mockTasks, mockCases, mockCompanies,
} from "@/data/mock";
import { cn } from "@/lib/utils";

// ── Constants ──
const MONTHS = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
const WEEKDAYS = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];
const WEEKDAYS_FULL = ["Domingo","Segunda-feira","Terça-feira","Quarta-feira","Quinta-feira","Sexta-feira","Sábado"];
const HOURS = Array.from({ length: 17 }, (_, i) => i + 6);
const TODAY = new Date(2026, 1, 16);

type ViewType = "mes" | "semana" | "dia";
type EventFilterType = "todos" | "audiencia" | "prazo" | "tarefa";
type AssignmentFilter = "todos" | "minhas";
const CURRENT_USER = "Thiago";

interface CalendarEvent {
  type: "audiencia" | "prazo" | "tarefa";
  title: string;
  time?: string;
  hour?: number;
  date?: string;
  employee?: string;
  caseId?: string;
  caseNumber?: string;
  companyId?: string;
  detail?: string;
  assignees?: string[];
}

// ── Helpers ──
function formatDateStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

function getEventsForDate(date: Date, typeFilter: EventFilterType, assignmentFilter: AssignmentFilter, companyFilter: string): CalendarEvent[] {
  const dateStr = formatDateStr(date);
  const items: CalendarEvent[] = [];

  if (typeFilter === "todos" || typeFilter === "audiencia") {
    mockHearings.forEach((h) => {
      if (h.date !== dateStr) return;
      const caso = mockCases.find((c) => c.id === h.case_id);
      if (companyFilter !== "todas" && caso?.company_id !== companyFilter) return;
      if (assignmentFilter === "minhas" && caso?.responsible !== CURRENT_USER) return;
      items.push({
        type: "audiencia", title: h.type, time: h.time, date: h.date,
        hour: parseInt(h.time.split(":")[0]), employee: h.employee,
        caseId: h.case_id, caseNumber: h.case_number,
        companyId: caso?.company_id, detail: h.court,
      });
    });
  }

  if (typeFilter === "todos" || typeFilter === "prazo") {
    mockDeadlines.forEach((d) => {
      if (d.due_at !== dateStr) return;
      const caso = mockCases.find((c) => c.id === d.case_id);
      if (companyFilter !== "todas" && caso?.company_id !== companyFilter) return;
      if (assignmentFilter === "minhas" && caso?.responsible !== CURRENT_USER) return;
      items.push({
        type: "prazo", title: d.title, date: d.due_at, employee: d.employee,
        caseId: d.case_id, caseNumber: d.case_number, companyId: caso?.company_id,
      });
    });
  }

  if (typeFilter === "todos" || typeFilter === "tarefa") {
    mockTasks.filter((t) => t.show_in_calendar).forEach((t) => {
      if (!t.due_at.startsWith(dateStr)) return;
      const caso = t.case_id ? mockCases.find((c) => c.id === t.case_id) : undefined;
      if (companyFilter !== "todas" && caso && caso.company_id !== companyFilter) return;
      if (assignmentFilter === "minhas" && !t.assignees.includes(CURRENT_USER)) return;
      const time = t.due_at.split("T")[1]?.slice(0,5);
      items.push({
        type: "tarefa", title: t.title, time, date: dateStr,
        hour: time ? parseInt(time.split(":")[0]) : undefined,
        employee: t.employee, caseId: t.case_id, caseNumber: t.case_number,
        companyId: caso?.company_id, assignees: t.assignees,
      });
    });
  }

  return items;
}

function getWeekDays(date: Date): Date[] {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay());
  return Array.from({ length: 7 }, (_, i) => { const dd = new Date(d); dd.setDate(d.getDate()+i); return dd; });
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate();
}

function eventColor(type: string) {
  if (type === "audiencia") return "bg-primary/15 text-primary border-l-2 border-primary";
  if (type === "prazo") return "bg-warning/15 text-warning border-l-2 border-warning";
  return "bg-success/15 text-success border-l-2 border-success";
}
function allDayColor(type: string) {
  if (type === "prazo") return "bg-warning/20 text-warning";
  return "bg-muted text-muted-foreground";
}

function eventTypeLabel(type: string) {
  return type === "audiencia" ? "Audiência" : type === "prazo" ? "Prazo" : "Tarefa";
}

function eventTypeIcon(type: string) {
  if (type === "audiencia") return <Gavel className="h-3.5 w-3.5" />;
  if (type === "prazo") return <Clock className="h-3.5 w-3.5" />;
  return <ListTodo className="h-3.5 w-3.5" />;
}

// ── ICS Export ──
function generateICS(events: CalendarEvent[], dateStr: string): string {
  const lines = ["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//SIAG//PT","CALSCALE:GREGORIAN"];
  events.forEach((e, i) => {
    const d = dateStr.replace(/-/g,"");
    const t = e.time ? e.time.replace(":","")+"00" : "000000";
    lines.push("BEGIN:VEVENT",`DTSTART:${d}T${t}`,`SUMMARY:${e.title}`,
      `DESCRIPTION:${e.employee || ""}`,`UID:siag-${i}-${d}@siag`,`END:VEVENT`);
  });
  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

function downloadICS(events: CalendarEvent[], dateStr: string) {
  const blob = new Blob([generateICS(events, dateStr)], { type: "text/calendar" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `agenda-siag-${dateStr}.ics`;
  a.click(); URL.revokeObjectURL(url);
}

// ── Stat Mini Card ──
function StatMini({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
  return (
    <div className={cn("flex items-center gap-2 rounded-lg border px-3 py-2 shadow-soft", color)}>
      <div className="flex h-7 w-7 items-center justify-center rounded-md bg-background/60">{icon}</div>
      <div>
        <p className="text-lg font-extrabold leading-none">{value}</p>
        <p className="text-[10px] font-medium opacity-70">{label}</p>
      </div>
    </div>
  );
}

// ── Event Detail Modal ──
function EventModal({ event, onClose }: { event: CalendarEvent; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-sm rounded-2xl border bg-card p-5 shadow-elevated animate-in fade-in slide-in-from-bottom-4 duration-200" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-3">
          <Badge className={cn(
            "text-[10px] gap-1 border-0",
            event.type === "audiencia" ? "bg-primary/15 text-primary" :
            event.type === "prazo" ? "bg-warning/15 text-warning" :
            "bg-success/15 text-success"
          )}>
            {eventTypeIcon(event.type)}
            {eventTypeLabel(event.type)}
          </Badge>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
        <h3 className="text-sm font-bold mb-3">{event.title}</h3>
        <div className="space-y-1.5">
          {event.time && <p className="text-xs text-muted-foreground flex items-center gap-1.5"><Clock className="h-3 w-3" /> {event.time}</p>}
          {event.employee && <p className="text-xs text-muted-foreground flex items-center gap-1.5"><CalendarDays className="h-3 w-3" /> {event.employee}</p>}
          {event.detail && <p className="text-xs text-muted-foreground flex items-center gap-1.5"><Gavel className="h-3 w-3" /> {event.detail}</p>}
          {event.caseNumber && <p className="text-xs text-muted-foreground font-mono">{event.caseNumber}</p>}
          {event.assignees && <p className="text-xs text-muted-foreground">👥 {event.assignees.join(", ")}</p>}
        </div>
        {event.caseId && (
          <Button asChild size="sm" className="w-full mt-4 gap-2 rounded-xl" style={{ background: "var(--gradient-primary)" }}>
            <Link to={`/processos/${event.caseId}`}>
              <ExternalLink className="h-3.5 w-3.5" /> Ver Processo
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}

// ── Side Panel ──
function SidePanel({ date, events, onEventClick }: { date: Date; events: CalendarEvent[]; onEventClick: (e: CalendarEvent) => void }) {
  const dayLabel = `${date.getDate()} de ${MONTHS[date.getMonth()]}`;
  const weekday = WEEKDAYS_FULL[date.getDay()];
  const isCurrentDay = isSameDay(date, TODAY);

  const audiencias = events.filter((e) => e.type === "audiencia");
  const prazos = events.filter((e) => e.type === "prazo");
  const tarefas = events.filter((e) => e.type === "tarefa");

  return (
    <div className="w-full lg:w-[320px] shrink-0 rounded-xl border bg-card shadow-soft overflow-hidden">
      {/* Header */}
      <div className={cn("p-4 border-b", isCurrentDay ? "bg-primary/5" : "bg-muted/30")}>
        <div className="flex items-center gap-2">
          {isCurrentDay && <Badge className="text-[9px] bg-primary text-primary-foreground border-0">Hoje</Badge>}
          <div>
            <p className="text-xs text-muted-foreground font-medium">{weekday}</p>
            <p className="text-lg font-bold">{dayLabel}</p>
          </div>
        </div>
        {events.length === 0 && (
          <p className="text-xs text-muted-foreground/60 mt-2">Nenhum evento neste dia</p>
        )}
      </div>

      {/* Events list */}
      <div className="max-h-[500px] overflow-y-auto scrollbar-thin p-2 space-y-1.5">
        {/* Audiências */}
        {audiencias.length > 0 && (
          <div className="mb-2">
            <p className="text-[10px] font-bold uppercase text-muted-foreground px-2 mb-1 flex items-center gap-1">
              <Gavel className="h-3 w-3 text-primary" /> Audiências ({audiencias.length})
            </p>
            {audiencias.map((e, i) => (
              <button key={i} onClick={() => onEventClick(e)}
                className="w-full text-left rounded-lg p-2.5 transition-colors hover:bg-primary/5 border-l-2 border-primary mb-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">{e.title}</span>
                  {e.time && <Badge variant="outline" className="text-[9px] font-mono">{e.time}</Badge>}
                </div>
                {e.employee && <p className="text-[10px] text-muted-foreground mt-0.5">{e.employee}</p>}
                {e.detail && <p className="text-[10px] text-muted-foreground truncate">{e.detail}</p>}
              </button>
            ))}
          </div>
        )}

        {/* Prazos */}
        {prazos.length > 0 && (
          <div className="mb-2">
            <p className="text-[10px] font-bold uppercase text-muted-foreground px-2 mb-1 flex items-center gap-1">
              <Clock className="h-3 w-3 text-warning" /> Prazos ({prazos.length})
            </p>
            {prazos.map((e, i) => (
              <button key={i} onClick={() => onEventClick(e)}
                className="w-full text-left rounded-lg p-2.5 transition-colors hover:bg-warning/5 border-l-2 border-warning mb-1">
                <span className="text-xs font-bold text-foreground">{e.title}</span>
                {e.employee && <p className="text-[10px] text-muted-foreground mt-0.5">{e.employee}</p>}
              </button>
            ))}
          </div>
        )}

        {/* Tarefas */}
        {tarefas.length > 0 && (
          <div>
            <p className="text-[10px] font-bold uppercase text-muted-foreground px-2 mb-1 flex items-center gap-1">
              <ListTodo className="h-3 w-3 text-success" /> Tarefas ({tarefas.length})
            </p>
            {tarefas.map((e, i) => (
              <button key={i} onClick={() => onEventClick(e)}
                className="w-full text-left rounded-lg p-2.5 transition-colors hover:bg-success/5 border-l-2 border-success mb-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground truncate">{e.title}</span>
                  {e.time && <Badge variant="outline" className="text-[9px] font-mono">{e.time}</Badge>}
                </div>
                {e.assignees && <p className="text-[10px] text-muted-foreground mt-0.5">{e.assignees.join(", ")}</p>}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Month View ──
function MonthView({ selectedDate, onDayClick, typeFilter, assignmentFilter, companyFilter }: {
  selectedDate: Date; onDayClick: (d: Date) => void;
  typeFilter: EventFilterType; assignmentFilter: AssignmentFilter; companyFilter: string;
}) {
  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth();
  const daysInMonth = new Date(year, month+1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  return (
    <div className="grid grid-cols-7 gap-px overflow-hidden rounded-xl border bg-border shadow-soft">
      {WEEKDAYS.map((d) => (
        <div key={d} className="bg-muted/50 p-2 text-center text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{d}</div>
      ))}
      {Array.from({ length: firstDay }).map((_, i) => (
        <div key={`e-${i}`} className="min-h-[80px] bg-card/50 p-1 md:min-h-[100px]" />
      ))}
      {Array.from({ length: daysInMonth }).map((_, i) => {
        const day = i + 1;
        const date = new Date(year, month, day);
        const events = getEventsForDate(date, typeFilter, assignmentFilter, companyFilter);
        const isToday = isSameDay(date, TODAY);
        const isSelected = isSameDay(date, selectedDate);
        return (
          <div key={day} onClick={() => onDayClick(date)}
            className={cn(
              "min-h-[80px] cursor-pointer bg-card p-1.5 transition-all hover:bg-accent/20 md:min-h-[100px]",
              isToday && "ring-2 ring-inset ring-primary/60",
              isSelected && !isToday && "bg-accent/10",
            )}>
            <span className={cn(
              "inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold transition-colors",
              isToday && "bg-primary text-primary-foreground",
              isSelected && !isToday && "bg-accent text-accent-foreground",
            )}>{day}</span>
            <div className="mt-1 space-y-0.5">
              {events.slice(0,2).map((e, idx) => (
                <div key={idx} className={cn(
                  "truncate rounded px-1 py-0.5 text-[10px] font-medium",
                  e.type==="audiencia" ? "bg-primary/10 text-primary" :
                  e.type==="prazo" ? "bg-warning/15 text-warning" : "bg-success/10 text-success"
                )}>{e.time ? `${e.time} ` : ""}{e.title.slice(0,20)}</div>
              ))}
              {events.length > 2 && (
                <span className="block text-[9px] text-muted-foreground font-medium px-1">+{events.length-2} mais</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Time Grid ──
function TimeGrid({ columns, renderAllDay, renderEvent }: {
  columns: Date[];
  renderAllDay: (date: Date) => React.ReactNode;
  renderEvent: (date: Date, hour: number) => React.ReactNode;
}) {
  const colTemplate = `48px repeat(${columns.length}, minmax(${columns.length>1?'44px':'1fr'}, 1fr))`;
  return (
    <div className="overflow-x-auto rounded-xl border bg-card shadow-soft">
      {/* All-day row */}
      <div className="grid border-b bg-muted/20" style={{ gridTemplateColumns: colTemplate }}>
        <div className="border-r p-2 text-[10px] font-semibold text-muted-foreground">Dia todo</div>
        {columns.map((date, i) => (
          <div key={i} className="min-h-[32px] border-r p-1 last:border-r-0">{renderAllDay(date)}</div>
        ))}
      </div>
      {/* Column headers */}
      <div className="grid border-b bg-muted/40" style={{ gridTemplateColumns: colTemplate }}>
        <div className="border-r p-2" />
        {columns.map((date, i) => {
          const isToday = isSameDay(date, TODAY);
          return (
            <div key={i} className="border-r p-2 text-center last:border-r-0">
              <div className="text-[10px] font-semibold text-muted-foreground uppercase">{WEEKDAYS[date.getDay()]}</div>
              <div className={cn(
                "mx-auto mt-0.5 flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold",
                isToday && "bg-primary text-primary-foreground shadow-glow-primary"
              )}>{date.getDate()}</div>
            </div>
          );
        })}
      </div>
      {/* Hourly rows */}
      <div className="max-h-[600px] overflow-y-auto scrollbar-thin">
        {HOURS.map((hour) => (
          <div key={hour} className="grid border-b last:border-b-0 hover:bg-accent/5 transition-colors" style={{ gridTemplateColumns: colTemplate }}>
            <div className="border-r p-1 pr-1.5 text-right text-[10px] text-muted-foreground font-medium">{String(hour).padStart(2,"0")}:00</div>
            {columns.map((date, i) => (
              <div key={i} className="relative min-h-[52px] border-r p-0.5 last:border-r-0">{renderEvent(date, hour)}</div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function WeekView({ selectedDate, typeFilter, assignmentFilter, companyFilter, onEventClick }: {
  selectedDate: Date; typeFilter: EventFilterType; assignmentFilter: AssignmentFilter; companyFilter: string;
  onEventClick: (e: CalendarEvent) => void;
}) {
  const weekDays = useMemo(() => getWeekDays(selectedDate), [selectedDate]);
  return (
    <TimeGrid columns={weekDays}
      renderAllDay={(date) => {
        const events = getEventsForDate(date, typeFilter, assignmentFilter, companyFilter).filter((e) => e.type==="prazo");
        return events.map((e, i) => (
          <div key={i} onClick={() => onEventClick(e)} className={`mb-0.5 truncate rounded px-1 py-0.5 text-[9px] font-medium cursor-pointer hover:opacity-80 transition-opacity ${allDayColor(e.type)}`}>
            {e.title.slice(0,15)}
          </div>
        ));
      }}
      renderEvent={(date, hour) => {
        const events = getEventsForDate(date, typeFilter, assignmentFilter, companyFilter).filter((e) => e.hour===hour);
        return events.map((e, i) => (
          <div key={i} onClick={() => onEventClick(e)} className={`mb-0.5 rounded px-1.5 py-1 text-[9px] leading-tight cursor-pointer hover:opacity-80 transition-opacity ${eventColor(e.type)}`}>
            <div className="font-bold">{e.time}</div>
            <div className="truncate">{e.title.slice(0,18)}</div>
            {e.employee && <div className="truncate text-[8px] opacity-75">{e.employee.split(" ").slice(0,2).join(" ")}</div>}
          </div>
        ));
      }}
    />
  );
}

function DayView({ selectedDate, typeFilter, assignmentFilter, companyFilter, onEventClick }: {
  selectedDate: Date; typeFilter: EventFilterType; assignmentFilter: AssignmentFilter; companyFilter: string;
  onEventClick: (e: CalendarEvent) => void;
}) {
  return (
    <TimeGrid columns={[selectedDate]}
      renderAllDay={(date) => {
        const events = getEventsForDate(date, typeFilter, assignmentFilter, companyFilter).filter((e) => e.type==="prazo");
        return events.map((e, i) => (
          <div key={i} onClick={() => onEventClick(e)} className={`mb-0.5 rounded px-2 py-1 text-xs font-medium cursor-pointer hover:opacity-80 transition-opacity ${allDayColor(e.type)}`}>
            {e.title} {e.employee && <span className="opacity-75">· {e.employee}</span>}
          </div>
        ));
      }}
      renderEvent={(date, hour) => {
        const events = getEventsForDate(date, typeFilter, assignmentFilter, companyFilter).filter((e) => e.hour===hour);
        return events.map((e, i) => (
          <div key={i} onClick={() => onEventClick(e)} className={`mb-1 rounded px-2 py-1.5 text-xs leading-tight cursor-pointer hover:opacity-80 transition-opacity ${eventColor(e.type)}`}>
            <div className="font-bold">{e.time} – {eventTypeLabel(e.type)}</div>
            <div>{e.title}</div>
            {e.employee && <div className="mt-0.5 text-[11px] opacity-75">{e.employee}</div>}
          </div>
        ));
      }}
    />
  );
}

// ═══════════════════════════ MAIN ═══════════════════════════
export default function Agenda() {
  const [selectedDate, setSelectedDate] = useState(new Date(2026,1,16));
  const [view, setView] = useState<ViewType>("mes");
  const [typeFilter, setTypeFilter] = useState<EventFilterType>("todos");
  const [assignmentFilter, setAssignmentFilter] = useState<AssignmentFilter>("todos");
  const [companyFilter, setCompanyFilter] = useState("todas");
  const [showFilters, setShowFilters] = useState(false);
  const [showSidePanel, setShowSidePanel] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  const prev = () => {
    const d = new Date(selectedDate);
    if (view === "mes") d.setMonth(d.getMonth()-1);
    else if (view === "semana") d.setDate(d.getDate()-7);
    else d.setDate(d.getDate()-1);
    setSelectedDate(d);
  };
  const next = () => {
    const d = new Date(selectedDate);
    if (view === "mes") d.setMonth(d.getMonth()+1);
    else if (view === "semana") d.setDate(d.getDate()+7);
    else d.setDate(d.getDate()+1);
    setSelectedDate(d);
  };
  const goToToday = () => setSelectedDate(new Date(TODAY));
  const handleDayClick = (date: Date) => { setSelectedDate(date); if (view === "mes") setView("dia"); };

  const handleExportICS = () => {
    const dateStr = formatDateStr(selectedDate);
    const events = getEventsForDate(selectedDate, typeFilter, assignmentFilter, companyFilter);
    downloadICS(events, dateStr);
  };

  const headerText = useMemo(() => {
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

  // Period stats
  const periodStats = useMemo(() => {
    const dates: Date[] = [];
    if (view === "mes") {
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
      const events = getEventsForDate(d, "todos", assignmentFilter, companyFilter);
      events.forEach((e) => {
        if (e.type === "audiencia") audiencias++;
        else if (e.type === "prazo") prazos++;
        else tarefas++;
      });
    });
    return { audiencias, prazos, tarefas, total: audiencias + prazos + tarefas };
  }, [selectedDate, view, assignmentFilter, companyFilter]);

  // Side panel events
  const sidePanelEvents = useMemo(() =>
    getEventsForDate(selectedDate, typeFilter, assignmentFilter, companyFilter),
    [selectedDate, typeFilter, assignmentFilter, companyFilter]
  );

  const activeFilters = (typeFilter !== "todos" ? 1 : 0) + (assignmentFilter !== "todos" ? 1 : 0) + (companyFilter !== "todas" ? 1 : 0);
  const isToday = isSameDay(selectedDate, TODAY);

  return (
    <TooltipProvider>
      <div className="p-4 md:p-6 lg:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Header */}
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-extrabold tracking-tight sm:text-2xl">Agenda</h1>
            <p className="text-sm text-muted-foreground font-medium">
              Gerencie audiências, prazos e tarefas
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant={showFilters ? "secondary" : "outline"}
              size="sm"
              className="gap-1.5 text-xs rounded-lg"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-3.5 w-3.5" />
              Filtros
              {activeFilters > 0 && (
                <Badge className="ml-0.5 h-4 min-w-4 rounded-full px-1 text-[9px] border-0" style={{ background: "var(--gradient-primary)" }}>
                  {activeFilters}
                </Badge>
              )}
            </Button>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1.5 text-xs rounded-lg" onClick={handleExportICS}>
                  <Download className="h-3.5 w-3.5" /> ICS
                </Button>
              </TooltipTrigger>
              <TooltipContent><p className="text-xs">Exportar eventos do dia</p></TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-lg hidden lg:flex"
                  onClick={() => setShowSidePanel(!showSidePanel)}
                >
                  {showSidePanel ? <PanelRightClose className="h-3.5 w-3.5" /> : <PanelRightOpen className="h-3.5 w-3.5" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent><p className="text-xs">{showSidePanel ? "Ocultar painel" : "Mostrar painel"}</p></TooltipContent>
            </Tooltip>
            <Tabs value={view} onValueChange={(v) => setView(v as ViewType)}>
              <TabsList className="h-9">
                <TabsTrigger value="mes" className="text-xs px-3">Mês</TabsTrigger>
                <TabsTrigger value="semana" className="text-xs px-3">Semana</TabsTrigger>
                <TabsTrigger value="dia" className="text-xs px-3">Dia</TabsTrigger>
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
                {mockCompanies.map((c) => (
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

        {/* Calendar + Side Panel */}
        <div className="flex gap-4">
          <div className="flex-1 min-w-0">
            {view === "mes" && <MonthView selectedDate={selectedDate} onDayClick={handleDayClick} typeFilter={typeFilter} assignmentFilter={assignmentFilter} companyFilter={companyFilter} />}
            {view === "semana" && <WeekView selectedDate={selectedDate} typeFilter={typeFilter} assignmentFilter={assignmentFilter} companyFilter={companyFilter} onEventClick={setSelectedEvent} />}
            {view === "dia" && <DayView selectedDate={selectedDate} typeFilter={typeFilter} assignmentFilter={assignmentFilter} companyFilter={companyFilter} onEventClick={setSelectedEvent} />}
          </div>

          {/* Side Panel - Desktop only */}
          {showSidePanel && (
            <div className="hidden lg:block animate-in fade-in slide-in-from-left-2 duration-300">
              <SidePanel date={selectedDate} events={sidePanelEvents} onEventClick={setSelectedEvent} />
            </div>
          )}
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
            {mockHearings.map((h) => (
              <Link key={h.id} to={`/processos/${h.case_id}`}
                className="group flex items-center gap-3 rounded-xl border bg-card p-3.5 shadow-soft transition-all hover:shadow-card hover:-translate-y-0.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                  <Gavel className="h-4 w-4 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{h.type} – {h.employee}</p>
                  <p className="text-xs text-muted-foreground">{new Date(h.date).toLocaleDateString("pt-BR")} às {h.time} · {h.court}</p>
                </div>
                <Badge variant="outline" className="text-[10px] bg-primary/5 text-primary border-primary/20">Audiência</Badge>
              </Link>
            ))}
            {mockDeadlines.filter((d) => d.status==="pendente").map((d) => (
              <Link key={d.id} to={`/processos/${d.case_id}`}
                className="group flex items-center gap-3 rounded-xl border bg-card p-3.5 shadow-soft transition-all hover:shadow-card hover:-translate-y-0.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-warning/10 shrink-0">
                  <Clock className="h-4 w-4 text-warning" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{d.title}</p>
                  <p className="text-xs text-muted-foreground">{new Date(d.due_at).toLocaleDateString("pt-BR")} · {d.employee}</p>
                </div>
                <Badge variant="outline" className="text-[10px] bg-warning/5 text-warning border-warning/20">Prazo</Badge>
              </Link>
            ))}
          </div>
        </div>

        {/* Event Modal */}
        {selectedEvent && <EventModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />}
      </div>
    </TooltipProvider>
  );
}
