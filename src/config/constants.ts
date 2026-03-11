export const VISUAL_CROSSING_BASE_URL =
  'https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline';

/**
 * API key is exposed client-side for this prototype.
 * In production, proxy through a serverless function to protect the key.
 */
export const VISUAL_CROSSING_API_KEY = import.meta.env.VITE_WEATHER_API_KEY as string;

export const DAYS_OF_WEEK = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;

export type DayOfWeek = (typeof DAYS_OF_WEEK)[number];

export const TIME_RANGES = [
  { label: 'Morning (6am–12pm)', startHour: 6, endHour: 12 },
  { label: 'Afternoon (12pm–5pm)', startHour: 12, endHour: 17 },
  { label: 'Evening (5pm–9pm)', startHour: 17, endHour: 21 },
  { label: 'All Day', startHour: 6, endHour: 21 },
] as const;

export type TimeRange = (typeof TIME_RANGES)[number];

/** Temperature thresholds in Fahrenheit for weather messages */
export const TEMP_THRESHOLDS = {
  COLD: 50,
  COOL: 60,
  NICE_MAX: 75,
  WARM_MAX: 85,
} as const;

/** Precipitation probability thresholds (0-100) */
export const PRECIP_THRESHOLDS = {
  LOW: 30,
  HIGH: 70,
} as const;

/** Wind speed thresholds in mph */
export const WIND_THRESHOLDS = {
  BREEZY: 15,
  WINDY: 25,
} as const;

export const QUERY_STALE_TIME = 10 * 60 * 1000; // 10 minutes
export const QUERY_GC_TIME = 30 * 60 * 1000; // 30 minutes
export const DEBOUNCE_MS = 500;
