import { useMemo } from 'react';
import type { DayOfWeek } from '../config/constants';
import { getNextDayOfWeek, getFollowingWeekDay, formatDate, formatDateHuman } from '../utils/dateUtils';

/**
 * Compute the "this week" and "next week" dates for a given day of the week.
 *
 * Returns both machine-readable (YYYY-MM-DD) and human-readable formats,
 * memoized so downstream hooks don't re-run unnecessarily.
 */
export function useEventDates(day: DayOfWeek) {
  return useMemo(() => {
    const thisWeekDate = getNextDayOfWeek(day);
    const nextWeekDate = getFollowingWeekDay(day);

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
  }, [day]);
}
