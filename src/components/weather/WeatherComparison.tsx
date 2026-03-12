import { ArrowRight } from 'lucide-react';
import type { ComparisonResult } from '../../types/app';
import type { TempUnit, WindUnit } from '../../config/constants';
import { getComparisonVerdict } from '../../services/weatherMessages';
import { displayTemp, displayWindSpeed } from '../../utils/temperatureUtils';
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

  // Synchronized temp domain — both charts share the same Y scale for honest comparison.
  // Falls back to a sensible default when hourly data is absent (bad API data).
  const allTemps = [
    ...thisWeek.hourlyTemps.map((h) => displayTemp(h.temp, tempUnit)),
    ...nextWeek.hourlyTemps.map((h) => displayTemp(h.temp, tempUnit)),
  ];
  const tempDomain: [number, number] =
    allTemps.length > 0
      ? [Math.floor(Math.min(...allTemps) / 5) * 5 - 5, Math.ceil(Math.max(...allTemps) / 5) * 5 + 5]
      : [50, 90];

  // Synchronized wind domain
  const allWindSpeeds = [
    ...thisWeek.hourlyWindSpeed.map((h) => displayWindSpeed(h.windSpeed, windUnit)),
    ...nextWeek.hourlyWindSpeed.map((h) => displayWindSpeed(h.windSpeed, windUnit)),
  ];
  const windMax = allWindSpeeds.length > 0 ? Math.ceil(Math.max(...allWindSpeeds) / 5) * 5 + 5 : 30;
  const windDomain: [number, number] = [0, windMax];

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

      {/* Side-by-side summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        <WeatherCard summary={thisWeek} label="This Week" tempUnit={tempUnit} windUnit={windUnit} delay={50} />
        <WeatherCard summary={nextWeek} label="Next Week" tempUnit={tempUnit} windUnit={windUnit} delay={150} />
      </div>

      {/* Stacked metric panels — one row per metric, both weeks side-by-side */}
      <div className="space-y-4">
        {/* Temperature row */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-sand-400 mb-2 px-1">
            Temperature
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            <WeatherChart
              summary={thisWeek}
              metric="temp"
              label="This Week"
              tempDomain={tempDomain}
              tempUnit={tempUnit}
              delay={250}
            />
            <WeatherChart
              summary={nextWeek}
              metric="temp"
              label="Next Week"
              tempDomain={tempDomain}
              tempUnit={tempUnit}
              delay={300}
            />
          </div>
        </div>

        {/* Rain probability row */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-sand-400 mb-2 px-1">
            Rain Probability
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            <WeatherChart
              summary={thisWeek}
              metric="rain"
              label="This Week"
              delay={350}
            />
            <WeatherChart
              summary={nextWeek}
              metric="rain"
              label="Next Week"
              delay={400}
            />
          </div>
        </div>

        {/* Wind speed row */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-sand-400 mb-2 px-1">
            Wind Speed
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            <WeatherChart
              summary={thisWeek}
              metric="wind"
              label="This Week"
              windDomain={windDomain}
              windUnit={windUnit}
              delay={450}
            />
            <WeatherChart
              summary={nextWeek}
              metric="wind"
              label="Next Week"
              windDomain={windDomain}
              windUnit={windUnit}
              delay={500}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
