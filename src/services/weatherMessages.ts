/**
 * Pure functions that map weather data to human-friendly verdicts.
 *
 * Each verdict carries a severity level (`good` / `caution` / `warning`)
 * so the UI can color-code messages for at-a-glance readability.
 *
 * All threshold constants are defined in `config/constants.ts`.
 */

import { TEMP_THRESHOLDS, PRECIP_THRESHOLDS, WIND_THRESHOLDS, COMPARISON_THRESHOLDS } from '../config/constants';
import type { WeatherVerdict, WeatherSummary, Severity } from '../types/app';

/**
 * Classify the average temperature into a comfort verdict.
 * Thresholds: <50 cold, 50–59 cool, 60–75 nice, 76–85 warm, >85 hot.
 */
export function getTemperatureVerdict(avgTemp: number): WeatherVerdict {
  if (avgTemp < TEMP_THRESHOLDS.COLD) {
    return { message: 'Bundle up — it\'ll be cold', severity: 'warning' };
  }
  if (avgTemp < TEMP_THRESHOLDS.COOL) {
    return { message: 'Cool weather — bring a layer', severity: 'caution' };
  }
  if (avgTemp <= TEMP_THRESHOLDS.NICE_MAX) {
    return { message: 'Nice temperature for being outside', severity: 'good' };
  }
  if (avgTemp <= TEMP_THRESHOLDS.WARM_MAX) {
    return { message: 'Warm — stay hydrated', severity: 'caution' };
  }
  return { message: 'Hot — consider shade and water', severity: 'warning' };
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
    return { message: 'Chance of rain — pack accordingly', severity: 'caution' };
  }
  return { message: 'Rain likely — bring gear or consider rescheduling', severity: 'warning' };
}

/** Classify wind conditions for outdoor comfort */
export function getWindVerdict(windSpeed: number): WeatherVerdict {
  if (windSpeed < WIND_THRESHOLDS.BREEZY) {
    return { message: 'Calm winds', severity: 'good' };
  }
  if (windSpeed < WIND_THRESHOLDS.WINDY) {
    return { message: 'Breezy — secure loose items', severity: 'caution' };
  }
  return { message: 'Very windy — outdoor activities may be difficult', severity: 'warning' };
}

/**
 * Compare two weeks and produce a recommendation verdict.
 * Uses a simple 0–5 scoring heuristic that weights temperature comfort,
 * precipitation risk, and wind speed equally.
 */
export function getComparisonVerdict(
  thisWeek: WeatherSummary,
  nextWeek: WeatherSummary
): WeatherVerdict {
  const thisScore = computeWeatherScore(thisWeek);
  const nextScore = computeWeatherScore(nextWeek);
  const diff = nextScore - thisScore;

  if (diff > COMPARISON_THRESHOLDS.SIGNIFICANT) {
    return { message: 'Next week looks significantly better', severity: 'good' };
  }
  if (diff > COMPARISON_THRESHOLDS.SLIGHT) {
    return { message: 'Next week looks a bit better', severity: 'good' };
  }
  if (diff < -COMPARISON_THRESHOLDS.SIGNIFICANT) {
    return { message: 'This week is significantly better', severity: 'warning' };
  }
  if (diff < -COMPARISON_THRESHOLDS.SLIGHT) {
    return { message: 'This week looks a bit better', severity: 'caution' };
  }
  // Weeks are similar — derive severity from the actual individual verdicts
  // (same logic the cards use) so the banner is consistent with what the
  // organizer is already reading. If either week has a 'warning' verdict
  // (e.g. 100% rain chance), the banner should not be green.
  const combinedSeverity = getOverallSeverity([
    ...getAllVerdicts(thisWeek),
    ...getAllVerdicts(nextWeek),
  ]);
  return { message: 'Both weeks look similar', severity: combinedSeverity };
}

/**
 * Score a day's weather from 0 (worst) to 7 (best) for outdoor suitability.
 *
 * Precipitation is weighted highest because rain is the primary cancellation
 * reason for outdoor meetups — per the user story. A temperature improvement
 * alone should not be able to fully offset a significantly worse rain outlook.
 *
 * Scoring breakdown (thresholds from constants.ts):
 * - Temperature: +2 if COOL–NICE_MAX (ideal), +1 if COLD–WARM_MAX (tolerable)
 * - Precipitation: +3 if <LOW (no rain), +2 if <HIGH (chance of rain)
 * - Wind: +1 if <BREEZY
 */
function computeWeatherScore(summary: WeatherSummary): number {
  let score = 0;

  if (summary.avgTemp >= TEMP_THRESHOLDS.COOL && summary.avgTemp <= TEMP_THRESHOLDS.NICE_MAX) score += 2;
  else if (summary.avgTemp >= TEMP_THRESHOLDS.COLD && summary.avgTemp <= TEMP_THRESHOLDS.WARM_MAX) score += 1;

  if (summary.precipProb < PRECIP_THRESHOLDS.LOW) score += 3;
  else if (summary.precipProb < PRECIP_THRESHOLDS.HIGH) score += 2;

  if (summary.avgWindSpeed < WIND_THRESHOLDS.BREEZY) score += 1;

  return score;
}

/** Get all three verdicts (temperature, rain, wind) for a day's weather */
export function getAllVerdicts(summary: WeatherSummary): WeatherVerdict[] {
  return [
    getTemperatureVerdict(summary.avgTemp),
    getRainVerdict(summary.precipProb),
    getWindVerdict(summary.avgWindSpeed),
  ];
}

/** Return the worst severity found among a list of verdicts */
export function getOverallSeverity(verdicts: WeatherVerdict[]): Severity {
  if (verdicts.some((v) => v.severity === 'warning')) return 'warning';
  if (verdicts.some((v) => v.severity === 'caution')) return 'caution';
  return 'good';
}
