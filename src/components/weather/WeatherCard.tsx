import { Thermometer, Droplets, Wind, Cloud } from 'lucide-react';
import type { WeatherSummary } from '../../types/app';
import type { TempUnit, WindUnit } from '../../config/constants';
import { getAllVerdicts, getOverallSeverity } from '../../services/weatherMessages';
import { displayTemp, displayWindSpeed, windSpeedLabel } from '../../utils/temperatureUtils';
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
  windUnit: WindUnit;
  delay?: number;
}

export function WeatherCard({ summary, label, tempUnit, windUnit, delay = 0 }: WeatherCardProps) {
  const verdicts = getAllVerdicts(summary);
  const severity = getOverallSeverity(verdicts);

  return (
    <div
      className="glass-warm rounded-2xl overflow-hidden shadow-lg shadow-sand-300/20 animate-fade-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Severity accent bar */}
      <div className={`h-1 bg-gradient-to-r ${severityAccent[severity]}`} />

      <div className="p-5 space-y-4">
        {/* Header */}
        <div className="flex items-baseline justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-sand-400 block">
              {label}
            </span>
            <span className="font-[family-name:var(--font-display)] text-lg text-sand-800">
              {summary.dayLabel}
            </span>
          </div>
          <div className="text-right">
            <span className="font-[family-name:var(--font-display)] text-4xl text-sand-800 leading-none">
              {displayTemp(summary.avgTemp, tempUnit)}°
            </span>
            <span className="text-xs text-sand-400 ml-0.5">avg</span>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          <StatItem
            icon={<Thermometer className="w-3.5 h-3.5 text-ember-400" />}
            label="High / Low"
            value={`${displayTemp(summary.highTemp, tempUnit)}° / ${displayTemp(summary.lowTemp, tempUnit)}°`}
          />
          <StatItem
            icon={<Droplets className="w-3.5 h-3.5 text-sky-400" />}
            label="Rain Chance"
            value={`${Math.round(summary.precipProb)}%`}
          />
          <StatItem
            icon={<Wind className="w-3.5 h-3.5 text-sand-400" />}
            label="Wind"
            value={`${displayWindSpeed(summary.avgWindSpeed, windUnit)} ${windSpeedLabel(windUnit)}`}
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
