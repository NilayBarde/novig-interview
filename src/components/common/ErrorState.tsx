import { AlertTriangle, RefreshCw, WifiOff, MapPinOff, Clock } from 'lucide-react';
import { isWeatherApiError } from '../../services/weatherApi';

interface ErrorStateProps {
  error: unknown;
  onRetry: () => void;
}

const errorIcons = {
  invalid_location: MapPinOff,
  rate_limit: Clock,
  network: WifiOff,
  unknown: AlertTriangle,
};

export function ErrorState({ error, onRetry }: ErrorStateProps) {
  const apiError = isWeatherApiError(error) ? error : null;
  const errorType = apiError?.type ?? 'unknown';
  const message = apiError?.message ?? 'Something went wrong. Please try again.';
  const Icon = errorIcons[errorType];

  return (
    <div className="glass-warm rounded-2xl p-8 sm:p-10 text-center shadow-lg shadow-sand-300/20 animate-fade-up">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-rose-50 mb-4">
        <Icon className="w-6 h-6 text-rose-500" strokeWidth={2} />
      </div>
      <p className="text-sand-800 font-semibold text-sm mb-1">
        {errorType === 'invalid_location' ? 'Location not found' :
         errorType === 'rate_limit' ? 'Rate limited' :
         errorType === 'network' ? 'Connection error' :
         'Something went wrong'}
      </p>
      <p className="text-sand-500 text-sm mb-5 max-w-sm mx-auto">{message}</p>
      <button
        onClick={onRetry}
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl
                   bg-gradient-to-b from-sand-700 to-sand-800 text-white text-sm font-semibold
                   shadow-md shadow-sand-800/20 hover:shadow-lg hover:shadow-sand-800/30
                   transition-all duration-200 cursor-pointer border-none"
      >
        <RefreshCw className="w-3.5 h-3.5" />
        Try again
      </button>
    </div>
  );
}
