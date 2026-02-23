import type { AppRole } from "@/contexts/AuthContext";

// ── Constants ──
export const MONTHS = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
export const WEEKDAYS = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];
export const WEEKDAYS_FULL = ["Domingo","Segunda-feira","Terça-feira","Quarta-feira","Quinta-feira","Sexta-feira","Sábado"];
export const HOURS = Array.from({ length: 17 }, (_, i) => i + 6);
export const TODAY = new Date();

export type ViewType = "dia" | "semana" | "mes" | "ano";
export type EventFilterType = "todos" | "audiencia" | "prazo" | "tarefa";
export type AssignmentFilter = "todos" | "minhas";

export interface CalendarEvent {
  id?: string;
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

export interface AgendaDataSource {
  hearings: Array<{
    id: string;
    case_id: string;
    date: string;
    time: string | null;
    type: string | null;
    court: string | null;
    status: string;
    cases?: { case_number: string; employee_name: string | null; company_id: string | null; status: string; responsible: string | null } | null;
  }>;
  deadlines: Array<{
    id: string;
    case_id: string;
    title: string;
    due_at: string;
    status: string;
    cases?: { case_number: string; employee_name: string | null; company_id: string | null; responsible: string | null } | null;
  }>;
  tasks: Array<{
    id: string;
    title: string;
    due_at: string | null;
    status: string;
    case_id: string | null;
    assignees: string[] | null;
    show_in_calendar: boolean | null;
    cases?: { case_number: string; employee_name: string | null; company_id: string | null; responsible: string | null } | null;
  }>;
}

export function formatDateStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

export function getEventsForDate(
  date: Date,
  typeFilter: EventFilterType,
  assignmentFilter: AssignmentFilter,
  companyFilter: string,
  currentUser: string,
  _userRole: AppRole | undefined,
  data: AgendaDataSource,
): CalendarEvent[] {
  const dateStr = formatDateStr(date);
  const items: CalendarEvent[] = [];

  if (typeFilter === "todos" || typeFilter === "audiencia") {
    data.hearings.forEach((h) => {
      if (h.date !== dateStr) return;
      if (h.status === "cancelada") return;
      if (h.cases?.status === "encerrado") return;
      if (companyFilter !== "todas" && h.cases?.company_id !== companyFilter) return;
      if (assignmentFilter === "minhas" && h.cases?.responsible !== currentUser) return;
      const time = h.time ?? undefined;
      items.push({
        id: h.id,
        type: "audiencia",
        title: h.type ?? "Audiência",
        time,
        date: h.date,
        hour: time ? parseInt(time.split(":")[0]) : undefined,
        employee: h.cases?.employee_name ?? undefined,
        caseId: h.case_id,
        caseNumber: h.cases?.case_number,
        companyId: h.cases?.company_id ?? undefined,
        detail: h.court ?? undefined,
      });
    });
  }

  if (typeFilter === "todos" || typeFilter === "prazo") {
    data.deadlines.forEach((d) => {
      const dDate = d.due_at.slice(0, 10);
      if (dDate !== dateStr) return;
      if (d.status === "cumprido") return;
      if (companyFilter !== "todas" && d.cases?.company_id !== companyFilter) return;
      if (assignmentFilter === "minhas" && d.cases?.responsible !== currentUser) return;
      items.push({
        id: d.id,
        type: "prazo",
        title: d.title,
        date: dDate,
        employee: d.cases?.employee_name ?? undefined,
        caseId: d.case_id,
        caseNumber: d.cases?.case_number,
        companyId: d.cases?.company_id ?? undefined,
      });
    });
  }

  if (typeFilter === "todos" || typeFilter === "tarefa") {
    data.tasks.forEach((t) => {
      if (!t.due_at) return;
      if (!t.due_at.startsWith(dateStr)) return;
      if (t.status === "concluida") return;
      if (t.show_in_calendar === false) return;
      if (companyFilter !== "todas" && t.cases && t.cases.company_id !== companyFilter) return;
      if (assignmentFilter === "minhas" && !(t.assignees ?? []).includes(currentUser)) return;
      const timePart = t.due_at.includes("T") ? t.due_at.split("T")[1]?.slice(0, 5) : undefined;
      items.push({
        id: t.id,
        type: "tarefa",
        title: t.title,
        time: timePart,
        date: dateStr,
        hour: timePart ? parseInt(timePart.split(":")[0]) : undefined,
        employee: t.cases?.employee_name ?? undefined,
        caseId: t.case_id ?? undefined,
        caseNumber: t.cases?.case_number,
        companyId: t.cases?.company_id ?? undefined,
        assignees: t.assignees ?? undefined,
      });
    });
  }

  return items;
}

export function getWeekDays(date: Date): Date[] {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay());
  return Array.from({ length: 7 }, (_, i) => { const dd = new Date(d); dd.setDate(d.getDate()+i); return dd; });
}

export function isSameDay(a: Date, b: Date) {
  return a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate();
}

export function eventColor(type: string) {
  if (type === "audiencia") return "bg-primary/15 text-primary border-l-2 border-primary";
  if (type === "prazo") return "bg-warning/15 text-warning border-l-2 border-warning";
  return "bg-success/15 text-success border-l-2 border-success";
}

export function allDayColor(type: string) {
  if (type === "prazo") return "bg-warning/20 text-warning";
  return "bg-muted text-muted-foreground";
}

export function eventTypeLabel(type: string) {
  return type === "audiencia" ? "Audiência" : type === "prazo" ? "Prazo" : "Tarefa";
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

export function downloadICS(events: CalendarEvent[], dateStr: string) {
  const blob = new Blob([generateICS(events, dateStr)], { type: "text/calendar" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `agenda-siag-${dateStr}.ics`;
  a.click(); URL.revokeObjectURL(url);
}
