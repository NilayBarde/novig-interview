import { describe, it, expect } from 'vitest';
import { fToC, displayTemp } from '../utils/temperatureUtils';

describe('fToC', () => {
  it('converts freezing point', () => {
    expect(fToC(32)).toBe(0);
  });

  it('converts boiling point', () => {
    expect(fToC(212)).toBe(100);
  });

  it('converts 68°F to 20°C', () => {
    expect(fToC(68)).toBe(20);
  });
});

describe('displayTemp', () => {
  it('returns rounded Fahrenheit when unit is F', () => {
    expect(displayTemp(72.6, 'F')).toBe(73);
  });

  it('converts to Celsius when unit is C', () => {
    expect(displayTemp(68, 'C')).toBe(20);
  });

  it('rounds Celsius result', () => {
    expect(displayTemp(70, 'C')).toBe(21);
  });
});
