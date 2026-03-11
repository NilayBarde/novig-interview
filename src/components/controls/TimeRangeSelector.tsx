import { TIME_RANGES } from '../../config/constants';
import type { TimeRange } from '../../config/constants';

interface TimeRangeSelectorProps {
  selectedRange: TimeRange;
  onRangeChange: (range: TimeRange) => void;
}

const SHORT_LABELS: Record<string, string> = {
  'Morning (6am–12pm)': 'Morning',
  'Afternoon (12pm–5pm)': 'Afternoon',
  'Evening (5pm–9pm)': 'Evening',
  'All Day': 'All Day',
};

export function TimeRangeSelector({ selectedRange, onRangeChange }: TimeRangeSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold uppercase tracking-widest text-sand-500">
        Time Window
      </label>
      <div className="flex flex-wrap gap-1.5">
        {TIME_RANGES.map((range) => {
          const isActive = range.label === selectedRange.label;
          return (
            <button
              key={range.label}
              onClick={() => onRangeChange(range)}
              className={`
                px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200
                cursor-pointer border-none
                ${isActive
                  ? 'bg-gradient-to-b from-sand-700 to-sand-800 text-white shadow-md shadow-sand-800/20'
                  : 'glass text-sand-600 hover:text-sand-800 hover:bg-white/80'
                }
              `}
            >
              <span className="hidden sm:inline">{range.label}</span>
              <span className="sm:hidden">{SHORT_LABELS[range.label]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
