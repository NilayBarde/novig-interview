/**
 * Pure functions that map weather data to human-friendly verdicts.
 *
 * Each verdict carries a severity level (`good` / `caution` / `warning`)
 * so the UI can color-code messages for at-a-glance readability.
 *
 * All threshold constants are defined in `config/constants.ts`.
 */

import { TEMP_THRESHOLDS, PRECIP_THRESHOLDS, WIND_THRESHOLDS } from '../config/constants';
import type { WeatherVerdict, WeatherSummary, Severity } from '../types/app';

/**
 * Classify the average temperature into a comfort verdict.
 * Thresholds: <50 cold, 50–59 cool, 60–75 nice, 76–85 warm, >85 hot.
 */
export function getTemperatureVerdict(avgTemp: number): WeatherVerdict {
  if (avgTemp < TEMP_THRESHOLDS.COLD) {
    return { message: 'Very cold', severity: 'warning' };
  }
  if (avgTemp < TEMP_THRESHOLDS.COOL) {
    return { message: 'Cool', severity: 'caution' };
  }
  if (avgTemp <= TEMP_THRESHOLDS.NICE_MAX) {
    return { message: 'Comfortable', severity: 'good' };
  }
  if (avgTemp <= TEMP_THRESHOLDS.WARM_MAX) {
    return { message: 'Warm', severity: 'caution' };
  }
  return { message: 'Very hot', severity: 'warning' };
}

/**
 * Classify precipitation likelihood into an action-oriented verdict.
 *
 * Uses `precipprob` (model-computed precipitation probability) rather
 * than raw humidity. Humidity of 25–75% does not reliably indicate rain;
 * precipprob is the actual chance of measurable precipitation.
 */
export function getRainVerdict(precipProb: number): WeatherVerdict {
  if (precipProb < PRECIP_THRESHOLDS.LOW) {
    return { message: 'No rain expected', severity: 'good' };
  }
  if (precipProb < PRECIP_THRESHOLDS.HIGH) {
    return { message: 'Some chance of rain', severity: 'caution' };
  }
  return { message: 'Rain likely', severity: 'warning' };
}

/** Classify wind conditions for outdoor comfort */
export function getWindVerdict(windSpeed: number): WeatherVerdict {
  if (windSpeed < WIND_THRESHOLDS.BREEZY) {
    return { message: 'Calm winds', severity: 'good' };
  }
  if (windSpeed < WIND_THRESHOLDS.WINDY) {
    return { message: 'Breezy', severity: 'caution' };
  }
  return { message: 'Very windy', severity: 'warning' };
}

/** Get all three verdicts (temperature, rain, wind) for a day's weather */
export function getAllVerdicts(summary: WeatherSummary): WeatherVerdict[] {
  return [
    getTemperatureVerdict(summary.avgTemp),
    getRainVerdict(summary.precipProb),
    getWindVerdict(summary.avgWindSpeed),
  ];
}

/**
 * Build a single actionable recommendation for the event organizer.
 *
 * - good:    "All good — enjoy the event" (no detail needed)
 * - caution: "Go ahead — [what to bring/prepare]"
 * - warning: "Consider rescheduling — [why]"
 */
export function getRecommendation(summary: WeatherSummary): string {
  const severity = getOverallSeverity(getAllVerdicts(summary));

  if (severity === 'good') return 'All good — enjoy the event';

  if (severity === 'caution') {
    const preps = getCautionPreps(summary);
    return preps.length > 0 ? `Go ahead — ${joinList(preps)}` : 'Go ahead — come prepared';
  }

  // warning
  const reasons = getWarningReasons(summary);
  return reasons.length > 0 ? `Consider rescheduling — ${joinList(reasons)}` : 'Consider rescheduling';
}

/** Return the worst severity found among a list of verdicts */
export function getOverallSeverity(verdicts: WeatherVerdict[]): Severity {
  if (verdicts.some((v) => v.severity === 'warning')) return 'warning';
  if (verdicts.some((v) => v.severity === 'caution')) return 'caution';
  return 'good';
}

/** What to bring/do for a caution-level forecast */
function getCautionPreps(summary: WeatherSummary): string[] {
  const preps: string[] = [];
  const tempVerdict = getTemperatureVerdict(summary.avgTemp);
  if (tempVerdict.severity !== 'good') {
    preps.push(summary.avgTemp < TEMP_THRESHOLDS.NICE_MAX ? 'bring layers' : 'bring water');
  }
  if (getRainVerdict(summary.precipProb).severity !== 'good') preps.push('pack rain gear');
  if (getWindVerdict(summary.avgWindSpeed).severity !== 'good') preps.push('secure loose items');
  return preps;
}

/** Why a warning-level forecast warrants rescheduling */
function getWarningReasons(summary: WeatherSummary): string[] {
  const reasons: string[] = [];
  if (getTemperatureVerdict(summary.avgTemp).severity === 'warning') {
    reasons.push(summary.avgTemp < TEMP_THRESHOLDS.COLD ? 'extreme cold' : 'extreme heat');
  }
  if (getRainVerdict(summary.precipProb).severity === 'warning') reasons.push('heavy rain likely');
  if (getWindVerdict(summary.avgWindSpeed).severity === 'warning') reasons.push('dangerous winds');
  return reasons;
}

function joinList(items: string[]): string {
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`;
}
