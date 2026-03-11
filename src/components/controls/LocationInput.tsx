import { useState, useEffect, useRef } from 'react';
import { MapPin, Loader2 } from 'lucide-react';
import { DEBOUNCE_MS } from '../../config/constants';

interface LocationInputProps {
  onLocationChange: (location: string) => void;
  resolvedAddress?: string;
  isLoading?: boolean;
}

export function LocationInput({ onLocationChange, resolvedAddress, isLoading }: LocationInputProps) {
  const [inputValue, setInputValue] = useState('');
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    if (inputValue.trim().length === 0) return;

    timerRef.current = setTimeout(() => {
      onLocationChange(inputValue.trim());
    }, DEBOUNCE_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [inputValue, onLocationChange]);

  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold uppercase tracking-widest text-sand-500">
        Location
      </label>
      <div className="relative">
        <MapPin
          className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-sand-400"
          strokeWidth={2}
        />
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Dolores Park, SF"
          className="w-full pl-11 pr-10 py-3 rounded-xl glass-warm text-sand-800 placeholder:text-sand-400
                     font-medium text-sm focus:outline-none focus:ring-2 focus:ring-ember-400/40
                     transition-shadow duration-200"
        />
        {isLoading && (
          <Loader2
            className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ember-400 animate-spin"
          />
        )}
      </div>
      {resolvedAddress && (
        <p className="text-xs text-sand-500 pl-1 animate-fade-up">
          <span className="text-sage-500 font-semibold">Found:</span>{' '}
          {resolvedAddress}
        </p>
      )}
    </div>
  );
}
