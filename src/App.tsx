import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { EventConfigProvider, useEventConfig } from './context/EventConfigContext';
import { useWeatherForecast } from './hooks/useWeatherForecast';
import { Header } from './components/layout/Header';
import { PageContainer } from './components/layout/PageContainer';
import { LocationInput } from './components/controls/LocationInput';
import { DaySelector } from './components/controls/DaySelector';
import { TimeRangeSelector } from './components/controls/TimeRangeSelector';
import { TempUnitToggle } from './components/controls/TempUnitToggle';
import { WindUnitToggle } from './components/controls/WindUnitToggle';
import { WeatherComparison } from './components/weather/WeatherComparison';
import { LoadingState } from './components/common/LoadingState';
import { ErrorState } from './components/common/ErrorState';
import { CloudSun } from 'lucide-react';

const queryClient = new QueryClient();

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
  const { comparison, timeZone, isLoading, isFetching, error, refetch } = useWeatherForecast(
    config.location,
    config.day,
    config.timeRange
  );

  // Derive a display city from the IANA timezone (e.g. "America/Los_Angeles" → "Los Angeles").
  // More reliable than parsing resolvedAddress for international locations.
  const locationCity = timeZone
    ? timeZone.split('/').pop()?.replace(/_/g, ' ') ?? timeZone
    : null;
  const locationDate = timeZone
    ? new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', timeZone })
    : null;

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
              resolvedAddress={comparison?.resolvedAddress}
              isLoading={isFetching}
            />
            {locationCity && locationDate && comparison && (
              <p className="text-xs text-sand-500">
                {`${locationCity} — ${locationDate}`}
              </p>
            )}
            <div className="flex flex-wrap items-end gap-5">
              <DaySelector selectedDay={config.day} onDayChange={setDay} />
              <TimeRangeSelector selectedRange={config.timeRange} onRangeChange={setTimeRange} />
              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-widest text-sand-500">
                  Units
                </label>
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
          ) : comparison ? (
            <WeatherComparison comparison={comparison} tempUnit={config.tempUnit} windUnit={config.windUnit} />
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
      <p className="font-[family-name:var(--font-display)] text-xl text-sand-700 mb-2">
        Where's the meetup?
      </p>
      <p className="text-sand-400 text-sm max-w-xs mx-auto">
        Enter a location above to compare this week's weather with next week's forecast.
      </p>
    </div>
  );
}

export default App;
