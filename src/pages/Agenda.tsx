import { useState } from "react";
import { ChevronLeft, ChevronRight, CalendarDays, Clock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockHearings, mockDeadlines, mockTasks } from "@/data/mock";

const MONTHS = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export default function Agenda() {
  const [year, setYear] = useState(2026);
  const [month, setMonth] = useState(1); // February 2026
  const [view, setView] = useState("mes");

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfWeek(year, month);

  const eventsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const items: { type: string; title: string; time?: string }[] = [];
    mockHearings.forEach((h) => { if (h.date === dateStr) items.push({ type: "audiencia", title: h.type, time: h.time }); });
    mockDeadlines.forEach((d) => { if (d.due_at === dateStr) items.push({ type: "prazo", title: d.title }); });
    mockTasks.filter((t) => t.show_in_calendar).forEach((t) => {
      if (t.due_at.startsWith(dateStr)) items.push({ type: "tarefa", title: t.title, time: t.due_at.split("T")[1]?.slice(0, 5) });
    });
    return items;
  };

  const prev = () => { if (month === 0) { setMonth(11); setYear(year - 1); } else setMonth(month - 1); };
  const next = () => { if (month === 11) { setMonth(0); setYear(year + 1); } else setMonth(month + 1); };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Agenda</h1>
        <Tabs value={view} onValueChange={setView}>
          <TabsList>
            <TabsTrigger value="mes">Mês</TabsTrigger>
            <TabsTrigger value="semana">Semana</TabsTrigger>
            <TabsTrigger value="dia">Dia</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={prev}><ChevronLeft className="h-5 w-5" /></Button>
        <h2 className="text-lg font-semibold">{MONTHS[month]} {year}</h2>
        <Button variant="ghost" size="icon" onClick={next}><ChevronRight className="h-5 w-5" /></Button>
      </div>

      <div className="grid grid-cols-7 gap-px overflow-hidden rounded-lg border bg-border">
        {WEEKDAYS.map((d) => (
          <div key={d} className="bg-muted p-2 text-center text-xs font-medium text-muted-foreground">{d}</div>
        ))}
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`e-${i}`} className="min-h-[80px] bg-card p-1 md:min-h-[100px]" />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const events = eventsForDay(day);
          const isToday = year === 2026 && month === 1 && day === 16;
          return (
            <div
              key={day}
              className={`min-h-[80px] bg-card p-1 md:min-h-[100px] ${isToday ? "ring-2 ring-inset ring-primary" : ""}`}
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
