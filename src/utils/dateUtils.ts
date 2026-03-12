import type { DayOfWeek } from '../config/constants';
import { DAYS_OF_WEEK } from '../config/constants';

/**
 * Returns a new Date object representing "now" (or the provided date) in the target timezone.
 * We do this by formatting the time in the target TZ and parsing it back as local time.
 */
function getNowInTimezone(timeZone?: string, from: Date = new Date()): Date {
  if (!timeZone) return from;

  try {
    const tzString = from.toLocaleString('en-US', { timeZone });
    return new Date(tzString);
  } catch (e) {
    // Fallback if timezone is invalid
    return from;
  }
}

/**
 * Get the next occurrence of a given day of the week.
 * If today IS that day (in the target timezone), returns today.
 */
export function getNextDayOfWeek(dayName: DayOfWeek, timeZone?: string, from: Date = new Date()): Date {
  const currentDate = getNowInTimezone(timeZone, from);
  const targetIndex = DAYS_OF_WEEK.indexOf(dayName);
  const currentIndex = currentDate.getDay();
  let daysUntil = targetIndex - currentIndex;
  if (daysUntil < 0) daysUntil += 7;

  const result = new Date(from);
  result.setDate(result.getDate() + daysUntil);
  return result;
}

/**
 * Get the occurrence of a day in the week after next.
 * Always 7 days after getNextDayOfWeek.
 */
export function getFollowingWeekDay(dayName: DayOfWeek, timeZone?: string, from: Date = new Date()): Date {
  const nextOccurrence = getNextDayOfWeek(dayName, timeZone, from);
  const result = new Date(nextOccurrence);
  result.setDate(result.getDate() + 7);
  return result;
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
  // We use the browser's default here because the underlying Date object
  // has already been shifted to represent the correct year/month/day
  // values for the target timezone via getNowInTimezone.
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}
