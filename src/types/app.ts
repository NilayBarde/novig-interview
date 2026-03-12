import type { DayOfWeek, TimeRange, TempUnit } from '../config/constants';

/** User-configurable settings for the event being planned */
export interface EventConfig {
  /** Free-text location (city, address, or zip code) */
  location: string;
  /** Recurring day of the week for the meetup */
  day: DayOfWeek;
  /** Time window within the day to focus the forecast on */
  timeRange: TimeRange;
  /** Display unit for temperatures */
  tempUnit: TempUnit;
}

/** Traffic-light severity for weather verdicts */
export type Severity = 'good' | 'caution' | 'warning';

/** A single human-friendly weather assessment */
export interface WeatherVerdict {
  message: string;
  severity: Severity;
}

/**
 * Processed weather data for a single day, scoped to the selected time range.
 * All temperatures are stored internally in °F (API's native unit).
 */
export interface WeatherSummary {
  /** ISO date string (YYYY-MM-DD) */
  date: string;
  /** Human-readable date label, e.g. "Sat, Mar 14" */
  dayLabel: string;
  /** Average temperature (°F) across the time window */
  avgTemp: number;
  /** Highest hourly temperature (°F) in the window */
  highTemp: number;
  /** Lowest hourly temperature (°F) in the window */
  lowTemp: number;
  /** Peak precipitation probability (%) across any hour in the window */
  precipProb: number;
  /** Average wind speed (mph) across the window */
  avgWindSpeed: number;
  /** Maximum wind gust (mph) in the window */
  maxWindGust: number;
  /** Day-level conditions string from the API (e.g. "Partially cloudy") */
  conditions: string;
  /** Average relative humidity (%) */
  humidity: number;
  /** Per-hour temperature data for charting */
  hourlyTemps: { hour: number; temp: number }[];
  /** Per-hour precipitation probability data for charting */
  hourlyPrecipProb: { hour: number; precipProb: number }[];
}

/** Side-by-side comparison of two weekly forecasts */
export interface ComparisonResult {
  thisWeek: WeatherSummary;
  nextWeek: WeatherSummary;
  /** Geocoded address returned by the API */
  resolvedAddress: string;
}
