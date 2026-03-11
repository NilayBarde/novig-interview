import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { DAYS_OF_WEEK, TIME_RANGES } from '../config/constants';
import type { DayOfWeek, TimeRange } from '../config/constants';
import type { EventConfig } from '../types/app';

interface EventConfigContextValue {
  config: EventConfig;
  setLocation: (location: string) => void;
  setDay: (day: DayOfWeek) => void;
  setTimeRange: (timeRange: TimeRange) => void;
}

const EventConfigContext = createContext<EventConfigContextValue | null>(null);

const defaultConfig: EventConfig = {
  location: '',
  day: DAYS_OF_WEEK[6], // Saturday
  timeRange: TIME_RANGES[1], // Afternoon
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

  return (
    <EventConfigContext.Provider value={{ config, setLocation, setDay, setTimeRange }}>
      {children}
    </EventConfigContext.Provider>
  );
}

export function useEventConfig(): EventConfigContextValue {
  const ctx = useContext(EventConfigContext);
  if (!ctx) throw new Error('useEventConfig must be used within EventConfigProvider');
  return ctx;
}
