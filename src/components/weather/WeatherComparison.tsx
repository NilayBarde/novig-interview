import { ArrowRight } from 'lucide-react';
import type { ComparisonResult } from '../../types/app';
import { getComparisonVerdict } from '../../services/weatherMessages';
import { WeatherCard } from './WeatherCard';
import { WeatherChart } from './WeatherChart';
import { WeatherMessage } from './WeatherMessage';

interface WeatherComparisonProps {
  comparison: ComparisonResult;
}

export function WeatherComparison({ comparison }: WeatherComparisonProps) {
  const { thisWeek, nextWeek } = comparison;

  // Synchronized Y-axis domain for honest visual comparison
  const allTemps = [
    ...thisWeek.hourlyTemps.map((h) => h.temp),
    ...nextWeek.hourlyTemps.map((h) => h.temp),
  ];
  const tempMin = Math.floor(Math.min(...allTemps) / 5) * 5 - 5;
  const tempMax = Math.ceil(Math.max(...allTemps) / 5) * 5 + 5;
  const tempDomain: [number, number] = [tempMin, tempMax];

  const comparisonVerdict = getComparisonVerdict(thisWeek, nextWeek);

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Comparison verdict banner */}
      <div className="glass-warm rounded-2xl p-4 sm:p-5 shadow-lg shadow-sand-300/20" style={{ animationDelay: '0ms' }}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex items-center gap-3 flex-1">
            <div className="flex items-center gap-2 text-sand-500">
              <span className="font-[family-name:var(--font-display)] text-sm text-sand-700">
                {thisWeek.dayLabel}
              </span>
              <ArrowRight className="w-3.5 h-3.5" />
              <span className="font-[family-name:var(--font-display)] text-sm text-sand-700">
                {nextWeek.dayLabel}
              </span>
            </div>
          </div>
          <WeatherMessage verdict={comparisonVerdict} />
        </div>
      </div>

      {/* Side-by-side cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        <WeatherCard summary={thisWeek} label="This Week" delay={50} />
        <WeatherCard summary={nextWeek} label="Next Week" delay={150} />
      </div>

      {/* Side-by-side charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        <WeatherChart summary={thisWeek} tempDomain={tempDomain} label="This Week" delay={250} />
        <WeatherChart summary={nextWeek} tempDomain={tempDomain} label="Next Week" delay={350} />
      </div>
    </div>
  );
}
