/**
 * Global UI state for the event configuration controls.
 *
 * Server state (weather data) is managed by React Query in `useWeatherForecast`.
 * This context only holds user-selected settings: location, day, time range,
 * and temperature display unit.
 */

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { DAYS_OF_WEEK, TIME_RANGES } from '../config/constants';
import type { DayOfWeek, TimeRange, TempUnit } from '../config/constants';
import type { EventConfig } from '../types/app';

interface EventConfigContextValue {
  config: EventConfig;
  setLocation: (location: string) => void;
  setDay: (day: DayOfWeek) => void;
  setTimeRange: (timeRange: TimeRange) => void;
  setTempUnit: (unit: TempUnit) => void;
}

const EventConfigContext = createContext<EventConfigContextValue | null>(null);

const defaultConfig: EventConfig = {
  location: '',
  day: DAYS_OF_WEEK[6], // Saturday
  timeRange: TIME_RANGES[1], // Afternoon
  tempUnit: 'F',
};

export function EventConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<EventConfig>(defaultConfig);

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

  return (
    <EventConfigContext.Provider value={{ config, setLocation, setDay, setTimeRange, setTempUnit }}>
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
