import { Thermometer, Droplets, Wind, Cloud } from 'lucide-react';
import type { WeatherSummary } from '../../types/app';
import type { TempUnit } from '../../config/constants';
import { getAllVerdicts, getOverallSeverity } from '../../services/weatherMessages';
import { displayTemp } from '../../utils/temperatureUtils';
import { WeatherMessage } from './WeatherMessage';

const severityAccent = {
  good: 'from-sage-400 to-sage-500',
  caution: 'from-amber-400 to-amber-500',
  warning: 'from-rose-400 to-rose-500',
};

interface WeatherCardProps {
  summary: WeatherSummary;
  label: string;
  tempUnit: TempUnit;
  delay?: number;
}

export function WeatherCard({ summary, label, tempUnit, delay = 0 }: WeatherCardProps) {
  const verdicts = getAllVerdicts(summary);
  const severity = getOverallSeverity(verdicts);

  return (
    <div
      className="glass-warm rounded-2xl overflow-hidden shadow-lg shadow-sand-300/20 animate-fade-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Severity accent bar */}
      <div className={`h-1 bg-gradient-to-r ${severityAccent[severity]}`} />

      <div className="p-5 sm:p-6">
        {/* Header */}
        <div className="flex items-baseline justify-between mb-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-sand-400">{label}</p>
            <p className="font-[family-name:var(--font-display)] text-lg text-sand-800 mt-0.5">
              {summary.dayLabel}
            </p>
          </div>
          <div className="text-right">
            <p className="font-[family-name:var(--font-display)] text-3xl text-sand-900 leading-none">
              {displayTemp(summary.avgTemp, tempUnit)}°
            </p>
            <p className="text-xs text-sand-400 mt-1">avg</p>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <StatItem
            icon={<Thermometer className="w-3.5 h-3.5 text-ember-400" />}
            label="High / Low"
            value={`${displayTemp(summary.highTemp, tempUnit)}° / ${displayTemp(summary.lowTemp, tempUnit)}°`}
          />
          <StatItem
            icon={<Droplets className="w-3.5 h-3.5 text-sky-400" />}
            label="Rain chance"
            value={`${Math.round(summary.precipProb)}%`}
          />
          <StatItem
            icon={<Wind className="w-3.5 h-3.5 text-sand-400" />}
            label="Wind"
            value={`${Math.round(summary.avgWindSpeed)} mph`}
          />
          <StatItem
            icon={<Cloud className="w-3.5 h-3.5 text-sand-400" />}
            label="Conditions"
            value={summary.conditions}
          />
        </div>

        {/* Verdicts */}
        <div className="space-y-1.5">
          {verdicts.map((v) => (
            <WeatherMessage key={v.message} verdict={v} />
          ))}
        </div>
      </div>
    </div>
  );
}

function StatItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      {icon}
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-sand-400 leading-none">{label}</p>
        <p className="text-sm font-semibold text-sand-700 mt-0.5 truncate">{value}</p>
      </div>
    </div>
  );
}
