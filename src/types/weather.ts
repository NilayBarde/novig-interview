/**
 * Visual Crossing Timeline API response types.
 * @see https://www.visualcrossing.com/resources/documentation/weather-api/timeline-weather-api/
 */

/** Hourly weather observation/forecast */
export interface HourData {
  /** Time in "HH:mm:ss" format (local to the queried location) */
  datetime: string;
  /** Temperature (°F when unitGroup=us) */
  temp: number;
  /** Relative humidity (%) */
  humidity: number;
  /** Precipitation amount (inches) */
  precip: number;
  /** Probability of measurable precipitation (0–100%) */
  precipprob: number;
  /** Sustained wind speed (mph) */
  windspeed: number;
  /** Wind gust speed (mph) */
  windgust: number;
  /** Human-readable conditions description */
  conditions: string;
  /** Icon identifier for weather condition */
  icon: string;
}

/** Daily weather summary with nested hourly data */
export interface DayData {
  /** Date in "YYYY-MM-DD" format */
  datetime: string;
  /** Average temperature (°F) */
  temp: number;
  /** Maximum temperature (°F) */
  tempmax: number;
  /** Minimum temperature (°F) */
  tempmin: number;
  /** Average relative humidity (%) */
  humidity: number;
  /** Total precipitation (inches) */
  precip: number;
  /** Peak precipitation probability (%) */
  precipprob: number;
  /** Average wind speed (mph) */
  windspeed: number;
  /** Maximum wind gust (mph) */
  windgust: number;
  /** Human-readable conditions description */
  conditions: string;
  /** Icon identifier */
  icon: string;
  /** Hourly breakdown for this day */
  hours: HourData[];
}

/** Top-level API response from the Timeline endpoint */
export interface WeatherResponse {
  /** Number of API credits consumed */
  queryCost: number;
  latitude: number;
  longitude: number;
  /** Geocoded address the API resolved from the query */
  resolvedAddress: string;
  /** Original address string sent in the request */
  address: string;
  /** IANA timezone of the location (e.g. "America/Los_Angeles") */
  timezone: string;
  /** UTC offset in hours */
  tzoffset: number;
  /** Daily forecasts (typically 15 days on the free tier) */
  days: DayData[];
}

/** Typed error for API failure modes */
export interface WeatherApiError {
  type: 'invalid_location' | 'rate_limit' | 'network' | 'unknown';
  message: string;
  status?: number;
}
