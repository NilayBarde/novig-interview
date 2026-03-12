import { TIME_RANGES } from '../../config/constants';
import type { TimeRange } from '../../config/constants';

interface TimeRangeSelectorProps {
  selectedRange: TimeRange;
  onRangeChange: (range: TimeRange) => void;
}

export function TimeRangeSelector({ selectedRange, onRangeChange }: TimeRangeSelectorProps) {
  return (
    <div className="space-y-2">
      <label id="time-range-label" className="block text-xs font-semibold uppercase tracking-widest text-sand-500">
        Time Window
      </label>
      <div
        role="radiogroup"
        aria-labelledby="time-range-label"
        className="flex flex-wrap gap-1.5"
      >
        {TIME_RANGES.map((range) => {
          const isActive = range.label === selectedRange.label;
          return (
            <button
              key={range.label}
              role="radio"
              aria-checked={isActive}
              tabIndex={isActive ? 0 : -1}
              onClick={() => onRangeChange(range)}
              onKeyDown={(e) => {
                if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                  e.preventDefault();
                  const nextIndex = (TIME_RANGES.findIndex((r) => r.label === range.label) + 1) % TIME_RANGES.length;
                  onRangeChange(TIME_RANGES[nextIndex]);
                } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                  e.preventDefault();
                  const prevIndex = (TIME_RANGES.findIndex((r) => r.label === range.label) - 1 + TIME_RANGES.length) % TIME_RANGES.length;
                  onRangeChange(TIME_RANGES[prevIndex]);
                }
              }}
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
              <span className="sm:hidden">{range.shortLabel}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
