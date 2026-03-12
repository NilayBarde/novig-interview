import { ArrowRight } from 'lucide-react';
import type { ComparisonResult } from '../../types/app';
import type { TempUnit, WindUnit } from '../../config/constants';
import { getComparisonVerdict } from '../../services/weatherMessages';
import { displayTemp } from '../../utils/temperatureUtils';
import { WeatherCard } from './WeatherCard';
import { WeatherChart } from './WeatherChart';
import { WeatherMessage } from './WeatherMessage';

interface WeatherComparisonProps {
  comparison: ComparisonResult;
  tempUnit: TempUnit;
  windUnit: WindUnit;
}

export function WeatherComparison({ comparison, tempUnit, windUnit }: WeatherComparisonProps) {
  const { thisWeek, nextWeek } = comparison;

  // Synchronized Y-axis domain for honest visual comparison.
  // Computed in display units so the chart axis matches what's rendered.
  const allTemps = [
    ...thisWeek.hourlyTemps.map((h) => displayTemp(h.temp, tempUnit)),
    ...nextWeek.hourlyTemps.map((h) => displayTemp(h.temp, tempUnit)),
  ];
  const tempMin = Math.floor(Math.min(...allTemps) / 5) * 5 - 5;
  const tempMax = Math.ceil(Math.max(...allTemps) / 5) * 5 + 5;
  const tempDomain: [number, number] = [tempMin, tempMax];

  const comparisonVerdict = getComparisonVerdict(thisWeek, nextWeek);

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Comparison verdict banner */}
      <div className="glass-warm rounded-2xl p-4 sm:p-5 shadow-lg shadow-sand-300/20">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex items-center gap-2 flex-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-sand-400">This</span>
            <span className="font-[family-name:var(--font-display)] text-sm text-sand-700">
              {thisWeek.dayLabel}
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-sand-400" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-sand-400">Next</span>
            <span className="font-[family-name:var(--font-display)] text-sm text-sand-700">
              {nextWeek.dayLabel}
            </span>
          </div>
          <WeatherMessage verdict={comparisonVerdict} />
        </div>
      </div>

      {/* Side-by-side cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        <WeatherCard summary={thisWeek} label="This Week" tempUnit={tempUnit} windUnit={windUnit} delay={50} />
        <WeatherCard summary={nextWeek} label="Next Week" tempUnit={tempUnit} windUnit={windUnit} delay={150} />
      </div>

      {/* Side-by-side charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        <WeatherChart summary={thisWeek} tempDomain={tempDomain} tempUnit={tempUnit} label="This Week" delay={250} />
        <WeatherChart summary={nextWeek} tempDomain={tempDomain} tempUnit={tempUnit} label="Next Week" delay={350} />
      </div>
    </div>
  );
}
