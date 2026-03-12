import { useMemo } from 'react';
import type { DayOfWeek, TimeRange } from '../config/constants';
import {
  getNextDayOfWeek,
  getFollowingWeekDay,
  formatDate,
  formatDateHuman,
  getTodayFormatted,
  isTimeWindowPast,
} from '../utils/dateUtils';

/**
 * Compute the "this week" and "next week" dates for a given day of the week.
 *
 * If today IS the selected day but the chosen time window has already passed,
 * "This Week" advances to next week (and "Next Week" to the week after) so
 * users never see stale historical data presented as a forecast.
 *
 * Returns both machine-readable (YYYY-MM-DD) and human-readable formats,
 * memoized so downstream hooks don't re-run unnecessarily.
 */
export function useEventDates(day: DayOfWeek, timeZone?: string, timeRange?: TimeRange) {
  // Depend only on endHour (the one field we read), not the full object reference.
  // This prevents the memo from busting on every render when the parent passes
  // a new-but-equivalent TimeRange object.
  const endHour = timeRange?.endHour;

  return useMemo(() => {
    let thisWeekDate = getNextDayOfWeek(day, timeZone);
    let nextWeekDate = getFollowingWeekDay(day, timeZone);

    // If today is the selected day but the time window has already ended,
    // treat the upcoming occurrence (next week) as "This Week".
    if (endHour !== undefined && formatDate(thisWeekDate) === getTodayFormatted(timeZone)) {
      if (isTimeWindowPast(endHour, timeZone)) {
        // Advance both dates by one week.
        // We use the already-computed nextWeekDate rather than a "+1 day" trick:
        // adding 1 local-midnight day doesn't reliably skip past the target day in the
        // event's timezone when the user's browser is ahead of that timezone
        // (e.g. EST midnight = LA 9 PM = still the same day in LA).
        const newThisWeek = nextWeekDate;
        nextWeekDate = getFollowingWeekDay(day, timeZone, nextWeekDate);
        thisWeekDate = newThisWeek;
      }
    }

    return {
      thisWeek: {
        date: thisWeekDate,
        /** YYYY-MM-DD for API date matching */
        formatted: formatDate(thisWeekDate),
        /** e.g. "Sat, Mar 14" for display */
        human: formatDateHuman(thisWeekDate),
      },
      nextWeek: {
        date: nextWeekDate,
        formatted: formatDate(nextWeekDate),
        human: formatDateHuman(nextWeekDate),
      },
    };
  }, [day, timeZone, endHour]);
}
