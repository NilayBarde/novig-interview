/**
 * Global UI state for the event configuration controls.
 *
 * Server state (weather data) is managed by React Query in `useMultiWeekForecasts`.
 * This context only holds user-selected settings: location, day, time range,
 * and temperature display unit.
 *
 * All preferences are persisted to localStorage so they survive page refreshes.
 */

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { DAYS_OF_WEEK, TIME_RANGES } from '../config/constants';
import type { DayOfWeek, TimeRange, TempUnit, WindUnit } from '../config/constants';
import type { EventConfig } from '../types/app';

interface EventConfigContextValue {
  config: EventConfig;
  setLocation: (location: string) => void;
  setDay: (day: DayOfWeek) => void;
  setTimeRange: (timeRange: TimeRange) => void;
  setTempUnit: (unit: TempUnit) => void;
  setWindUnit: (unit: WindUnit) => void;
}

const EventConfigContext = createContext<EventConfigContextValue | null>(null);

const STORAGE_KEY = 'weatherweek-config';

const defaultConfig: EventConfig = {
  location: '',
  day: DAYS_OF_WEEK[6], // Saturday
  timeRange: TIME_RANGES[1], // Afternoon
  tempUnit: 'F',
  windUnit: 'mph',
};

/** Load persisted config from localStorage, falling back to defaults */
function loadConfig(): EventConfig {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return defaultConfig;
    const parsed = JSON.parse(stored);
    return {
      location: typeof parsed.location === 'string' ? parsed.location : defaultConfig.location,
      day: DAYS_OF_WEEK.includes(parsed.day) ? parsed.day : defaultConfig.day,
      timeRange: TIME_RANGES.find((r) => r.label === parsed.timeRange?.label) ?? defaultConfig.timeRange,
      tempUnit: parsed.tempUnit === 'C' || parsed.tempUnit === 'F' ? parsed.tempUnit : defaultConfig.tempUnit,
      windUnit: parsed.windUnit === 'mph' || parsed.windUnit === 'kmh' ? parsed.windUnit : defaultConfig.windUnit,
    };
  } catch {
    return defaultConfig;
  }
}

export function EventConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<EventConfig>(loadConfig);

  // Persist to localStorage whenever config changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  }, [config]);

  const setLocation = useCallback((location: string) => {
    setConfig((prev) => ({ ...prev, location }));
  }, []);

  const setDay = useCallback((day: DayOfWeek) => {
    setConfig((prev) => ({ ...prev, day }));
  }, []);

  const setTimeRange = useCallback((timeRange: TimeRange) => {
    setConfig((prev) => ({ ...prev, timeRange }));
  }, []);

  const setTempUnit = useCallback((tempUnit: TempUnit) => {
    setConfig((prev) => ({ ...prev, tempUnit }));
  }, []);

  const setWindUnit = useCallback((windUnit: WindUnit) => {
    setConfig((prev) => ({ ...prev, windUnit }));
  }, []);

  return (
    <EventConfigContext.Provider value={{ config, setLocation, setDay, setTimeRange, setTempUnit, setWindUnit }}>
      {children}
    </EventConfigContext.Provider>
  );
}

/** Access the event config context. Must be used within {@link EventConfigProvider}. */
export function useEventConfig(): EventConfigContextValue {
  const ctx = useContext(EventConfigContext);
  if (!ctx) throw new Error('useEventConfig must be used within EventConfigProvider');
  return ctx;
}
