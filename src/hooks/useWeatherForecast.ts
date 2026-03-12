import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchWeatherForecast, isWeatherApiError } from '../services/weatherApi';
import { useEventDates } from './useEventDates';
import { getBaseEventDate, addDaysToYmd, formatDate } from '../utils/dateUtils';
import { QUERY_STALE_TIME, QUERY_GC_TIME } from '../config/constants';
import type { DayOfWeek, TimeRange } from '../config/constants';
import type { WeatherSummary } from '../types/app';
import type { DayData } from '../types/weather';

/**
 * Fetch and transform weather data for a single week occurrence.
 *
 * Makes a single API call for the full 15-day forecast, then extracts
 * the target day (determined by day + weekOffset) and summarizes it
 * within the selected time range.
 *
 * @param location   - Free-text location string
 * @param day        - Day of the week for the recurring event
 * @param timeRange  - Hourly window to focus on
 * @param weekOffset - 0 = this week, 1 = next week, 2 = in 2 weeks
 */
export function useWeatherForecast(location: string, day: DayOfWeek, timeRange: TimeRange, weekOffset: number) {
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

  const eventDate = useEventDates(day, weekOffset, query.data?.timezone, timeRange);

  const forecast: WeatherSummary | null = (() => {
    if (!query.data) return null;
    const dayData = query.data.days.find((d) => d.datetime === eventDate.formatted);
    if (!dayData) return null;
    return summarizeDay(dayData, eventDate.human, timeRange);
  })();

  // Count how many weekly occurrences (offsets 0, 1, 2) exist in the API data.
  // weekOffset is a client-side slice — not a cache dimension — so we compute
  // availability for all offsets from the same query result.
  const availableWeeks = useMemo(() => {
    if (!query.data) return 0;
    const tz = query.data.timezone;
    const baseDate = getBaseEventDate(day, tz, timeRange?.endHour);

    let count = 0;
    for (let i = 0; i <= 2; i++) {
      const targetDate =
        i === 0
          ? baseDate
          : addDaysToYmd(
              { year: baseDate.getFullYear(), month: baseDate.getMonth() + 1, day: baseDate.getDate() },
              i * 7,
            );
      if (query.data.days.some((d) => d.datetime === formatDate(targetDate))) {
        count++;
      } else {
        break;
      }
    }
    return count;
  }, [query.data, day, timeRange]);

  return {
    forecast,
    availableWeeks,
    resolvedAddress: query.data?.resolvedAddress ?? null,
    timeZone: query.data?.timezone,
    isLoading: query.isLoading,
    /** True during background refetches (spinner in location input) */
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
  };
}

/**
 * Parse the hour from a Visual Crossing hourly datetime string.
 * The API returns "HH:mm:ss" (e.g. "14:00:00"). We split on ":" and parse
 * the first segment as base-10. Returns -1 on malformed input so the
 * caller's range filter safely excludes it (no valid hour is -1).
 */
function parseHour(datetime: string): number {
  const hour = parseInt(datetime.split(':')[0], 10);
  return Number.isNaN(hour) ? -1 : hour;
}

/**
 * Extract and aggregate hourly data for a single day within the given time range.
 * Falls back to all 24 hours if the filtered window is empty.
 */
function summarizeDay(day: DayData, dayLabel: string, timeRange: TimeRange): WeatherSummary {
  const filteredHours = day.hours.filter((h) => {
    const hour = parseHour(h.datetime);
    return hour >= timeRange.startHour && hour <= timeRange.endHour;
  });

  const hours = filteredHours.length > 0 ? filteredHours : day.hours;

  // Guard against empty hours array (e.g. bad API data) to avoid ±Infinity
  if (hours.length === 0) {
    return {
      date: day.datetime,
      dayLabel,
      avgTemp: 0,
      highTemp: 0,
      lowTemp: 0,
      precipProb: 0,
      avgWindSpeed: 0,
      maxWindGust: 0,
      conditions: day.conditions,
      humidity: 0,
      hourlyTemps: [],
      hourlyPrecipProb: [],
      hourlyWindSpeed: [],
    };
  }

  return {
    date: day.datetime,
    dayLabel,
    avgTemp: avg(hours.map((h) => h.temp)),
    highTemp: Math.max(...hours.map((h) => h.temp)),
    lowTemp: Math.min(...hours.map((h) => h.temp)),
    // Use max rather than avg for precip probability: if any hour in the
    // window has high rain chance, the organizer should know about it.
    precipProb: Math.max(...hours.map((h) => h.precipprob)),
    avgWindSpeed: avg(hours.map((h) => h.windspeed)),
    maxWindGust: Math.max(...hours.map((h) => h.windgust)),
    conditions: day.conditions,
    humidity: avg(hours.map((h) => h.humidity)),
    hourlyTemps: hours.map((h) => ({
      hour: parseHour(h.datetime),
      temp: h.temp,
    })),
    hourlyPrecipProb: hours.map((h) => ({
      hour: parseHour(h.datetime),
      precipProb: h.precipprob,
    })),
    hourlyWindSpeed: hours.map((h) => ({
      hour: parseHour(h.datetime),
      windSpeed: h.windspeed,
    })),
  };
}

/** Compute the arithmetic mean of an array of numbers */
function avg(nums: number[]): number {
  if (nums.length === 0) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}
