/** Convert Fahrenheit to Celsius */
export function fToC(f: number): number {
  return Math.round(((f - 32) * 5) / 9);
}

/** Round temperature to nearest integer */
export function roundTemp(temp: number): number {
  return Math.round(temp);
}
