import { useMemo } from "react";
import { Clock, Gavel, ListTodo, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { AppRole } from "@/contexts/AuthContext";
import {
  MONTHS, WEEKDAYS, HOURS, TODAY,
  type CalendarEvent, type EventFilterType, type AssignmentFilter,
  type AgendaDataSource,
  getEventsForDate, getWeekDays, isSameDay, eventColor, allDayColor, eventTypeLabel,
} from "./agendaHelpers";

interface ViewProps {
  typeFilter: EventFilterType;
  assignmentFilter: AssignmentFilter;
  companyFilter: string;
  currentUser: string;
  userRole?: AppRole;
  data: AgendaDataSource;
}

// ── Stat Mini Card ──
export function StatMini({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
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

function getEvents(date: Date, p: ViewProps) {
  return getEventsForDate(date, p.typeFilter, p.assignmentFilter, p.companyFilter, p.currentUser, p.userRole, p.data);
}

// ── Month View ──
export function MonthView({ selectedDate, onDayClick, onAddClick, ...vp }: ViewProps & {
  selectedDate: Date; onDayClick: (d: Date) => void; onAddClick?: (d: Date) => void;
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
        const events = getEvents(date, vp);
        const isToday = isSameDay(date, TODAY);
        const isSelected = isSameDay(date, selectedDate);
        return (
          <div key={day} onClick={() => onDayClick(date)}
            className={cn(
              "group/cell min-h-[80px] cursor-pointer bg-card p-1.5 transition-all hover:bg-accent/20 md:min-h-[100px] relative",
              isToday && "ring-2 ring-inset ring-primary/60",
              isSelected && !isToday && "bg-accent/10",
            )}>
            <div className="flex items-center justify-between">
              <span className={cn(
                "inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                isToday && "bg-primary text-primary-foreground",
                isSelected && !isToday && "bg-accent text-accent-foreground",
              )}>{day}</span>
              {onAddClick && (
                <button
                  onClick={(e) => { e.stopPropagation(); onAddClick(date); }}
                  className="opacity-0 group-hover/cell:opacity-100 transition-opacity h-5 w-5 flex items-center justify-center rounded-full hover:bg-primary/10 text-primary"
                >
                  <Plus className="h-3 w-3" />
                </button>
              )}
            </div>
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

// ── Time Grid (shared by Week and Day) ──
function TimeGrid({ columns, renderAllDay, renderEvent, onAddClick }: {
  columns: Date[];
  renderAllDay: (date: Date) => React.ReactNode;
  renderEvent: (date: Date, hour: number) => React.ReactNode;
  onAddClick?: (date: Date, hour?: number) => void;
}) {
  const colTemplate = `48px repeat(${columns.length}, minmax(${columns.length>1?'44px':'1fr'}, 1fr))`;
  return (
    <div className="overflow-x-auto rounded-xl border bg-card shadow-soft">
      <div className="grid border-b bg-muted/20" style={{ gridTemplateColumns: colTemplate }}>
        <div className="border-r p-2 text-[10px] font-semibold text-muted-foreground">Dia todo</div>
        {columns.map((date, i) => (
          <div key={i} className="min-h-[32px] border-r p-1 last:border-r-0">{renderAllDay(date)}</div>
        ))}
      </div>
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
      <div className="max-h-[600px] overflow-y-auto scrollbar-thin">
        {HOURS.map((hour) => (
          <div key={hour} className="grid border-b last:border-b-0 group/row hover:bg-accent/5 transition-colors" style={{ gridTemplateColumns: colTemplate }}>
            <div className="border-r p-1 pr-1.5 text-right text-[10px] text-muted-foreground font-medium">{String(hour).padStart(2,"0")}:00</div>
            {columns.map((date, i) => (
              <div key={i} className="relative min-h-[52px] border-r p-0.5 last:border-r-0 group/slot">
                {renderEvent(date, hour)}
                {onAddClick && (
                  <button
                    onClick={() => onAddClick(date, hour)}
                    className="absolute inset-0 opacity-0 group-hover/slot:opacity-100 transition-opacity flex items-center justify-center"
                  >
                    <span className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center">
                      <Plus className="h-3 w-3 text-primary" />
                    </span>
                  </button>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Week View ──
export function WeekView({ selectedDate, onEventClick, onAddClick, ...vp }: ViewProps & {
  selectedDate: Date; onEventClick: (e: CalendarEvent) => void; onAddClick?: (d: Date, hour?: number) => void;
}) {
  const weekDays = useMemo(() => getWeekDays(selectedDate), [selectedDate]);
  return (
    <TimeGrid columns={weekDays} onAddClick={onAddClick}
      renderAllDay={(date) => {
        const events = getEvents(date, vp).filter((e) => e.type==="prazo");
        return events.map((e, i) => (
          <div key={i} onClick={() => onEventClick(e)} className={`mb-0.5 truncate rounded px-1 py-0.5 text-[9px] font-medium cursor-pointer hover:opacity-80 transition-opacity ${allDayColor(e.type)}`}>
            {e.title.slice(0,15)}
          </div>
        ));
      }}
      renderEvent={(date, hour) => {
        const events = getEvents(date, vp).filter((e) => e.hour===hour);
        return events.map((e, i) => (
          <div key={i} onClick={() => onEventClick(e)} className={`mb-0.5 rounded px-1.5 py-1 text-[9px] leading-tight cursor-pointer hover:opacity-80 transition-opacity relative z-10 ${eventColor(e.type)}`}>
            <div className="font-bold">{e.time}</div>
            <div className="truncate">{e.title.slice(0,18)}</div>
            {e.employee && <div className="truncate text-[8px] opacity-75">{e.employee.split(" ").slice(0,2).join(" ")}</div>}
          </div>
        ));
      }}
    />
  );
}

// ── Day View ──
export function DayView({ selectedDate, onEventClick, onAddClick, ...vp }: ViewProps & {
  selectedDate: Date; onEventClick: (e: CalendarEvent) => void; onAddClick?: (d: Date, hour?: number) => void;
}) {
  return (
    <TimeGrid columns={[selectedDate]} onAddClick={onAddClick}
      renderAllDay={(date) => {
        const events = getEvents(date, vp).filter((e) => e.type==="prazo");
        return events.map((e, i) => (
          <div key={i} onClick={() => onEventClick(e)} className={`mb-0.5 rounded px-2 py-1 text-xs font-medium cursor-pointer hover:opacity-80 transition-opacity ${allDayColor(e.type)}`}>
            {e.title} {e.employee && <span className="opacity-75">· {e.employee}</span>}
          </div>
        ));
      }}
      renderEvent={(date, hour) => {
        const events = getEvents(date, vp).filter((e) => e.hour===hour);
        return events.map((e, i) => (
          <div key={i} onClick={() => onEventClick(e)} className={`mb-1 rounded px-2 py-1.5 text-xs leading-tight cursor-pointer hover:opacity-80 transition-opacity relative z-10 ${eventColor(e.type)}`}>
            <div className="font-bold">{e.time} – {eventTypeLabel(e.type)}</div>
            <div>{e.title}</div>
            {e.employee && <div className="mt-0.5 text-[11px] opacity-75">{e.employee}</div>}
          </div>
        ));
      }}
    />
  );
}

// ── Year View ──
export function YearView({ selectedDate, onMonthClick, ...vp }: ViewProps & {
  selectedDate: Date; onMonthClick: (d: Date) => void;
}) {
  const year = selectedDate.getFullYear();

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
      {MONTHS.map((monthName, monthIdx) => {
        const daysInMonth = new Date(year, monthIdx + 1, 0).getDate();
        const firstDayOfWeek = new Date(year, monthIdx, 1).getDay();

        const eventMap: Record<number, Set<string>> = {};
        let audiencias = 0, prazos = 0, tarefas = 0;
        for (let d = 1; d <= daysInMonth; d++) {
          const date = new Date(year, monthIdx, d);
          const evts = getEvents(date, vp);
          if (evts.length > 0) {
            eventMap[d] = new Set(evts.map((e) => e.type));
            evts.forEach((e) => {
              if (e.type === "audiencia") audiencias++;
              else if (e.type === "prazo") prazos++;
              else tarefas++;
            });
          }
        }
        const total = audiencias + prazos + tarefas;
        const isCurrentMonth = monthIdx === TODAY.getMonth() && year === TODAY.getFullYear();
        const todayDay = isCurrentMonth ? TODAY.getDate() : -1;

        const cells: (number | null)[] = Array(firstDayOfWeek).fill(null);
        for (let d = 1; d <= daysInMonth; d++) cells.push(d);
        while (cells.length % 7 !== 0) cells.push(null);

        return (
          <button
            key={monthIdx}
            onClick={() => onMonthClick(new Date(year, monthIdx, 1))}
            className={cn(
              "rounded-2xl border bg-card p-4 text-left transition-all hover:shadow-card hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              isCurrentMonth && "ring-2 ring-primary/40 bg-primary/[0.02]",
            )}
          >
            <div className="flex items-center justify-between mb-3">
              <span className={cn(
                "text-sm font-bold",
                isCurrentMonth ? "text-primary" : "text-foreground",
              )}>{monthName}</span>
              {total > 0 && (
                <span className="text-[10px] font-semibold text-muted-foreground bg-muted rounded-full px-1.5 py-0.5">
                  {total}
                </span>
              )}
            </div>

            <div className="grid grid-cols-7 gap-px mb-3">
              {["D","S","T","Q","Q","S","S"].map((d, i) => (
                <span key={i} className="text-center text-[8px] font-semibold text-muted-foreground/60 pb-0.5">{d}</span>
              ))}
              {cells.map((day, i) => {
                if (!day) return <span key={i} />;
                const types = eventMap[day];
                const isToday = day === todayDay;
                const hasAudiencia = types?.has("audiencia");
                const hasPrazo = types?.has("prazo");
                const hasTarefa = types?.has("tarefa");

                return (
                  <div key={i} className="flex flex-col items-center gap-px">
                    <span className={cn(
                      "text-[9px] leading-none w-5 h-5 flex items-center justify-center rounded-full font-medium",
                      isToday && "bg-primary text-primary-foreground font-bold",
                      !isToday && types && "text-foreground font-semibold",
                      !isToday && !types && "text-muted-foreground/50",
                    )}>
                      {day}
                    </span>
                    {types ? (
                      <div className="flex gap-px justify-center">
                        {hasAudiencia && <span className="w-1 h-1 rounded-full bg-primary" />}
                        {hasPrazo && <span className="w-1 h-1 rounded-full bg-warning" />}
                        {hasTarefa && <span className="w-1 h-1 rounded-full bg-success" />}
                      </div>
                    ) : <span className="h-1" />}
                  </div>
                );
              })}
            </div>

            {total === 0 ? (
              <p className="text-[10px] text-muted-foreground/40 text-center">Sem eventos</p>
            ) : (
              <div className="flex items-center gap-2 flex-wrap">
                {audiencias > 0 && (
                  <span className="flex items-center gap-1 text-[10px] font-semibold text-primary bg-primary/10 rounded-full px-1.5 py-0.5">
                    <Gavel className="h-2.5 w-2.5" />{audiencias}
                  </span>
                )}
                {prazos > 0 && (
                  <span className="flex items-center gap-1 text-[10px] font-semibold text-warning bg-warning/10 rounded-full px-1.5 py-0.5">
                    <Clock className="h-2.5 w-2.5" />{prazos}
                  </span>
                )}
                {tarefas > 0 && (
                  <span className="flex items-center gap-1 text-[10px] font-semibold text-success bg-success/10 rounded-full px-1.5 py-0.5">
                    <ListTodo className="h-2.5 w-2.5" />{tarefas}
                  </span>
                )}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
