import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { WeatherSummary } from '../../types/app';
import type { TempUnit, WindUnit } from '../../config/constants';
import { RecommendationBanner } from './RecommendationBanner';
import { WeatherCard } from './WeatherCard';
import { WeatherChart } from './WeatherChart';

interface WeatherWeekViewProps {
  forecast: WeatherSummary;
  weekOffset: number;
  availableWeeks: number;
  onPrev: () => void;
  onNext: () => void;
  tempUnit: TempUnit;
  windUnit: WindUnit;
}

function weekLabel(offset: number): string {
  if (offset === 0) return 'This Week';
  if (offset === 1) return 'Next Week';
  return `In ${offset} Weeks`;
}

export function WeatherWeekView({
  forecast,
  weekOffset,
  availableWeeks,
  onPrev,
  onNext,
  tempUnit,
  windUnit,
}: WeatherWeekViewProps) {
  const isPrevDisabled = weekOffset === 0;
  const isNextDisabled = weekOffset >= availableWeeks - 1;

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Week navigation header */}
      <div className="glass-warm rounded-2xl p-4 sm:p-5 shadow-lg shadow-sand-300/20">
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={onPrev}
            disabled={isPrevDisabled}
            className="flex items-center gap-1 text-sm font-semibold text-sand-600 hover:text-sand-800 disabled:opacity-30 disabled:cursor-not-allowed transition-opacity"
            aria-label="Previous week"
          >
            <ChevronLeft className="w-4 h-4" />
            Prev
          </button>

          <div className="text-center">
            <p className="font-[family-name:var(--font-display)] text-base text-sand-700">
              {weekLabel(weekOffset)}
            </p>
            <p className="text-xs text-sand-400 mt-0.5">{forecast.dayLabel}</p>
          </div>

          <button
            onClick={onNext}
            disabled={isNextDisabled}
            className="flex items-center gap-1 text-sm font-semibold text-sand-600 hover:text-sand-800 disabled:opacity-30 disabled:cursor-not-allowed transition-opacity"
            aria-label="Next week"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Action recommendation */}
      <RecommendationBanner forecast={forecast} />

      {/* Single week summary card */}
      <WeatherCard summary={forecast} label={weekLabel(weekOffset)} tempUnit={tempUnit} windUnit={windUnit} delay={50} />

      {/* Stacked metric charts */}
      <div className="space-y-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-sand-400 mb-2 px-1">
            Temperature
          </p>
          <WeatherChart summary={forecast} metric="temp" label={weekLabel(weekOffset)} tempUnit={tempUnit} delay={150} />
        </div>

        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-sand-400 mb-2 px-1">
            Rain Probability
          </p>
          <WeatherChart summary={forecast} metric="rain" label={weekLabel(weekOffset)} delay={250} />
        </div>

        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-sand-400 mb-2 px-1">
            Wind Speed
          </p>
          <WeatherChart summary={forecast} metric="wind" label={weekLabel(weekOffset)} windUnit={windUnit} delay={350} />
        </div>
      </div>
    </div>
  );
}
