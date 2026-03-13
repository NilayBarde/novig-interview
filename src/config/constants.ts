// Environment configs
export const VISUAL_CROSSING_API_KEY = import.meta.env.VITE_WEATHER_API_KEY;
export const VISUAL_CROSSING_BASE_URL =
  'https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline';

/**
 * API key is exposed client-side for this prototype.
 * In production, proxy through a serverless function to protect the key.
 */

/** Days of the week, indexed to match `Date.getDay()` (0 = Sunday) */
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

/** Wind speed display unit */
export type WindUnit = 'mph' | 'kmh';

/**
 * Selectable time windows for filtering hourly forecast data.
 * Each range defines a closed interval `[startHour, endHour]`.
 */
export const TIME_RANGES = [
  { label: 'Morning (6am-12pm)', shortLabel: 'Morning', startHour: 6, endHour: 12 },
  { label: 'Afternoon (12pm-5pm)', shortLabel: 'Afternoon', startHour: 12, endHour: 17 },
  { label: 'Evening (5pm-9pm)', shortLabel: 'Evening', startHour: 17, endHour: 21 },
  { label: 'All Day', shortLabel: 'All Day', startHour: 6, endHour: 21 },
] as const;

export type TimeRange = (typeof TIME_RANGES)[number];

/**
 * Temperature thresholds in °F for weather verdict messages.
 * The 60–75°F "nice day" band comes directly from the product spec.
 * The broader COLD/COOL and WARM/HOT cutoffs follow NOAA's general
 * outdoor thermal-comfort guidance for recreational activities.
 */
export const TEMP_THRESHOLDS = {
  COLD: 32,
  COOL: 60,
  NICE_MAX: 75,
  WARM_MAX: 85,
} as const;

/**
 * Precipitation probability thresholds (0–100%).
 * Aligned with NWS Probability of Precipitation (PoP) terminology:
 * "slight chance" tops out near 30%, "likely" begins near 70%.
 */
export const PRECIP_THRESHOLDS = {
  LOW: 30,
  HIGH: 70,
} as const;

/**
 * Wind speed thresholds in mph, derived from the Beaufort Wind Scale.
 * 15 mph ≈ Beaufort 3 (gentle breeze — noticeable but comfortable).
 * 25 mph ≈ Beaufort 5 (fresh breeze — loose items need securing).
 */
export const WIND_THRESHOLDS = {
  BREEZY: 15,
  WINDY: 25,
} as const;

/** User-selectable temperature display unit */
export type TempUnit = 'F' | 'C';

/** React Query: data is considered fresh for 10 minutes */
export const QUERY_STALE_TIME = 10 * 60 * 1000;

/** React Query: unused data is garbage-collected after 30 minutes */
export const QUERY_GC_TIME = 30 * 60 * 1000;

/** Debounce delay (ms) for the location input before triggering an API call */
export const DEBOUNCE_MS = 500;
