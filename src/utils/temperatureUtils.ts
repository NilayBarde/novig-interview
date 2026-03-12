import type { TempUnit } from '../config/constants';

/** Convert Fahrenheit to Celsius */
export function fToC(f: number): number {
  return Math.round(((f - 32) * 5) / 9);
}

/** Format a temperature (stored as °F) into the requested unit, rounded */
export function displayTemp(tempF: number, unit: TempUnit): number {
  return unit === 'C' ? fToC(tempF) : Math.round(tempF);
}
