import { CheckCircle2, AlertTriangle, AlertOctagon } from 'lucide-react';
import type { WeatherSummary } from '../../types/app';
import { getAllVerdicts, getOverallSeverity, getRecommendation } from '../../services/weatherMessages';

const severityConfig = {
  good: {
    icon: CheckCircle2,
    bg: 'bg-sage-50',
    text: 'text-sage-700',
    iconColor: 'text-sage-500',
    border: 'border-sage-200',
  },
  caution: {
    icon: AlertTriangle,
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    iconColor: 'text-amber-500',
    border: 'border-amber-100',
  },
  warning: {
    icon: AlertOctagon,
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    iconColor: 'text-rose-500',
    border: 'border-rose-100',
  },
};

export function RecommendationBanner({ forecast, label }: { forecast: WeatherSummary; label: string }) {
  const severity = getOverallSeverity(getAllVerdicts(forecast));
  const config = severityConfig[severity];
  const Icon = config.icon;
  const recommendation = getRecommendation(forecast);

  return (
    <div
      aria-label={`${label} recommendation: ${recommendation}`}
      className={`glass-warm rounded-2xl px-5 py-4 shadow-lg shadow-sand-300/20 border ${config.border} ${config.bg}`}
    >
      <div className="flex items-center gap-3">
        <Icon className={`w-5 h-5 flex-shrink-0 ${config.iconColor}`} strokeWidth={2} />
        <span className={`text-sm font-semibold ${config.text}`}>{recommendation}</span>
      </div>
    </div>
  );
}
