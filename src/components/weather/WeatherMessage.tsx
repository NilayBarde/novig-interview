import { CheckCircle2, AlertTriangle, AlertOctagon } from 'lucide-react';
import type { WeatherVerdict } from '../../types/app';

const severityConfig = {
  good: {
    icon: CheckCircle2,
    bg: 'bg-sage-50',
    text: 'text-sage-600',
    iconColor: 'text-sage-500',
    border: 'border-sage-200',
  },
  caution: {
    icon: AlertTriangle,
    bg: 'bg-amber-50',
    text: 'text-amber-600',
    iconColor: 'text-amber-500',
    border: 'border-amber-100',
  },
  warning: {
    icon: AlertOctagon,
    bg: 'bg-rose-50',
    text: 'text-rose-600',
    iconColor: 'text-rose-500',
    border: 'border-rose-100',
  },
};

export function WeatherMessage({ verdict }: { verdict: WeatherVerdict }) {
  const config = severityConfig[verdict.severity];
  const Icon = config.icon;

  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${config.bg} border ${config.border}`}>
      <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${config.iconColor}`} strokeWidth={2.5} />
      <span className={`text-xs font-medium ${config.text}`}>{verdict.message}</span>
    </div>
  );
}
