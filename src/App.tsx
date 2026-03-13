import { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { EventConfigProvider, useEventConfig } from './context/EventConfigContext';
import { useMultiWeekForecasts } from './hooks/useMultiWeekForecasts';
import { Header } from './components/layout/Header';
import { PageContainer } from './components/layout/PageContainer';
import { LocationInput } from './components/controls/LocationInput';
import { DaySelector } from './components/controls/DaySelector';
import { TimeRangeSelector } from './components/controls/TimeRangeSelector';
import { TempUnitToggle } from './components/controls/TempUnitToggle';
import { WindUnitToggle } from './components/controls/WindUnitToggle';
import { WeatherWeekView } from './components/weather/WeatherWeekView';
import { LoadingState } from './components/common/LoadingState';
import { ErrorState } from './components/common/ErrorState';
import { CloudSun } from 'lucide-react';
import { displayTemp, displayWindSpeed } from './utils/temperatureUtils';

const queryClient = new QueryClient();

/** Snap a value down/up to the nearest multiple of `step` for clean chart ticks */
const snapDown = (v: number, step = 5) => Math.floor(v / step) * step;
const snapUp = (v: number, step = 5) => Math.ceil(v / step) * step;

/** Safe min/max via reduce — avoids RangeError from spread on large arrays */
const safeMin = (arr: number[]) => arr.reduce((a, b) => Math.min(a, b), Infinity);
const safeMax = (arr: number[]) => arr.reduce((a, b) => Math.max(a, b), -Infinity);

function weekLabel(offset: number): string {
  if (offset === 0) return 'This Week';
  if (offset === 1) return 'Next Week';
  return `In ${offset} Weeks`;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <EventConfigProvider>
        <div className="min-h-screen">
          <WeatherDashboard />
        </div>
      </EventConfigProvider>
    </QueryClientProvider>
  );
}

function WeatherDashboard() {
  const { config, setLocation, setDay, setTimeRange, setTempUnit, setWindUnit } = useEventConfig();
  const [activeTab, setActiveTab] = useState(0);

  // Reset to first tab whenever the user picks a different location or day,
  // so a stale activeTab=1 never leaves the content area blank.
  useEffect(() => {
    setActiveTab(0);
  }, [config.location, config.day]);

  const { weeks, resolvedAddress, timeZone, isLoading, isFetching, error, refetch } = useMultiWeekForecasts(
    config.location,
    config.day,
    config.timeRange,
    2,
  );

  // Derive a display city from the IANA timezone (e.g. "America/Los_Angeles" → "Los Angeles").
  const locationCity = timeZone
    ? timeZone.split('/').pop()?.replace(/_/g, ' ') ?? timeZone
    : null;
  const locationDate = timeZone
    ? new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', timeZone })
    : null;

  const visibleWeeks = weeks.filter((w) => w.summary !== null);
  const hasAnyForecast = visibleWeeks.length > 0;

  // Compute shared y-axis domains across all visible weeks so charts use the
  // same scale — a mismatched scale makes weeks look more (or less) different
  // than they actually are. Convert to display units first so the domain matches
  // the values Recharts actually plots (raw storage is °F / mph).
  const allDisplayTemps = visibleWeeks.flatMap(
    (w) => w.summary?.hourlyTemps.map((h) => displayTemp(h.temp, config.tempUnit)) ?? [],
  );
  const allDisplayWinds = visibleWeeks.flatMap(
    (w) => w.summary?.hourlyWindSpeed.map((h) => displayWindSpeed(h.windSpeed, config.windUnit)) ?? [],
  );
  const tempDomain: [number, number] | undefined =
    allDisplayTemps.length > 0
      ? [snapDown(safeMin(allDisplayTemps)), snapUp(safeMax(allDisplayTemps))]
      : undefined;
  const windDomain: [number, number] | undefined =
    allDisplayWinds.length > 0
      ? [
          Math.max(0, snapDown(safeMin(allDisplayWinds))), // clamp at 0 — negative wind speed is meaningless
          snapUp(safeMax(allDisplayWinds)),
        ]
      : undefined;

  return (
    <>
      <Header />
      <PageContainer>
        <div className="space-y-6 sm:space-y-8">
          {/* Controls */}
          <div className="glass-warm rounded-2xl p-5 sm:p-6 shadow-lg shadow-sand-300/20 animate-fade-up space-y-5 relative z-10">
            <LocationInput
              onLocationChange={setLocation}
              initialValue={config.location}
              resolvedAddress={resolvedAddress ?? undefined}
              isLoading={isFetching}
            />
            {locationCity && locationDate && hasAnyForecast && (
              <p className="text-xs text-sand-500">{`${locationCity} — ${locationDate}`}</p>
            )}
            <div className="flex flex-wrap items-end gap-5">
              <DaySelector selectedDay={config.day} onDayChange={setDay} />
              <TimeRangeSelector selectedRange={config.timeRange} onRangeChange={setTimeRange} />
              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-widest text-sand-500">Units</label>
                <div className="flex items-center gap-2">
                  <TempUnitToggle unit={config.tempUnit} onChange={setTempUnit} />
                  <WindUnitToggle unit={config.windUnit} onChange={setWindUnit} />
                </div>
              </div>
            </div>
          </div>

          {/* Content area */}
          {error ? (
            <ErrorState error={error} onRetry={refetch} />
          ) : isLoading && config.location ? (
            <LoadingState />
          ) : hasAnyForecast ? (
            /* Mobile: one card at a time with prev/next arrows in the heading.
               Desktop: side-by-side grid, arrows hidden via md:hidden inside WeatherWeekView. */
            <div className={`${visibleWeeks.length > 1 ? 'md:grid md:grid-cols-2' : ''} gap-4 animate-fade-up`}>
              {visibleWeeks.map(({ offset, summary }, i) => (
                // activeTab tracks array index (i), not offset, so filtering
                // never causes a mismatch when the first week has no data.
                <div key={offset} className={activeTab !== i ? 'hidden md:block' : ''}>
                  <WeatherWeekView
                    label={weekLabel(offset)}
                    forecast={summary!}
                    tempUnit={config.tempUnit}
                    windUnit={config.windUnit}
                    tempDomain={tempDomain}
                    windDomain={windDomain}
                    onPrev={() => setActiveTab(i - 1)}
                    onNext={() => setActiveTab(i + 1)}
                    canGoPrev={i > 0}
                    canGoNext={i < visibleWeeks.length - 1}
                  />
                </div>
              ))}
            </div>
          ) : (
            <EmptyState />
          )}
        </div>
      </PageContainer>
    </>
  );
}

function EmptyState() {
  return (
    <div className="glass-warm rounded-2xl p-12 sm:p-16 text-center shadow-lg shadow-sand-300/20 animate-fade-up">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-br from-ember-100 to-sky-100 mb-5">
        <CloudSun className="w-8 h-8 text-ember-400" strokeWidth={1.5} />
      </div>
      <p className="font-[family-name:var(--font-display)] text-xl text-sand-700 mb-2">Where's the meetup?</p>
      <p className="text-sand-400 text-sm max-w-xs mx-auto">
        Enter a location above to see the weather forecast for your recurring event day.
      </p>
    </div>
  );
}

export default App;
