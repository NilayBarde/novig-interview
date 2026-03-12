import type { WindUnit } from '../../config/constants';

interface WindUnitToggleProps {
  unit: WindUnit;
  onChange: (unit: WindUnit) => void;
}

export function WindUnitToggle({ unit, onChange }: WindUnitToggleProps) {
  return (
    <div className="flex items-center gap-1 glass rounded-lg p-0.5">
      <button
        onClick={() => onChange('mph')}
        className={`
          px-2.5 py-1.5 rounded-md text-xs font-bold transition-all duration-200
          cursor-pointer border-none
          ${unit === 'mph'
            ? 'bg-gradient-to-b from-ember-400 to-ember-500 text-white shadow-sm'
            : 'text-sand-500 hover:text-sand-700'
          }
        `}
      >
        mph
      </button>
      <button
        onClick={() => onChange('kmh')}
        className={`
          px-2.5 py-1.5 rounded-md text-xs font-bold transition-all duration-200
          cursor-pointer border-none
          ${unit === 'kmh'
            ? 'bg-gradient-to-b from-ember-400 to-ember-500 text-white shadow-sm'
            : 'text-sand-500 hover:text-sand-700'
          }
        `}
      >
        km/h
      </button>
    </div>
  );
}
