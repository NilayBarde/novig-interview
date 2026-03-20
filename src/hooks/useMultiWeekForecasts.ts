import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchWeatherForecast, isWeatherApiError } from '../services/weatherApi';
import { getBaseEventDate, addDaysToYmd, formatDate, formatDateHuman } from '../utils/dateUtils';
import { summarizeDay } from '../utils/weatherSummary';
import { QUERY_STALE_TIME, QUERY_GC_TIME } from '../config/constants';
import type { DayOfWeek, TimeRange } from '../config/constants';
import type { WeatherSummary } from '../types/app';

/**
 * Fetch weather data once and extract N weekly summaries client-side.
 *
 * Uses the same React Query cache key (`['weather', location]`) so no extra
 * API calls are made when called with the same location, regardless of weekCount.
 *
 * @param weekCount  Number of weekly occurrences to return (default 2)
 */
export function useMultiWeekForecasts(
  location: string,
  day: DayOfWeek,
  timeRange: TimeRange,
  weekCount: number = 2,
): {
  weeks: Array<{ offset: number; summary: WeatherSummary | null }>;
  resolvedAddress: string | null;
  timeZone: string | undefined;
  isLoading: boolean;
  isFetching: boolean;
  error: Error | null;
  refetch: () => void;
} {
  const query = useQuery({
    queryKey: ['weather', location],
    queryFn: ({ signal }) => fetchWeatherForecast(location, signal),
    enabled: location.trim().length > 0,
    staleTime: QUERY_STALE_TIME,
    gcTime: QUERY_GC_TIME,
    retry: (failureCount, error) => {
      // Don't retry deterministic client errors (bad location, etc.)
      if (isWeatherApiError(error) && error.type === 'invalid_location') return false;
      return failureCount < 3;
    },
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10000),
  });

  // useMemo recomputes weekly summaries only when the raw API data or user
  // selections change — not on every render. The API data is cached by React
  // Query, so this avoids re-slicing the same 15-day response on every keystroke.
  const weeks = useMemo(() => {
    const results: Array<{ offset: number; summary: WeatherSummary | null }> = [];

    if (!query.data) {
      for (let offset = 0; offset < weekCount; offset++) {
        results.push({ offset, summary: null });
      }
      return results;
    }

    const tz = query.data.timezone;
    // Hoist base date computation outside the loop so all offsets share a
    // consistent anchor — avoids a theoretical inconsistency if the time-window
    // boundary fires between iterations.
    const baseDate = getBaseEventDate(day, tz, timeRange?.endHour);
    const baseYmd = { year: baseDate.getFullYear(), month: baseDate.getMonth() + 1, day: baseDate.getDate() };

    for (let offset = 0; offset < weekCount; offset++) {
      const targetDate = addDaysToYmd(baseYmd, offset * 7);

      const formatted = formatDate(targetDate);
      const human = formatDateHuman(targetDate);
      const dayData = query.data.days.find((d) => d.datetime === formatted);

      results.push({
        offset,
        summary: dayData ? summarizeDay(dayData, human, timeRange) : null,
      });
    }

    return results;
  }, [query.data, day, timeRange, weekCount]);

  return {
    weeks,
    resolvedAddress: query.data?.resolvedAddress ?? null,
    timeZone: query.data?.timezone,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
  };
}
