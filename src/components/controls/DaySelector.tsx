import { DAYS_OF_WEEK } from '../../config/constants';
import type { DayOfWeek } from '../../config/constants';

interface DaySelectorProps {
  selectedDay: DayOfWeek;
  onDayChange: (day: DayOfWeek) => void;
}

export function DaySelector({ selectedDay, onDayChange }: DaySelectorProps) {
  return (
    <div className="space-y-2">
      <label id="day-selector-label" className="block text-xs font-semibold uppercase tracking-widest text-sand-500">
        Day of Week
      </label>
      <div
        role="radiogroup"
        aria-labelledby="day-selector-label"
        className="flex flex-wrap gap-1.5"
      >
        {DAYS_OF_WEEK.map((day) => {
          const isActive = day === selectedDay;
          return (
            <button
              key={day}
              role="radio"
              aria-checked={isActive}
              onClick={() => onDayChange(day)}
              className={`
                px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200
                cursor-pointer border-none
                ${isActive
                  ? 'bg-gradient-to-b from-ember-400 to-ember-500 text-white shadow-md shadow-ember-500/25'
                  : 'glass text-sand-600 hover:text-sand-800 hover:bg-white/80'
                }
              `}
            >
              {day.slice(0, 3)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
