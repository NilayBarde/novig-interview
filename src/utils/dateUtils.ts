import type { DayOfWeek } from '../config/constants';
import { DAYS_OF_WEEK } from '../config/constants';

/**
 * Returns the day-of-week index (0=Sunday..6=Saturday) for the target timezone.
 *
 * Uses `Intl.DateTimeFormat(...).formatToParts()` so we never parse locale strings
 * or depend on the host timezone's DST rules for the target timezone.
 */
function getWeekdayIndexInTimeZone(from: Date, timeZone?: string): number {
  if (!timeZone) return from.getDay();

  try {
    const formatter = new Intl.DateTimeFormat('en-US', { timeZone, weekday: 'short' });
    const weekday = formatter.format(from);
    const map: Record<string, number> = {
      Sun: 0,
      Mon: 1,
      Tue: 2,
      Wed: 3,
      Thu: 4,
      Fri: 5,
      Sat: 6,
    };
    return map[weekday] ?? from.getDay();
  } catch {
    return from.getDay();
  }
}

/** Return the target timezone's calendar Y/M/D (month is 1-based). */
function getYmdInTimeZone(from: Date, timeZone?: string): { year: number; month: number; day: number } {
  if (!timeZone) {
    return { year: from.getFullYear(), month: from.getMonth() + 1, day: from.getDate() };
  }

  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(from);

    const year = Number(parts.find((p) => p.type === 'year')?.value);
    const month = Number(parts.find((p) => p.type === 'month')?.value);
    const day = Number(parts.find((p) => p.type === 'day')?.value);

    if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) {
      return { year: from.getFullYear(), month: from.getMonth() + 1, day: from.getDate() };
    }

    return { year, month, day };
  } catch {
    return { year: from.getFullYear(), month: from.getMonth() + 1, day: from.getDate() };
  }
}

/**
 * Add days to a calendar date (Y/M/D) in a DST-safe way.
 * The returned Date is in the local timezone but represents the correct calendar date.
 */
function addDaysToYmd(ymd: { year: number; month: number; day: number }, days: number): Date {
  const utc = new Date(Date.UTC(ymd.year, ymd.month - 1, ymd.day + days));
  return new Date(utc.getUTCFullYear(), utc.getUTCMonth(), utc.getUTCDate());
}

/**
 * Get the next occurrence of a given day of the week.
 * If today IS that day (in the target timezone), returns today.
 */
export function getNextDayOfWeek(dayName: DayOfWeek, timeZone?: string, from: Date = new Date()): Date {
  const targetIndex = DAYS_OF_WEEK.indexOf(dayName);
  const currentIndex = getWeekdayIndexInTimeZone(from, timeZone);
  let daysUntil = targetIndex - currentIndex;
  if (daysUntil < 0) daysUntil += 7;

  const baseYmd = getYmdInTimeZone(from, timeZone);
  return addDaysToYmd(baseYmd, daysUntil);
}

/**
 * Get the occurrence of a day in the week after next.
 * Always 7 days after getNextDayOfWeek.
 */
export function getFollowingWeekDay(dayName: DayOfWeek, timeZone?: string, from: Date = new Date()): Date {
  const nextOccurrence = getNextDayOfWeek(dayName, timeZone, from);
  return addDaysToYmd(
    { year: nextOccurrence.getFullYear(), month: nextOccurrence.getMonth() + 1, day: nextOccurrence.getDate() },
    7,
  );
}

/** Format Date as YYYY-MM-DD */
export function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Format Date as human-readable: "Tue, Mar 11" */
export function formatDateHuman(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}
