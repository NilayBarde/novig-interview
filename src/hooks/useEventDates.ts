import { useMemo } from 'react';
import type { DayOfWeek } from '../config/constants';
import { getNextDayOfWeek, getFollowingWeekDay, formatDate, formatDateHuman } from '../utils/dateUtils';

export function useEventDates(day: DayOfWeek) {
  return useMemo(() => {
    const thisWeekDate = getNextDayOfWeek(day);
    const nextWeekDate = getFollowingWeekDay(day);

    return {
      thisWeek: {
        date: thisWeekDate,
        formatted: formatDate(thisWeekDate),
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
