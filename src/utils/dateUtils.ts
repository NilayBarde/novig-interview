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
export function addDaysToYmd(ymd: { year: number; month: number; day: number }, days: number): Date {
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

/**
 * Compute the base date (offset 0) for a recurring event day.
 *
 * If today IS the selected day but the time window has already ended,
 * advances by one week so callers always receive a future occurrence.
 * All week-offset calculations should start from this base.
 *
 * @param endHour - The inclusive end hour of the time window; omit to skip advance logic.
 */
export function getBaseEventDate(dayName: DayOfWeek, timeZone?: string, endHour?: number): Date {
  const base = getNextDayOfWeek(dayName, timeZone);
  if (
    endHour !== undefined &&
    formatDate(base) === getTodayFormatted(timeZone) &&
    isTimeWindowPast(endHour, timeZone)
  ) {
    return getFollowingWeekDay(dayName, timeZone);
  }
  return base;
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

/** Return today's date as YYYY-MM-DD in the given timezone (falls back to local). */
export function getTodayFormatted(timeZone?: string): string {
  const ymd = getYmdInTimeZone(new Date(), timeZone);
  return `${ymd.year}-${String(ymd.month).padStart(2, '0')}-${String(ymd.day).padStart(2, '0')}`;
}

/** Return the current hour (0–23) in the given timezone (falls back to local). */
export function getCurrentHourInTimeZone(timeZone?: string, now: Date = new Date()): number {
  if (!timeZone) return now.getHours();

  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone,
      hour: 'numeric',
      hour12: false,
    }).formatToParts(now);
    const hourStr = parts.find((p) => p.type === 'hour')?.value ?? '';
    const hour = parseInt(hourStr, 10);
    // Intl can return 24 for midnight in hour12: false mode — normalise to 0
    return Number.isFinite(hour) ? hour % 24 : now.getHours();
  } catch {
    return now.getHours();
  }
}

/**
 * Returns true if the given time window's final hour has started or passed
 * in the event's timezone.
 *
 * Uses `>=` rather than `>`: once the clock reaches `endHour`, the last
 * scheduled slot of the window has begun. Showing next week's forecast at
 * that point is preferable to surfacing data from a window that's finishing up.
 *
 * @param endHour  - Inclusive end hour of the time window (e.g. 21 for 9 PM)
 * @param timeZone - IANA timezone of the event location
 * @param now      - Override for testability; defaults to current time
 */
export function isTimeWindowPast(endHour: number, timeZone?: string, now: Date = new Date()): boolean {
  return getCurrentHourInTimeZone(timeZone, now) >= endHour;
}
