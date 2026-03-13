import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { WeatherSummary } from '../../types/app';
import type { TempUnit, WindUnit } from '../../config/constants';
import { RecommendationBanner } from './RecommendationBanner';
import { WeatherCard } from './WeatherCard';
import { WeatherChart } from './WeatherChart';

interface WeatherWeekViewProps {
  label: string;
  forecast: WeatherSummary;
  tempUnit: TempUnit;
  windUnit: WindUnit;
  /** Shared y-axis domains across weeks so charts are visually comparable */
  tempDomain?: [number, number];
  windDomain?: [number, number];
  /** Mobile-only prev/next navigation — omit on desktop where both columns are visible */
  onPrev?: () => void;
  onNext?: () => void;
  canGoPrev?: boolean;
  canGoNext?: boolean;
}

export function WeatherWeekView({ label, forecast, tempUnit, windUnit, tempDomain, windDomain, onPrev, onNext, canGoPrev, canGoNext }: WeatherWeekViewProps) {
  return (
    <div className="space-y-6">
      {/* Section heading */}
      <div className="glass-warm rounded-2xl p-4 sm:p-5 shadow-lg shadow-sand-300/20">
        <div className="flex items-center justify-between">
          {/* md:hidden removes these from layout and the a11y tree on desktop */}
          <button
            onClick={onPrev}
            disabled={!canGoPrev}
            className="md:hidden flex items-center justify-center w-8 h-8 rounded-xl text-sand-500 hover:text-sand-800 disabled:opacity-20 disabled:cursor-not-allowed transition-opacity"
            aria-label="Previous week"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex-1 text-center">
            <p className="font-[family-name:var(--font-display)] text-base text-sand-700">{label}</p>
            <p className="text-xs text-sand-400 mt-0.5">{forecast.dayLabel}</p>
          </div>

          <button
            onClick={onNext}
            disabled={!canGoNext}
            className="md:hidden flex items-center justify-center w-8 h-8 rounded-xl text-sand-500 hover:text-sand-800 disabled:opacity-20 disabled:cursor-not-allowed transition-opacity"
            aria-label="Next week"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Action recommendation */}
      <RecommendationBanner forecast={forecast} />

      {/* Single week summary card */}
      <WeatherCard summary={forecast} label={label} tempUnit={tempUnit} windUnit={windUnit} delay={50} />

      {/* Stacked metric charts */}
      <div className="space-y-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-sand-400 mb-2 px-1">Temperature</p>
          <WeatherChart summary={forecast} metric="temp" label={label} tempUnit={tempUnit} tempDomain={tempDomain} delay={150} />
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-sand-400 mb-2 px-1">Rain Probability</p>
          <WeatherChart summary={forecast} metric="rain" label={label} delay={250} />
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-sand-400 mb-2 px-1">Wind Speed</p>
          <WeatherChart summary={forecast} metric="wind" label={label} windUnit={windUnit} windDomain={windDomain} delay={350} />
        </div>
      </div>
    </div>
  );
}
