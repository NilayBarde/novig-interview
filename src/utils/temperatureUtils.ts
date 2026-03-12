import type { TempUnit, WindUnit } from '../config/constants';

/** Convert Fahrenheit to Celsius */
export function fToC(f: number): number {
  return Math.round(((f - 32) * 5) / 9);
}

/** Format a temperature (stored as °F) into the requested unit, rounded */
export function displayTemp(tempF: number, unit: TempUnit): number {
  return unit === 'C' ? fToC(tempF) : Math.round(tempF);
}

/** Convert mph to km/h */
function mphToKmh(mph: number): number {
  return Math.round(mph * 1.60934);
}

/** Format wind speed: mph or km/h based on selected wind unit */
export function displayWindSpeed(mph: number, unit: WindUnit): number {
  return unit === 'kmh' ? mphToKmh(mph) : Math.round(mph);
}

/** Return the wind speed label matching the selected unit */
export function windSpeedLabel(unit: WindUnit): string {
  return unit === 'kmh' ? 'km/h' : 'mph';
}
