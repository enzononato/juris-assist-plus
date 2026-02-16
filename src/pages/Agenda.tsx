import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, CalendarDays, Clock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockHearings, mockDeadlines, mockTasks } from "@/data/mock";

const MONTHS = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const WEEKDAYS_FULL = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
const HOURS = Array.from({ length: 17 }, (_, i) => i + 6); // 6..22

type ViewType = "mes" | "semana" | "dia";

interface CalendarEvent {
  type: "audiencia" | "prazo" | "tarefa";
  title: string;
  time?: string; // HH:MM
  hour?: number;
  employee?: string;
}

function formatDateStr(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function getEventsForDate(date: Date): CalendarEvent[] {
  const dateStr = formatDateStr(date);
  const items: CalendarEvent[] = [];
  mockHearings.forEach((h) => {
    if (h.date === dateStr)
      items.push({ type: "audiencia", title: h.type, time: h.time, hour: parseInt(h.time.split(":")[0]), employee: h.employee });
  });
  mockDeadlines.forEach((d) => {
    if (d.due_at === dateStr)
      items.push({ type: "prazo", title: d.title, employee: d.employee });
  });
  mockTasks.filter((t) => t.show_in_calendar).forEach((t) => {
    if (t.due_at.startsWith(dateStr)) {
      const time = t.due_at.split("T")[1]?.slice(0, 5);
      items.push({ type: "tarefa", title: t.title, time, hour: time ? parseInt(time.split(":")[0]) : undefined });
    }
  });
  return items;
}

function getWeekDays(date: Date): Date[] {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  return Array.from({ length: 7 }, (_, i) => {
    const dd = new Date(d);
    dd.setDate(d.getDate() + i);
    return dd;
  });
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

const TODAY = new Date(2026, 1, 16);

function eventColor(type: string) {
  if (type === "audiencia") return "bg-primary/15 text-primary border-l-2 border-primary";
  if (type === "prazo") return "bg-warning/15 text-warning border-l-2 border-warning";
  return "bg-success/15 text-success border-l-2 border-success";
}

function allDayColor(type: string) {
  if (type === "prazo") return "bg-warning/20 text-warning";
  return "bg-muted text-muted-foreground";
}

// ========== MONTH VIEW ==========
function MonthView({ selectedDate, onDayClick }: { selectedDate: Date; onDayClick: (d: Date) => void }) {
  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  return (
    <div className="grid grid-cols-7 gap-px overflow-hidden rounded-lg border bg-border">
      {WEEKDAYS.map((d) => (
        <div key={d} className="bg-muted p-2 text-center text-xs font-medium text-muted-foreground">{d}</div>
      ))}
      {Array.from({ length: firstDay }).map((_, i) => (
        <div key={`e-${i}`} className="min-h-[80px] bg-card p-1 md:min-h-[100px]" />
      ))}
      {Array.from({ length: daysInMonth }).map((_, i) => {
        const day = i + 1;
        const date = new Date(year, month, day);
        const events = getEventsForDate(date);
        const isToday = isSameDay(date, TODAY);
        return (
          <div
            key={day}
            onClick={() => onDayClick(date)}
            className={`min-h-[80px] cursor-pointer bg-card p-1 transition-colors hover:bg-accent/30 md:min-h-[100px] ${isToday ? "ring-2 ring-inset ring-primary" : ""}`}
          >
            <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${isToday ? "bg-primary text-primary-foreground" : ""}`}>
              {day}
            </span>
            <div className="mt-1 space-y-0.5">
              {events.slice(0, 2).map((e, idx) => (
                <div
                  key={idx}
                  className={`truncate rounded px-1 py-0.5 text-[10px] font-medium ${
                    e.type === "audiencia" ? "bg-primary/10 text-primary" :
                    e.type === "prazo" ? "bg-warning/15 text-warning" :
                    "bg-success/10 text-success"
                  }`}
                >
                  {e.time ? `${e.time} ` : ""}{e.title.slice(0, 20)}
                </div>
              ))}
              {events.length > 2 && (
                <span className="text-[10px] text-muted-foreground">+{events.length - 2} mais</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ========== TIME GRID (shared by Week & Day) ==========
function TimeGrid({ columns, renderAllDay, renderEvent }: {
  columns: Date[];
  renderAllDay: (date: Date) => React.ReactNode;
  renderEvent: (date: Date, hour: number) => React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      {/* All-day area */}
      <div className="grid border-b bg-muted/30" style={{ gridTemplateColumns: `60px repeat(${columns.length}, 1fr)` }}>
        <div className="border-r p-2 text-[10px] font-medium text-muted-foreground">Dia todo</div>
        {columns.map((date, i) => (
          <div key={i} className="min-h-[32px] border-r p-1 last:border-r-0">
            {renderAllDay(date)}
          </div>
        ))}
      </div>

      {/* Header row */}
      <div className="grid border-b bg-muted" style={{ gridTemplateColumns: `60px repeat(${columns.length}, 1fr)` }}>
        <div className="border-r p-2" />
        {columns.map((date, i) => {
          const isToday = isSameDay(date, TODAY);
          return (
            <div key={i} className="border-r p-2 text-center last:border-r-0">
              <div className="text-[10px] font-medium text-muted-foreground">{WEEKDAYS[date.getDay()]}</div>
              <div className={`mx-auto mt-0.5 flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold ${isToday ? "bg-primary text-primary-foreground" : ""}`}>
                {date.getDate()}
              </div>
            </div>
          );
        })}
      </div>

      {/* Hour rows */}
      <div className="max-h-[600px] overflow-y-auto">
        {HOURS.map((hour) => (
          <div key={hour} className="grid border-b last:border-b-0" style={{ gridTemplateColumns: `60px repeat(${columns.length}, 1fr)` }}>
            <div className="border-r p-1 pr-2 text-right text-[11px] text-muted-foreground">
              {String(hour).padStart(2, "0")}:00
            </div>
            {columns.map((date, i) => (
              <div key={i} className="relative min-h-[48px] border-r p-0.5 last:border-r-0">
                {renderEvent(date, hour)}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ========== WEEK VIEW ==========
function WeekView({ selectedDate }: { selectedDate: Date }) {
  const weekDays = useMemo(() => getWeekDays(selectedDate), [selectedDate]);

  return (
    <TimeGrid
      columns={weekDays}
      renderAllDay={(date) => {
        const events = getEventsForDate(date).filter((e) => e.type === "prazo");
        return events.map((e, i) => (
          <div key={i} className={`mb-0.5 truncate rounded px-1 py-0.5 text-[9px] font-medium ${allDayColor(e.type)}`}>
            {e.title.slice(0, 15)}
          </div>
        ));
      }}
      renderEvent={(date, hour) => {
        const events = getEventsForDate(date).filter((e) => e.hour === hour);
        return events.map((e, i) => (
          <div key={i} className={`mb-0.5 rounded px-1 py-0.5 text-[9px] leading-tight ${eventColor(e.type)}`}>
            <div className="font-semibold">{e.time}</div>
            <div className="truncate">{e.title.slice(0, 18)}</div>
            {e.employee && <div className="truncate text-[8px] opacity-75">{e.employee.split(" ").slice(0, 2).join(" ")}</div>}
          </div>
        ));
      }}
    />
  );
}

// ========== DAY VIEW ==========
function DayView({ selectedDate }: { selectedDate: Date }) {
  return (
    <TimeGrid
      columns={[selectedDate]}
      renderAllDay={(date) => {
        const events = getEventsForDate(date).filter((e) => e.type === "prazo");
        return events.map((e, i) => (
          <div key={i} className={`mb-0.5 rounded px-2 py-1 text-xs font-medium ${allDayColor(e.type)}`}>
            {e.title} {e.employee && <span className="opacity-75">· {e.employee}</span>}
          </div>
        ));
      }}
      renderEvent={(date, hour) => {
        const events = getEventsForDate(date).filter((e) => e.hour === hour);
        return events.map((e, i) => (
          <div key={i} className={`mb-1 rounded px-2 py-1.5 text-xs leading-tight ${eventColor(e.type)}`}>
            <div className="font-semibold">{e.time} – {e.type === "audiencia" ? "Audiência" : "Tarefa"}</div>
            <div>{e.title}</div>
            {e.employee && <div className="mt-0.5 text-[11px] opacity-75">{e.employee}</div>}
          </div>
        ));
      }}
    />
  );
}

// ========== MAIN ==========
export default function Agenda() {
  const [selectedDate, setSelectedDate] = useState(new Date(2026, 1, 16));
  const [view, setView] = useState<ViewType>("mes");

  const prev = () => {
    const d = new Date(selectedDate);
    if (view === "mes") d.setMonth(d.getMonth() - 1);
    else if (view === "semana") d.setDate(d.getDate() - 7);
    else d.setDate(d.getDate() - 1);
    setSelectedDate(d);
  };

  const next = () => {
    const d = new Date(selectedDate);
    if (view === "mes") d.setMonth(d.getMonth() + 1);
    else if (view === "semana") d.setDate(d.getDate() + 7);
    else d.setDate(d.getDate() + 1);
    setSelectedDate(d);
  };

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    setView("dia");
  };

  // Header text
  const headerText = useMemo(() => {
    if (view === "mes") {
      return `${MONTHS[selectedDate.getMonth()]} ${selectedDate.getFullYear()}`;
    }
    if (view === "semana") {
      const week = getWeekDays(selectedDate);
      const first = week[0];
      const last = week[6];
      const fMonth = MONTHS[first.getMonth()].slice(0, 3);
      const lMonth = MONTHS[last.getMonth()].slice(0, 3);
      if (first.getMonth() === last.getMonth()) {
        return `${first.getDate()}–${last.getDate()} ${fMonth} ${first.getFullYear()}`;
      }
      return `${first.getDate()} ${fMonth} – ${last.getDate()} ${lMonth} ${last.getFullYear()}`;
    }
    return `${WEEKDAYS_FULL[selectedDate.getDay()]}, ${selectedDate.getDate()} de ${MONTHS[selectedDate.getMonth()]} ${selectedDate.getFullYear()}`;
  }, [view, selectedDate]);

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Agenda</h1>
        <Tabs value={view} onValueChange={(v) => setView(v as ViewType)}>
          <TabsList>
            <TabsTrigger value="mes">Mês</TabsTrigger>
            <TabsTrigger value="semana">Semana</TabsTrigger>
            <TabsTrigger value="dia">Dia</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={prev}><ChevronLeft className="h-5 w-5" /></Button>
        <h2 className="text-lg font-semibold">{headerText}</h2>
        <Button variant="ghost" size="icon" onClick={next}><ChevronRight className="h-5 w-5" /></Button>
      </div>

      {view === "mes" && <MonthView selectedDate={selectedDate} onDayClick={handleDayClick} />}
      {view === "semana" && <WeekView selectedDate={selectedDate} />}
      {view === "dia" && <DayView selectedDate={selectedDate} />}

      {/* Próximos Eventos */}
      <div className="mt-6">
        <h3 className="mb-3 text-sm font-semibold">Próximos Eventos</h3>
        <div className="space-y-2">
          {mockHearings.map((h) => (
            <div key={h.id} className="flex items-center gap-3 rounded-lg border bg-card p-3">
              <CalendarDays className="h-4 w-4 shrink-0 text-primary" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{h.type} – {h.employee}</p>
                <p className="text-xs text-muted-foreground">{new Date(h.date).toLocaleDateString("pt-BR")} às {h.time} · {h.court}</p>
              </div>
              <Badge variant="outline" className="text-[10px]">Audiência</Badge>
            </div>
          ))}
          {mockDeadlines.filter((d) => d.status === "pendente").map((d) => (
            <div key={d.id} className="flex items-center gap-3 rounded-lg border bg-card p-3">
              <Clock className="h-4 w-4 shrink-0 text-warning" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{d.title}</p>
                <p className="text-xs text-muted-foreground">{new Date(d.due_at).toLocaleDateString("pt-BR")} · {d.employee}</p>
              </div>
              <Badge variant="outline" className="text-[10px]">Prazo</Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
