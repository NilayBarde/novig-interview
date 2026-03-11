import { describe, it, expect } from 'vitest';
import { getNextDayOfWeek, getFollowingWeekDay, formatDate } from '../utils/dateUtils';

describe('getNextDayOfWeek', () => {
  it('returns today when today IS the target day', () => {
    // Wednesday, March 11, 2026
    const wednesday = new Date(2026, 2, 11);
    const result = getNextDayOfWeek('Wednesday', wednesday);
    expect(formatDate(result)).toBe('2026-03-11');
  });

  it('returns the next occurrence when target is later this week', () => {
    // Wednesday March 11 → Saturday March 14
    const wednesday = new Date(2026, 2, 11);
    const result = getNextDayOfWeek('Saturday', wednesday);
    expect(formatDate(result)).toBe('2026-03-14');
  });

  it('wraps to next week when target day has passed', () => {
    // Wednesday March 11 → Monday March 16
    const wednesday = new Date(2026, 2, 11);
    const result = getNextDayOfWeek('Monday', wednesday);
    expect(formatDate(result)).toBe('2026-03-16');
  });

  it('handles Sunday (index 0) correctly from Saturday', () => {
    // Saturday March 14 → Sunday March 15
    const saturday = new Date(2026, 2, 14);
    const result = getNextDayOfWeek('Sunday', saturday);
    expect(formatDate(result)).toBe('2026-03-15');
  });
});

describe('getFollowingWeekDay', () => {
  it('returns 7 days after the next occurrence', () => {
    const wednesday = new Date(2026, 2, 11);
    const result = getFollowingWeekDay('Saturday', wednesday);
    // Next Saturday = March 14, following = March 21
    expect(formatDate(result)).toBe('2026-03-21');
  });

  it('handles when today is the target day', () => {
    const wednesday = new Date(2026, 2, 11);
    const result = getFollowingWeekDay('Wednesday', wednesday);
    // Next Wednesday = March 11 (today), following = March 18
    expect(formatDate(result)).toBe('2026-03-18');
  });
});

describe('formatDate', () => {
  it('formats with zero-padded month and day', () => {
    expect(formatDate(new Date(2026, 0, 5))).toBe('2026-01-05');
  });

  it('formats double-digit month and day', () => {
    expect(formatDate(new Date(2026, 11, 25))).toBe('2026-12-25');
  });
});
