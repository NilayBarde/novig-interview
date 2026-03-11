import { useQuery } from '@tanstack/react-query';
import { fetchWeatherForecast } from '../services/weatherApi';
import { useEventDates } from './useEventDates';
import { QUERY_STALE_TIME, QUERY_GC_TIME } from '../config/constants';
import type { DayOfWeek, TimeRange } from '../config/constants';
import type { WeatherSummary, ComparisonResult } from '../types/app';
import type { DayData } from '../types/weather';

export function useWeatherForecast(location: string, day: DayOfWeek, timeRange: TimeRange) {
  const dates = useEventDates(day);

  const query = useQuery({
    queryKey: ['weather', location],
    queryFn: () => fetchWeatherForecast(location),
    enabled: location.trim().length > 0,
    staleTime: QUERY_STALE_TIME,
    gcTime: QUERY_GC_TIME,
    retry: 3,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10000),
  });

  const comparison: ComparisonResult | null = (() => {
    if (!query.data) return null;

    const thisWeekDay = query.data.days.find((d) => d.datetime === dates.thisWeek.formatted);
    const nextWeekDay = query.data.days.find((d) => d.datetime === dates.nextWeek.formatted);

    if (!thisWeekDay || !nextWeekDay) return null;

    return {
      thisWeek: summarizeDay(thisWeekDay, dates.thisWeek.human, timeRange),
      nextWeek: summarizeDay(nextWeekDay, dates.nextWeek.human, timeRange),
      resolvedAddress: query.data.resolvedAddress,
    };
  })();

  return {
    comparison,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
  };
}

function summarizeDay(day: DayData, dayLabel: string, timeRange: TimeRange): WeatherSummary {
  const filteredHours = day.hours.filter((h) => {
    const hour = parseInt(h.datetime.split(':')[0], 10);
    return hour >= timeRange.startHour && hour < timeRange.endHour;
  });

  const hours = filteredHours.length > 0 ? filteredHours : day.hours;

  return {
    date: day.datetime,
    dayLabel,
    avgTemp: avg(hours.map((h) => h.temp)),
    highTemp: Math.max(...hours.map((h) => h.temp)),
    lowTemp: Math.min(...hours.map((h) => h.temp)),
    precipProb: Math.max(...hours.map((h) => h.precipprob)),
    avgWindSpeed: avg(hours.map((h) => h.windspeed)),
    maxWindGust: Math.max(...hours.map((h) => h.windgust)),
    conditions: day.conditions,
    humidity: avg(hours.map((h) => h.humidity)),
    hourlyTemps: hours.map((h) => ({
      hour: parseInt(h.datetime.split(':')[0], 10),
      temp: h.temp,
    })),
    hourlyPrecipProb: hours.map((h) => ({
      hour: parseInt(h.datetime.split(':')[0], 10),
      precipProb: h.precipprob,
    })),
  };
}

function avg(nums: number[]): number {
  if (nums.length === 0) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}
