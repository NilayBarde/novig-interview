import { describe, it, expect } from 'vitest';
import {
  getTemperatureVerdict,
  getRainVerdict,
  getWindVerdict,
  getComparisonVerdict,
  getAllVerdicts,
  getOverallSeverity,
} from '../services/weatherMessages';
import type { WeatherSummary } from '../types/app';

describe('getTemperatureVerdict', () => {
  it('warns when cold (<50)', () => {
    expect(getTemperatureVerdict(45)).toEqual({ message: "Bundle up — it'll be cold", severity: 'warning' });
  });

  it('cautions when cool (50-59)', () => {
    expect(getTemperatureVerdict(55).severity).toBe('caution');
  });

  it('is good for nice temps (60-75)', () => {
    expect(getTemperatureVerdict(68).severity).toBe('good');
  });

  it('cautions when warm (76-85)', () => {
    expect(getTemperatureVerdict(80).severity).toBe('caution');
  });

  it('warns when hot (>85)', () => {
    expect(getTemperatureVerdict(95).severity).toBe('warning');
  });

  // Boundary tests
  it('returns caution at exactly 50°F', () => {
    expect(getTemperatureVerdict(50).severity).toBe('caution');
  });

  it('returns good at exactly 60°F', () => {
    expect(getTemperatureVerdict(60).severity).toBe('good');
  });

  it('returns good at exactly 75°F', () => {
    expect(getTemperatureVerdict(75).severity).toBe('good');
  });

  it('returns caution at exactly 85°F', () => {
    expect(getTemperatureVerdict(85).severity).toBe('caution');
  });
});

describe('getRainVerdict', () => {
  it('is good when low (<30%)', () => {
    expect(getRainVerdict(10).severity).toBe('good');
  });

  it('cautions for moderate (30-69%)', () => {
    expect(getRainVerdict(50).severity).toBe('caution');
  });

  it('warns for high (>=70%)', () => {
    expect(getRainVerdict(80).severity).toBe('warning');
  });

  it('returns good at exactly 29%', () => {
    expect(getRainVerdict(29).severity).toBe('good');
  });

  it('returns caution at exactly 30%', () => {
    expect(getRainVerdict(30).severity).toBe('caution');
  });

  it('returns warning at exactly 70%', () => {
    expect(getRainVerdict(70).severity).toBe('warning');
  });
});

describe('getWindVerdict', () => {
  it('is good when calm (<15)', () => {
    expect(getWindVerdict(10).severity).toBe('good');
  });

  it('cautions when breezy (15-24)', () => {
    expect(getWindVerdict(20).severity).toBe('caution');
  });

  it('warns when windy (>=25)', () => {
    expect(getWindVerdict(30).severity).toBe('warning');
  });
});

function makeSummary(overrides: Partial<WeatherSummary>): WeatherSummary {
  return {
    date: '2026-03-14',
    dayLabel: 'Sat, Mar 14',
    avgTemp: 68,
    highTemp: 72,
    lowTemp: 60,
    precipProb: 10,
    avgWindSpeed: 8,
    maxWindGust: 15,
    conditions: 'Clear',
    humidity: 50,
    hourlyTemps: [],
    hourlyPrecipProb: [],
    hourlyWindSpeed: [],
    ...overrides,
  };
}

describe('getComparisonVerdict', () => {
  it('returns "similar" when both weeks are equal', () => {
    const a = makeSummary({});
    const b = makeSummary({});
    expect(getComparisonVerdict(a, b).message).toContain('similar');
  });

  it('favors next week when it has better weather', () => {
    const thisWeek = makeSummary({ avgTemp: 95, precipProb: 80, avgWindSpeed: 30 });
    const nextWeek = makeSummary({ avgTemp: 68, precipProb: 10, avgWindSpeed: 8 });
    expect(getComparisonVerdict(thisWeek, nextWeek).message).toContain('Next week');
  });

  it('favors this week when it has better weather', () => {
    const thisWeek = makeSummary({ avgTemp: 68, precipProb: 10, avgWindSpeed: 8 });
    const nextWeek = makeSummary({ avgTemp: 95, precipProb: 80, avgWindSpeed: 30 });
    expect(getComparisonVerdict(thisWeek, nextWeek).message).toContain('This week');
  });
});

describe('getAllVerdicts', () => {
  it('returns 3 verdicts (temp, rain, wind)', () => {
    const summary = makeSummary({});
    expect(getAllVerdicts(summary)).toHaveLength(3);
  });
});

describe('getOverallSeverity', () => {
  it('returns warning if any verdict is warning', () => {
    const verdicts = [
      { message: 'ok', severity: 'good' as const },
      { message: 'bad', severity: 'warning' as const },
    ];
    expect(getOverallSeverity(verdicts)).toBe('warning');
  });

  it('returns caution if any verdict is caution and none are warning', () => {
    const verdicts = [
      { message: 'ok', severity: 'good' as const },
      { message: 'meh', severity: 'caution' as const },
    ];
    expect(getOverallSeverity(verdicts)).toBe('caution');
  });

  it('returns good if all verdicts are good', () => {
    const verdicts = [
      { message: 'ok', severity: 'good' as const },
      { message: 'ok', severity: 'good' as const },
    ];
    expect(getOverallSeverity(verdicts)).toBe('good');
  });
});
