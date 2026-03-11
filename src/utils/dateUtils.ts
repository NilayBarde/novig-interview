import type { DayOfWeek } from '../config/constants';
import { DAYS_OF_WEEK } from '../config/constants';

/**
 * Get the next occurrence of a given day of the week.
 * If today IS that day, returns today.
 */
export function getNextDayOfWeek(dayName: DayOfWeek, from: Date = new Date()): Date {
  const targetIndex = DAYS_OF_WEEK.indexOf(dayName);
  const currentIndex = from.getDay();
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
export function getFollowingWeekDay(dayName: DayOfWeek, from: Date = new Date()): Date {
  const nextOccurrence = getNextDayOfWeek(dayName, from);
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
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}
