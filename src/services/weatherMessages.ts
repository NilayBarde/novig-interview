import { TEMP_THRESHOLDS, PRECIP_THRESHOLDS, WIND_THRESHOLDS } from '../config/constants';
import type { WeatherVerdict, WeatherSummary, Severity } from '../types/app';

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
 * Uses precipprob (precipitation probability) rather than raw humidity.
 * Humidity 25-75% doesn't reliably indicate rain — precipprob is the
 * model-computed chance of measurable precipitation.
 */
export function getRainVerdict(precipProb: number): WeatherVerdict {
  if (precipProb < PRECIP_THRESHOLDS.LOW) {
    return { message: 'No rain expected', severity: 'good' };
  }
  if (precipProb < PRECIP_THRESHOLDS.HIGH) {
    return { message: 'Chance of rain — have a backup plan', severity: 'caution' };
  }
  return { message: 'Rain likely — consider rescheduling', severity: 'warning' };
}

export function getWindVerdict(windSpeed: number): WeatherVerdict {
  if (windSpeed < WIND_THRESHOLDS.BREEZY) {
    return { message: 'Calm winds', severity: 'good' };
  }
  if (windSpeed < WIND_THRESHOLDS.WINDY) {
    return { message: 'Breezy — secure loose items', severity: 'caution' };
  }
  return { message: 'Very windy — outdoor activities may be difficult', severity: 'warning' };
}

export function getComparisonVerdict(
  thisWeek: WeatherSummary,
  nextWeek: WeatherSummary
): WeatherVerdict {
  const thisScore = computeWeatherScore(thisWeek);
  const nextScore = computeWeatherScore(nextWeek);
  const diff = nextScore - thisScore;

  if (diff > 1.5) {
    return { message: 'Next week looks significantly better', severity: 'good' };
  }
  if (diff > 0.5) {
    return { message: 'Next week looks a bit better', severity: 'good' };
  }
  if (diff < -1.5) {
    return { message: 'This week is significantly better', severity: 'warning' };
  }
  if (diff < -0.5) {
    return { message: 'This week looks a bit better', severity: 'caution' };
  }
  return { message: 'Both weeks look similar', severity: 'good' };
}

/**
 * Score from 0 (worst) to 5 (best).
 * Higher = more favorable for outdoor activities.
 */
function computeWeatherScore(summary: WeatherSummary): number {
  let score = 0;

  // Temperature: ideal 60-75
  if (summary.avgTemp >= 60 && summary.avgTemp <= 75) score += 2;
  else if (summary.avgTemp >= 50 && summary.avgTemp <= 85) score += 1;

  // Precip: lower is better
  if (summary.precipProb < 30) score += 2;
  else if (summary.precipProb < 70) score += 1;

  // Wind: calmer is better
  if (summary.avgWindSpeed < 15) score += 1;

  return score;
}

export function getAllVerdicts(summary: WeatherSummary): WeatherVerdict[] {
  return [
    getTemperatureVerdict(summary.avgTemp),
    getRainVerdict(summary.precipProb),
    getWindVerdict(summary.avgWindSpeed),
  ];
}

export function getOverallSeverity(verdicts: WeatherVerdict[]): Severity {
  if (verdicts.some((v) => v.severity === 'warning')) return 'warning';
  if (verdicts.some((v) => v.severity === 'caution')) return 'caution';
  return 'good';
}
