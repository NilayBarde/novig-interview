import { Sun } from 'lucide-react';

interface HeaderProps {
  /** IANA timezone of the selected location — when provided, "Today" reflects the location's calendar date */
  timeZone?: string;
}

export function Header({ timeZone }: HeaderProps) {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    ...(timeZone ? { timeZone } : {}),
  });

  return (
    <header className="relative overflow-hidden">
      {/* Warm gradient backdrop */}
      <div className="absolute inset-0 bg-gradient-to-br from-ember-50 via-sand-50 to-sky-50" />
      <div className="absolute top-0 right-0 w-64 h-64 bg-ember-200/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-sky-200/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 mt-1">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-ember-400 to-ember-500 flex items-center justify-center shadow-lg shadow-ember-500/20">
              <Sun className="w-5 h-5 sm:w-6 sm:h-6 text-white" strokeWidth={2.5} />
            </div>
          </div>
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
              <h1 className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl text-sand-900 tracking-tight leading-none">
                WeatherWeek
              </h1>
              <span className="text-xs font-medium text-sand-400 sm:text-right">
                Today — {today}
              </span>
            </div>
            <p className="mt-2 text-sand-500 text-sm sm:text-base font-medium max-w-md">
              Compare this week's forecast to next week — find the best day for your outdoor meetup.
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
