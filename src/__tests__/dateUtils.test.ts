import { describe, it, expect, vi, afterEach } from 'vitest';
import { getNextDayOfWeek, getFollowingWeekDay, formatDate, getTodayFormatted, getCurrentHourInTimeZone, isTimeWindowPast } from '../utils/dateUtils';

describe('getNextDayOfWeek', () => {
  it('returns today when today IS the target day', () => {
    // Wednesday, March 11, 2026
    const wednesday = new Date(2026, 2, 11);
    const result = getNextDayOfWeek('Wednesday', undefined, wednesday);
    expect(formatDate(result)).toBe('2026-03-11');
  });

  it('returns the next occurrence when target is later this week', () => {
    // Wednesday March 11 → Saturday March 14
    const wednesday = new Date(2026, 2, 11);
    const result = getNextDayOfWeek('Saturday', undefined, wednesday);
    expect(formatDate(result)).toBe('2026-03-14');
  });

  it('wraps to next week when target day has passed', () => {
    // Wednesday March 11 → Monday March 16
    const wednesday = new Date(2026, 2, 11);
    const result = getNextDayOfWeek('Monday', undefined, wednesday);
    expect(formatDate(result)).toBe('2026-03-16');
  });

  it('handles Sunday (index 0) correctly from Saturday', () => {
    // Saturday March 14 → Sunday March 15
    const saturday = new Date(2026, 2, 14);
    const result = getNextDayOfWeek('Sunday', undefined, saturday);
    expect(formatDate(result)).toBe('2026-03-15');
  });

  it('uses target timezone weekday near DST boundary (America/New_York)', () => {
    // 2026-03-08 is the DST transition date in New York.
    // This UTC instant is still Saturday evening in New York (Mar 7).
    const from = new Date('2026-03-08T01:30:00.000Z');
    const result = getNextDayOfWeek('Saturday', 'America/New_York', from);
    expect(formatDate(result)).toBe('2026-03-07');
  });
});

describe('getFollowingWeekDay', () => {
  it('returns 7 days after the next occurrence', () => {
    const wednesday = new Date(2026, 2, 11);
    const result = getFollowingWeekDay('Saturday', undefined, wednesday);
    // Next Saturday = March 14, following = March 21
    expect(formatDate(result)).toBe('2026-03-21');
  });

  it('handles when today is the target day', () => {
    const wednesday = new Date(2026, 2, 11);
    const result = getFollowingWeekDay('Wednesday', undefined, wednesday);
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

describe('getTodayFormatted', () => {
  afterEach(() => vi.useRealTimers());

  it('returns local date as YYYY-MM-DD when no timezone given', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 2, 11, 10, 0, 0)); // Wed Mar 11 2026
    expect(getTodayFormatted()).toBe('2026-03-11');
  });

  it('returns timezone-aware date for America/Los_Angeles', () => {
    // 2026-03-12 01:00 UTC = 2026-03-11 18:00 PST (UTC-7 in March post-DST)
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-12T01:00:00.000Z'));
    const result = getTodayFormatted('America/Los_Angeles');
    expect(result).toBe('2026-03-11');
  });
});

describe('getCurrentHourInTimeZone', () => {
  it('returns local hour when no timezone given', () => {
    const now = new Date(2026, 2, 11, 14, 30, 0); // 2:30 PM local
    expect(getCurrentHourInTimeZone(undefined, now)).toBe(14);
  });

  it('returns correct hour for a given timezone', () => {
    // 2026-03-12 18:00 UTC = 2026-03-12 11:00 in America/Los_Angeles (PDT, UTC-7)
    const now = new Date('2026-03-12T18:00:00.000Z');
    expect(getCurrentHourInTimeZone('America/Los_Angeles', now)).toBe(11);
  });
});

describe('isTimeWindowPast', () => {
  it('returns false when current hour is before endHour', () => {
    const now = new Date(2026, 2, 11, 10, 0, 0); // 10 AM
    expect(isTimeWindowPast(12, undefined, now)).toBe(false); // Morning ends at 12
  });

  it('returns true when current hour equals endHour (>= boundary)', () => {
    const now = new Date(2026, 2, 11, 21, 0, 0); // exactly 9 PM
    expect(isTimeWindowPast(21, undefined, now)).toBe(true); // Evening ends at 21
  });

  it('returns true when current hour is past endHour', () => {
    const now = new Date(2026, 2, 11, 22, 0, 0); // 10 PM
    expect(isTimeWindowPast(21, undefined, now)).toBe(true);
  });

  it('correctly uses timezone when provided', () => {
    // 2026-03-12 18:00 UTC = 11:00 AM in America/Los_Angeles
    const now = new Date('2026-03-12T18:00:00.000Z');
    // endHour=12 (noon): 11 AM < 12, so window not past
    expect(isTimeWindowPast(12, 'America/Los_Angeles', now)).toBe(false);
    // endHour=11: 11 AM >= 11, so window is past
    expect(isTimeWindowPast(11, 'America/Los_Angeles', now)).toBe(true);
  });
});
