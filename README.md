# WeatherWeek

A React single-page app for outdoor meetup organizers to compare this week's weather forecast with next week's — helping decide the best day and time to meet.

## Features

- **Week-over-week comparison** — Side-by-side weather cards for the same day, one week apart
- **Hourly charts** — Temperature and precipitation probability plotted with synchronized Y-axes for honest visual comparison
- **Smart verdicts** — Human-friendly messages (temperature comfort, rain risk, wind conditions) with color-coded severity
- **Comparison recommendation** — Automated "next week looks better" / "similar conditions" verdict using a weighted scoring heuristic
- **Configurable event** — Choose day of week, time window (morning/afternoon/evening), and °F/°C display
- **Location search** — Free-text input with debounced API calls and geocoded address confirmation
- **Responsive** — Stacked on mobile, side-by-side grid on desktop
- **Error handling** — Typed error states for invalid location, rate limiting, and network failures with distinct icons and retry

## Tech Stack

| Layer | Choice |
|-------|--------|
| Build | Vite + React 18 |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS 4 |
| Charting | Recharts |
| Data Fetching | TanStack Query v5 |
| Icons | Lucide React |
| Testing | Vitest + Playwright |

## Getting Started

```bash
# Install dependencies
npm install

# Add your Visual Crossing API key
cp .env.example .env
# Edit .env and add your key (free tier: https://www.visualcrossing.com/sign-up)

# Start dev server
npm run dev
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | TypeScript check + production build |
| `npm run test` | Run unit tests with Vitest |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:e2e` | Run Playwright E2E browser tests |
| `npm run lint` | Lint with ESLint |

## Architecture

```
src/
  config/constants.ts           — Thresholds, enums, API config
  types/weather.ts, app.ts      — Visual Crossing API types, app domain types
  services/
    weatherApi.ts               — API fetch with typed error handling
    weatherMessages.ts          — Pure functions: weather data → verdicts
  utils/
    dateUtils.ts                — Date computation (next occurrence, formatting)
    temperatureUtils.ts         — °F/°C conversion
  context/EventConfigContext.tsx — UI state (location, day, time, units)
  hooks/
    useWeatherForecast.ts       — React Query wrapper, data transformation
    useEventDates.ts            — Computes target dates from selected day
  components/
    layout/                     — Header, PageContainer
    controls/                   — LocationInput, DaySelector, TimeRangeSelector, TempUnitToggle
    weather/                    — WeatherCard, WeatherChart, WeatherComparison, WeatherMessage
    common/                     — LoadingState, ErrorState
```

### Key Decisions

1. **Single API call** — Fetches the full 15-day forecast once, slices client-side into "this week" and "next week." Halves API usage and provides atomic loading.

2. **`precipprob` over humidity** — Rain verdicts use the model-computed precipitation probability rather than raw humidity. Humidity of 25–75% doesn't reliably indicate rain.

3. **Synchronized chart axes** — Both weekly charts share a computed min/max Y-axis domain so the visual comparison is honest (a 5° difference looks the same on both charts).

4. **Smart retry** — React Query retries network/server errors with exponential backoff but skips retries on 400 (invalid location) since those are deterministic failures.

5. **Peak precip probability** — Uses `max` (not `avg`) across hourly probabilities in the time window. If any hour has high rain risk, the organizer should know.

6. **Timezone awareness** — Date calculations for "This Week" and "Next Week" ignore the user's local browser time and instead rely on the strict IANA `timezone` string returned by the Visual Crossing API for the geocoded location.

7. **Clean Query Cancellation** — The `LocationInput` utilizes a standard JS debounce, but slow external network requests are aggressively pruned via `AbortController` signals passed from React Query to the `fetch` API, neutralizing edge-case race conditions as the user types.

8. **Semantic Accessibility** — Custom UI radio-button clusters (like `DaySelector`) utilize explicit `role="radiogroup"` / `role="radio"` attributes and support standard keyboard arrow navigation for screen readers.

9. **Address Autocomplete** — Custom autocomplete built on the Mapbox Geocoding v6 REST API with debounced fetch, keyboard navigation, and full ARIA combobox semantics — no third-party UI components or shadow DOM overrides.

## API Key

The API key is bundled into the client (via `VITE_` prefix) — acceptable for a prototype. A production app would proxy requests through a serverless function.

## Deploy

Deployed on Vercel. Set `VITE_WEATHER_API_KEY` as an environment variable in project settings.
