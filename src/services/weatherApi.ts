import { VISUAL_CROSSING_BASE_URL, VISUAL_CROSSING_API_KEY } from '../config/constants';
import type { WeatherResponse, WeatherApiError } from '../types/weather';

/**
 * Fetch weather forecast from Visual Crossing Timeline API.
 * Returns 15-day forecast which we slice client-side into "this week" and "next week."
 */
export async function fetchWeatherForecast(location: string): Promise<WeatherResponse> {
  if (!VISUAL_CROSSING_API_KEY) {
    throw createError('unknown', 'Missing API key. Set VITE_WEATHER_API_KEY in .env');
  }

  const encodedLocation = encodeURIComponent(location);
  const url = `${VISUAL_CROSSING_BASE_URL}/${encodedLocation}?unitGroup=us&include=days,hours&elements=datetime,temp,tempmax,tempmin,humidity,precip,precipprob,windspeed,windgust,conditions,icon&key=${VISUAL_CROSSING_API_KEY}`;

  let response: Response;
  try {
    response = await fetch(url);
  } catch {
    throw createError('network', 'Unable to connect. Check your internet connection and try again.');
  }

  if (!response.ok) {
    if (response.status === 400) {
      throw createError('invalid_location', 'Could not find that location. Try a city name or zip code.', 400);
    }
    if (response.status === 429) {
      throw createError('rate_limit', 'Too many requests. Please wait a moment and try again.', 429);
    }
    throw createError('unknown', `Weather service error (${response.status}). Please try again.`, response.status);
  }

  return response.json() as Promise<WeatherResponse>;
}

function createError(type: WeatherApiError['type'], message: string, status?: number): WeatherApiError {
  return { type, message, status };
}

export function isWeatherApiError(error: unknown): error is WeatherApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'type' in error &&
    'message' in error
  );
}
