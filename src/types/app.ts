import type { DayOfWeek, TimeRange } from '../config/constants';

export interface EventConfig {
  location: string;
  day: DayOfWeek;
  timeRange: TimeRange;
}

export type Severity = 'good' | 'caution' | 'warning';

export interface WeatherVerdict {
  message: string;
  severity: Severity;
}

export interface WeatherSummary {
  date: string;
  dayLabel: string;
  avgTemp: number;
  highTemp: number;
  lowTemp: number;
  precipProb: number;
  avgWindSpeed: number;
  maxWindGust: number;
  conditions: string;
  humidity: number;
  hourlyTemps: { hour: number; temp: number }[];
  hourlyPrecipProb: { hour: number; precipProb: number }[];
}

export interface ComparisonResult {
  thisWeek: WeatherSummary;
  nextWeek: WeatherSummary;
  resolvedAddress: string;
}
