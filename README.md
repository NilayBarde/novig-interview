# WeatherWeek

A React single-page app for outdoor meetup organizers to check the weather forecast for their recurring event day — and decide whether to run, prepare, or reschedule.

## Features

- **Week navigator** — Browse upcoming occurrences of the event day (This Week / Next Week / In 2 Weeks) using `< Prev` / `Next >` controls; offset resets when location or day changes
- **Action recommendation** — Prominent banner below the nav tells the organizer what to do: "All good — enjoy the event", "Go ahead — bring layers and pack rain gear", or "Consider rescheduling — heavy rain likely"
- **Hourly charts** — Temperature, rain probability, and wind speed in stacked metric panels, each with its own honest scale
- **Simple verdicts** — Plain-language condition descriptions (Comfortable / Rain likely / Very windy) color-coded by severity
- **Configurable event** — Choose day of week, time window (morning/afternoon/evening/all day), and °F/°C + mph/km/h display
- **Location search** — Free-text input with debounced API calls, Mapbox autocomplete, and geocoded address confirmation
- **Responsive** — Single-column on mobile, full layout on desktop
- **Error handling** — Typed error states for invalid location, rate limiting, and network failures with distinct icons and retry

## Tech Stack

| Layer | Choice |
|-------|--------|
| Build | Vite + React 19 |
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
    weatherMessages.ts          — Pure functions: weather data → verdicts + recommendation
  utils/
    dateUtils.ts                — Date computation (base event date, week offsets, formatting)
    temperatureUtils.ts         — °F/°C conversion
  context/EventConfigContext.tsx — Persisted UI state (location, day, time, units)
  hooks/
    useWeatherForecast.ts       — React Query wrapper, data transformation, availableWeeks
    useEventDates.ts            — Computes target date from selected day + weekOffset
  components/
    layout/                     — Header, PageContainer
    controls/                   — LocationInput, DaySelector, TimeRangeSelector, TempUnitToggle, WindUnitToggle
    weather/                    — WeatherWeekView, RecommendationBanner, WeatherCard, WeatherChart, WeatherMessage
    common/                     — LoadingState, ErrorState
```

### Key Decisions

1. **Week navigator instead of side-by-side comparison** — The PRD sketch showed `< >` arrows labeled "skip back/forward by week," which implies a navigator pattern rather than a fixed two-panel layout. A single-panel view is cleaner on mobile, makes the per-week recommendation unambiguous (no cross-week banner needed), and naturally supports a third week when the API's 15-day window covers it.

2. **Action recommendation banner** — The organizer's primary question is "should I run this event?" The banner answers this directly above the detail cards, deriving context-aware copy from the actual forecast: caution tells them what to bring; warning tells them why to reconsider. Verdict rows in the card are simplified to plain condition descriptions ("Comfortable", "Rain likely") since the actionable advice lives in the banner.

3. **Stacked metric panels** — A single combined chart with a dual Y-axis (temperature left, rain right) would technically satisfy the PRD's "scrollable graph" requirement but obscures rain values and leaves wind entirely invisible. Three stacked panels give each metric an honest scale; page scroll covers the PRD's scrollability requirement without a custom scroll container.

4. **Timezone awareness** — All date logic uses the IANA `timezone` string returned by the Visual Crossing API for the geocoded location, not the user's browser timezone. The event date, the "today already past" check, and the location date display all reflect the event location's calendar — so a user in Sydney planning a New York meetup sees New York dates throughout.

5. **"Today already past" handling** — Selecting "Wednesday + Morning" on a Wednesday evening would naively show today's elapsed morning as "This Week." If the selected day is today and the time window's final hour has started (`currentHour >= endHour`), the base date advances by one week. This is computed once in `getBaseEventDate` (dateUtils) and used consistently by both `useEventDates` and `useWeatherForecast`, so the displayed forecast and the available-week count always agree.

6. **`precipprob` over humidity** — The PRD specified humidity (25–75%) as the rain signal. Raw humidity is unreliable — 80% humidity on a clear day is common. `precipprob` is the model-computed probability of measurable precipitation and is the correct field for "will it rain?"

7. **Peak precip probability** — Uses `max` (not `avg`) across hourly probabilities within the time window. If any single hour carries high rain risk, the organizer needs to know — averaging it away would understate the risk.

8. **Single API call** — Fetches the full 15-day forecast once and slices it client-side for each week offset. Minimizes API usage, gives atomic loading state, and makes the result cacheable for the full session. `weekOffset` is intentionally excluded from the React Query key.

9. **Day/time selectors as pill buttons** — Pills show all options simultaneously (7 days, 4 time windows) with no click-to-open overhead, and naturally extend to multi-select if the product ever allows comparing multiple days. A dropdown adds friction with no benefit at this scale.

10. **Address autocomplete** — Custom autocomplete on the Mapbox Geocoding v6 REST API with debounced fetch, keyboard navigation, and full ARIA combobox semantics. No third-party UI component was used to keep full control over the interaction model.

11. **Preference persistence** — Location, day, time window, and both unit preferences are written to `localStorage` and restored on load. `weekOffset` is intentionally transient — it resets to "This Week" whenever location or day changes, since those changes invalidate the previously viewed offset.

12. **Smart retry** — React Query retries network and server errors with exponential backoff but skips retries on 400 responses (invalid location). Those are deterministic failures; retrying wastes time and quota.

13. **Location-aware date near controls** — Once a location resolves, a line like "Los Angeles — Wednesday, Mar 11" appears between the location input and the day/time selectors. It uses the event location's IANA timezone so the date reflects the event location's calendar day, not the browser's.

14. **Keyboard accessibility** — Day and time selectors use Tab + Enter/Space rather than the WAI-ARIA roving `tabIndex` arrow-key pattern. All controls retain `role="radio"` and `aria-checked` for screen-reader semantics.

## API Key

The API key is bundled into the client (via `VITE_` prefix) — acceptable for a prototype. A production app would proxy requests through a serverless function.

## Deploy

Deployed on Vercel. Set `VITE_WEATHER_API_KEY` as an environment variable in project settings.
