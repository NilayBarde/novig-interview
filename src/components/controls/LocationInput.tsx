import { useState, useCallback, useRef, useEffect } from 'react';
import { MapPin, Loader2 } from 'lucide-react';
import { DEBOUNCE_MS } from '../../config/constants';

interface Suggestion {
  id: string;
  name: string;
  fullAddress: string;
}

interface LocationInputProps {
  onLocationChange: (location: string) => void;
  initialValue?: string;
  resolvedAddress?: string;
  isLoading?: boolean;
}

/**
 * Location autocomplete powered by the OpenStreetMap Nominatim API.
 *
 * We call the API directly so we have full control over the DOM and
 * can style everything with standard Tailwind classes — no shadow DOM,
 * no `!important` overrides. No API key required.
 *
 * Nominatim was chosen over Mapbox Geocoding v6 because the core venue
 * type for outdoor meetups — parks, fields, plazas — are POIs, and the
 * Mapbox v6 API does not index POIs. Nominatim covers them fully.
 */
export function LocationInput({ onLocationChange, initialValue = '', resolvedAddress, isLoading }: LocationInputProps) {
  const [query, setQuery] = useState(initialValue);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);
  const [fetchError, setFetchError] = useState(false);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Fetch suggestions from Nominatim (OpenStreetMap) API
  const fetchSuggestions = useCallback(async (searchText: string) => {
    if (searchText.trim().length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    // Cancel any in-flight request
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setFetchError(false);
    setIsFetchingSuggestions(true);

    try {
      const params = new URLSearchParams({
        q: searchText,
        format: 'json',
        limit: '5',
        addressdetails: '1',
      });

      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?${params}`,
        {
          signal: abortRef.current.signal,
        },
      );

      if (!res.ok) throw new Error(`Nominatim returned ${res.status}`);

      const data = await res.json();
      const items = Array.isArray(data) ? (data as { place_id: number; name: string; display_name: string }[]) : [];
      const results: Suggestion[] = items.map((item) => ({
        id: item.place_id.toString(),
        name: item.name || item.display_name.split(',')[0],
        fullAddress: item.display_name,
      }));

      setSuggestions(results);
      setIsOpen(results.length > 0);
      setActiveIndex(-1);
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return;
      // API unreachable — show an error state so the user knows it's a network
      // issue, not a genuine no-results. They can still type a plain location.
      setFetchError(true);
      setSuggestions([]);
      setIsOpen(false);
      setActiveIndex(-1);
    } finally {
      setIsFetchingSuggestions(false);
    }
  }, []);

  // Debounced input handler
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setQuery(value);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => fetchSuggestions(value), DEBOUNCE_MS);
    },
    [fetchSuggestions],
  );

  // Select a suggestion
  const handleSelect = useCallback(
    (suggestion: Suggestion) => {
      setQuery(suggestion.fullAddress);
      setSuggestions([]);
      setIsOpen(false);
      setFetchError(false);
      onLocationChange(suggestion.fullAddress);
    },
    [onLocationChange],
  );

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          if (suggestions.length === 0) return;
          setActiveIndex((prev) => (prev + 1) % suggestions.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          if (suggestions.length === 0) return;
          setActiveIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
          break;
        case 'Enter':
          e.preventDefault();
          {
            const idx = activeIndex >= 0 ? activeIndex : 0;
            if (idx < suggestions.length) {
              handleSelect(suggestions[idx]);
            } else if (query.trim().length > 0) {
              // No suggestions available (autocomplete down or user typed freely) —
              // commit whatever is in the input directly.
              const committed = query.trim();
              setQuery(committed);
              setIsOpen(false);
              onLocationChange(committed);
            }
          }
          break;
        case 'Escape':
          setIsOpen(false);
          setActiveIndex(-1);
          setFetchError(false);
          break;
      }
    },
    [isOpen, activeIndex, suggestions, handleSelect, query, onLocationChange],
  );

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setFetchError(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  // Scroll the highlighted suggestion into view
  useEffect(() => {
    if (activeIndex >= 0) {
      document.getElementById(`suggestion-${activeIndex}`)?.scrollIntoView({ block: 'nearest' });
    }
  }, [activeIndex]);

  return (
    <div className="space-y-2 relative z-50">
      <label htmlFor="location-input" className="block text-xs font-semibold uppercase tracking-widest text-sand-500">
        Location
      </label>
      <div ref={wrapperRef} className="relative">
        {/* Hidden input for E2E testing — bypasses autocomplete for headless browsers */}
        {import.meta.env.MODE !== 'production' && (
          <input
            type="text"
            data-testid="e2e-location-inject"
            className="hidden"
            onChange={(e) => onLocationChange(e.target.value)}
          />
        )}
        <MapPin
          className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-sand-400 z-10 pointer-events-none"
          strokeWidth={2}
        />
        <input
          id="location-input"
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => suggestions.length > 0 && setIsOpen(true)}
          placeholder="Dolores Park, SF"
          autoComplete="off"
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-controls="location-suggestions"
          aria-activedescendant={activeIndex >= 0 ? `suggestion-${activeIndex}` : undefined}
          className="w-full pl-10 sm:pl-11 pr-9 sm:pr-10 py-3 rounded-xl truncate
            bg-white/40 backdrop-blur-lg
            border border-white/30
            shadow-[inset_0_0_0_1px_rgba(255,255,255,0.4)]
            text-sm font-medium text-sand-800
            placeholder:text-sand-400
            focus:outline-none focus:ring-2 focus:ring-ember-400/40
            transition-all duration-200"
        />

        {/* Loading spinner */}
        {(isLoading || isFetchingSuggestions) && (
          <Loader2
            className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ember-400 animate-spin z-10"
          />
        )}

        {/* Suggestions dropdown */}
        {isOpen && suggestions.length > 0 && (
          <ul
            id="location-suggestions"
            role="listbox"
            className="absolute top-full left-0 right-0 mt-2 py-1
              bg-white rounded-xl
              border border-sand-200/60
              shadow-lg shadow-sand-300/20
              z-50 max-h-60 overflow-y-auto"
          >
            {suggestions.map((suggestion, index) => (
              <li
                key={suggestion.id}
                id={`suggestion-${index}`}
                role="option"
                aria-selected={index === activeIndex}
                onMouseDown={() => handleSelect(suggestion)}
                onMouseEnter={() => setActiveIndex(index)}
                className={`px-4 py-2.5 cursor-pointer transition-colors duration-100
                  ${index === activeIndex ? 'bg-sand-50' : 'hover:bg-sand-50/60'}
                `}
              >
                <p className="text-sm font-medium text-sand-800">{suggestion.name}</p>
                <p className="text-xs text-sand-400 mt-0.5">{suggestion.fullAddress}</p>
              </li>
            ))}
          </ul>
        )}

      </div>

      {/* No results / fetch error message */}
      {suggestions.length === 0 && query.trim().length >= 2 && !isFetchingSuggestions && (
        <p className={`text-xs pl-1 ${fetchError ? 'text-ember-500' : 'text-sand-400'}`}>
          {fetchError ? 'Could not reach location service — you can still type a location manually' : 'No locations found'}
        </p>
      )}

      {resolvedAddress && (
        <p className="text-xs text-sand-500 pl-1 animate-fade-up break-words">
          <span className="text-sage-500 font-semibold">Found:</span>{' '}
          {resolvedAddress}
        </p>
      )}
    </div>
  );
}
