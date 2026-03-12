import { useMemo } from 'react';
import type { DayOfWeek, TimeRange } from '../config/constants';
import { getBaseEventDate, addDaysToYmd, formatDate, formatDateHuman } from '../utils/dateUtils';

/**
 * Compute the date for the nth occurrence (weekOffset) of a given day of the week.
 *
 * Uses `getBaseEventDate` as offset 0, which handles the "today already past"
 * advance automatically. Higher offsets add 7-day multiples from that base.
 *
 * Returns machine-readable (YYYY-MM-DD) and human-readable formats,
 * memoized so downstream hooks don't re-run unnecessarily.
 */
export function useEventDates(day: DayOfWeek, weekOffset: number, timeZone?: string, timeRange?: TimeRange) {
  const endHour = timeRange?.endHour;

  return useMemo(() => {
    const baseDate = getBaseEventDate(day, timeZone, endHour);

    const targetDate =
      weekOffset === 0
        ? baseDate
        : addDaysToYmd(
            { year: baseDate.getFullYear(), month: baseDate.getMonth() + 1, day: baseDate.getDate() },
            weekOffset * 7,
          );

    return {
      date: targetDate,
      /** YYYY-MM-DD for API date matching */
      formatted: formatDate(targetDate),
      /** e.g. "Sat, Mar 14" for display */
      human: formatDateHuman(targetDate),
    };
  }, [day, weekOffset, timeZone, endHour]);
}
