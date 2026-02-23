import { addDays, isWeekend, isSameDay, differenceInCalendarDays, format, parseISO } from "date-fns";

export interface Holiday {
  id: string;
  name: string;
  date: string;
  scope: string;
  court: string | null;
  recurring: boolean;
}

/**
 * Check if a date falls on a holiday (considering court-specific and national)
 */
export function isHoliday(date: Date, holidays: Holiday[], court?: string): boolean {
  const dateStr = format(date, "yyyy-MM-dd");
  const monthDay = format(date, "MM-dd");

  return holidays.some((h) => {
    // Scope filtering: national applies to all, court-specific only if matching
    if (h.scope !== "nacional" && h.court && court && h.court !== court) return false;

    if (h.recurring) {
      return format(parseISO(h.date), "MM-dd") === monthDay;
    }
    return h.date === dateStr;
  });
}

/**
 * Check if a date is a business day (not weekend, not holiday)
 */
export function isBusinessDay(date: Date, holidays: Holiday[], court?: string): boolean {
  return !isWeekend(date) && !isHoliday(date, holidays, court);
}

/**
 * Add N business days to a start date, skipping weekends and holidays
 */
export function addBusinessDays(
  startDate: Date,
  businessDays: number,
  holidays: Holiday[],
  court?: string
): Date {
  let current = new Date(startDate);
  let added = 0;

  while (added < businessDays) {
    current = addDays(current, 1);
    if (isBusinessDay(current, holidays, court)) {
      added++;
    }
  }

  return current;
}

/**
 * Count business days between two dates
 */
export function countBusinessDays(
  start: Date,
  end: Date,
  holidays: Holiday[],
  court?: string
): number {
  let count = 0;
  let current = addDays(new Date(start), 1);

  while (current <= end) {
    if (isBusinessDay(current, holidays, court)) {
      count++;
    }
    current = addDays(current, 1);
  }

  return count;
}

/**
 * Calculate remaining business days until a deadline
 */
export function remainingBusinessDays(
  dueDate: Date,
  holidays: Holiday[],
  court?: string
): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);

  if (due <= today) return 0;
  return countBusinessDays(today, due, holidays, court);
}

/**
 * Calculate remaining calendar days for suspension purposes
 */
export function remainingCalendarDays(dueDate: Date): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  return Math.max(0, differenceInCalendarDays(due, today));
}

/**
 * Common deadline types in Brazilian labor law
 */
export const DEADLINE_TYPES = [
  { value: "contestacao", label: "Contestação", days: 15, type: "uteis" },
  { value: "recurso_ordinario", label: "Recurso Ordinário", days: 8, type: "uteis" },
  { value: "recurso_revista", label: "Recurso de Revista", days: 8, type: "uteis" },
  { value: "agravo_instrumento", label: "Agravo de Instrumento", days: 8, type: "uteis" },
  { value: "agravo_peticao", label: "Agravo de Petição", days: 8, type: "uteis" },
  { value: "embargos_declaracao", label: "Embargos de Declaração", days: 5, type: "uteis" },
  { value: "manifestacao", label: "Manifestação", days: 5, type: "uteis" },
  { value: "contrarrazoes", label: "Contrarrazões", days: 8, type: "uteis" },
  { value: "pericia", label: "Perícia (Quesitos)", days: 5, type: "uteis" },
  { value: "cumprimento_sentenca", label: "Cumprimento de Sentença", days: 15, type: "uteis" },
  { value: "impugnacao", label: "Impugnação", days: 15, type: "uteis" },
  { value: "pagamento", label: "Pagamento Espontâneo", days: 48, type: "horas" },
  { value: "personalizado", label: "Personalizado", days: 0, type: "uteis" },
] as const;

/**
 * Get alert status for a deadline
 */
export function getDeadlineAlertLevel(
  dueDate: Date,
  holidays: Holiday[],
  court?: string
): "vencido" | "hoje" | "3d" | "7d" | "15d" | "ok" {
  const remaining = remainingBusinessDays(dueDate, holidays, court);
  const calendarDays = remainingCalendarDays(dueDate);

  if (calendarDays === 0 && remaining === 0) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    if (due < today) return "vencido";
    return "hoje";
  }

  if (remaining <= 0) return "vencido";
  if (remaining <= 3) return "3d";
  if (remaining <= 7) return "7d";
  if (remaining <= 15) return "15d";
  return "ok";
}
