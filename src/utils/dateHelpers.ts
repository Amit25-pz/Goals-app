import { format, startOfWeek, endOfWeek, getISOWeek, getYear, subMonths, subWeeks, addDays, lastDayOfMonth, isEqual, startOfDay } from 'date-fns';

export function getMonthKey(date: Date = new Date()): string {
  return format(date, 'yyyy-MM');
}

export function getWeekKey(date: Date = new Date()): string {
  const week = getISOWeek(date);
  const year = getYear(date);
  return `${year}-W${String(week).padStart(2, '0')}`;
}

export function getDayKey(date: Date = new Date()): string {
  return format(date, 'yyyy-MM-dd');
}

export function getPreviousMonthKey(monthKey: string): string {
  const date = new Date(monthKey + '-01');
  return getMonthKey(subMonths(date, 1));
}

export function getPreviousWeekKey(weekKey: string): string {
  const date = weekKeyToDate(weekKey);
  return getWeekKey(subWeeks(date, 1));
}

export function weekKeyToDate(weekKey: string): Date {
  const [yearStr, weekStr] = weekKey.split('-W');
  const year = parseInt(yearStr);
  const week = parseInt(weekStr);
  // Jan 4 is always in ISO week 1
  const jan4 = new Date(year, 0, 4);
  const startOfWeek1 = addDays(jan4, -(jan4.getDay() || 7) + 1);
  return addDays(startOfWeek1, (week - 1) * 7);
}

export function getWeekDateRange(weekKey: string): { start: Date; end: Date } {
  const date = weekKeyToDate(weekKey);
  return {
    start: startOfWeek(date, { weekStartsOn: 0 }),
    end: endOfWeek(date, { weekStartsOn: 0 }),
  };
}

export function formatMonthLabel(monthKey: string): string {
  const date = new Date(monthKey + '-01');
  return format(date, 'MMMM yyyy');
}

export function formatWeekLabel(weekKey: string): string {
  const { start, end } = getWeekDateRange(weekKey);
  return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`;
}

export function isToday(dayKey: string): boolean {
  return isEqual(startOfDay(new Date(dayKey)), startOfDay(new Date()));
}

export function isSaturday(date: Date = new Date()): boolean {
  return date.getDay() === 6;
}

export function isFirstOfMonth(date: Date = new Date()): boolean {
  return date.getDate() === 1;
}

export function isLastDayOfMonth(date: Date = new Date()): boolean {
  return isEqual(startOfDay(date), startOfDay(lastDayOfMonth(date)));
}

export function monthKeyToMonthName(monthKey: string): string {
  const date = new Date(monthKey + '-01');
  return format(date, 'MMMM');
}
