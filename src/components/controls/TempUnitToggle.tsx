import type { TempUnit } from '../../config/constants';

interface TempUnitToggleProps {
  unit: TempUnit;
  onChange: (unit: TempUnit) => void;
}

export function TempUnitToggle({ unit, onChange }: TempUnitToggleProps) {
  return (
    <div className="flex items-center gap-1 glass rounded-lg p-0.5">
      <button
        onClick={() => onChange('F')}
        className={`
          px-2.5 py-1.5 rounded-md text-xs font-bold transition-all duration-200
          cursor-pointer border-none
          ${unit === 'F'
            ? 'bg-gradient-to-b from-ember-400 to-ember-500 text-white shadow-sm'
            : 'text-sand-500 hover:text-sand-700'
          }
        `}
      >
        °F
      </button>
      <button
        onClick={() => onChange('C')}
        className={`
          px-2.5 py-1.5 rounded-md text-xs font-bold transition-all duration-200
          cursor-pointer border-none
          ${unit === 'C'
            ? 'bg-gradient-to-b from-ember-400 to-ember-500 text-white shadow-sm'
            : 'text-sand-500 hover:text-sand-700'
          }
        `}
      >
        °C
      </button>
    </div>
  );
}
