import type { TimeRange } from '../config/constants';
import type { WeatherSummary } from '../types/app';
import type { DayData } from '../types/weather';

/**
 * Parse the hour from a Visual Crossing hourly datetime string.
 * The API returns "HH:mm:ss" (e.g. "14:00:00"). We split on ":" and parse
 * the first segment as base-10. Returns -1 on malformed input so the
 * caller's range filter safely excludes it (no valid hour is -1).
 */
export function parseHour(datetime: string): number {
  const hour = parseInt(datetime.split(':')[0], 10);
  return Number.isNaN(hour) ? -1 : hour;
}

/**
 * Extract and aggregate hourly data for a single day within the given time range.
 * Falls back to all 24 hours if the filtered window is empty.
 *
 * Uses `Math.max` (not avg) for precipProb: if any single hour in the window
 * carries high rain risk, the organizer needs to know — averaging it away
 * would understate the risk.
 */
export function summarizeDay(day: DayData, dayLabel: string, timeRange: TimeRange): WeatherSummary {
  const filteredHours = day.hours.filter((h) => {
    const hour = parseHour(h.datetime);
    return hour >= timeRange.startHour && hour <= timeRange.endHour;
  });

  // Guard against empty hours array (e.g. bad API data) to avoid ±Infinity
  const hours = filteredHours.length > 0 ? filteredHours : day.hours;

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

  const temps = hours.map((h) => h.temp);
  const highTemp = Math.max(...temps);
  const lowTemp = Math.min(...temps);
  const precipProb = Math.max(...hours.map((h) => h.precipprob));
  const maxWindGust = Math.max(...hours.map((h) => h.windgust));

  return {
    date: day.datetime,
    dayLabel,
    avgTemp: avg(temps),
    highTemp,
    lowTemp,
    precipProb,
    avgWindSpeed: avg(hours.map((h) => h.windspeed)),
    maxWindGust,
    conditions: day.conditions,
    humidity: avg(hours.map((h) => h.humidity)),
    hourlyTemps: hours.map((h) => ({ hour: parseHour(h.datetime), temp: h.temp })),
    hourlyPrecipProb: hours.map((h) => ({ hour: parseHour(h.datetime), precipProb: h.precipprob })),
    hourlyWindSpeed: hours.map((h) => ({ hour: parseHour(h.datetime), windSpeed: h.windspeed })),
  };
}

/** Compute the arithmetic mean of an array of numbers */
export function avg(nums: number[]): number {
  if (nums.length === 0) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}
