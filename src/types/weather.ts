/** Visual Crossing API response types */

export interface HourData {
  datetime: string; // "HH:mm:ss"
  temp: number;
  humidity: number;
  precip: number;
  precipprob: number;
  windspeed: number;
  windgust: number;
  conditions: string;
  icon: string;
}

export interface DayData {
  datetime: string; // "YYYY-MM-DD"
  temp: number;
  tempmax: number;
  tempmin: number;
  humidity: number;
  precip: number;
  precipprob: number;
  windspeed: number;
  windgust: number;
  conditions: string;
  icon: string;
  hours: HourData[];
}

export interface WeatherResponse {
  queryCost: number;
  latitude: number;
  longitude: number;
  resolvedAddress: string;
  address: string;
  timezone: string;
  tzoffset: number;
  days: DayData[];
}

export interface WeatherApiError {
  type: 'invalid_location' | 'rate_limit' | 'network' | 'unknown';
  message: string;
  status?: number;
}
