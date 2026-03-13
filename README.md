# WeatherWeek

A React single-page app for outdoor meetup organizers to check the weather forecast for their recurring event day — and decide whether to run, prepare, or reschedule.

## Features

- **Side-by-side comparison** — This Week and Next Week shown simultaneously; prev/next chevrons in the week heading on mobile, two-column grid on desktop
- **Action recommendation** — Prominent banner below the week heading tells the organizer what to do: "All good — enjoy the event", "Go ahead — bring layers and pack rain gear", or "Consider rescheduling — heavy rain likely"
- **Hourly charts** — Temperature, rain probability, and wind speed in stacked metric panels, each with its own honest scale
- **Simple verdicts** — Plain-language condition descriptions (Comfortable / Rain likely / Very windy) color-coded by severity
- **Configurable event** — Choose day of week, time window (morning/afternoon/evening/all day), and °F/°C + mph/km/h display
- **Location search** — Free-text input with debounced autocomplete via OpenStreetMap Nominatim (supports parks, landmarks, and addresses), with geocoded address confirmation
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
  types/weather.ts, app.ts      — API types and app domain types
  services/
    weatherApi.ts               — Fetch logic with typed error handling
    weatherMessages.ts          — Logic: weather data → verdicts + recommendation
  utils/
    dateUtils.ts                — Calendar and timezone logic
    weatherSummary.ts           — Hourly data aggregation
  context/EventConfigContext.tsx — Persisted UI state (loc, day, time, units)
  hooks/
    useMultiWeekForecasts.ts    — React Query wrapper; slices API results
  components/
    layout/                     — Structural components
    controls/                   — Input and selection pills
    weather/                    — Forecast views, charts, and recommendations
```

### Key Decisions

1. **Side-by-side comparison over a week navigator** — Showing This Week and Next Week simultaneously lets the organizer scan both at once: if this week looks bad and next week looks fine, the decision to reschedule is immediate and obvious. A single-week navigator forces two separate page states to reach the same conclusion. On desktop the two columns sit naturally in a CSS grid. On mobile, prev/next chevrons are embedded in the week heading card itself — this co-locates the navigation with the label it controls, avoids duplicating the week name in a separate tab bar, and is symmetric.

2. **Action recommendation banner** — The organizer's primary question is "should I run this event?" The banner answers this directly above the detail cards, deriving context-aware copy from the actual forecast: caution tells them what to bring; warning tells them why to reconsider. Verdict rows in the card are simplified to plain condition descriptions ("Comfortable", "Rain likely") since the actionable advice lives in the banner.

3. **Stacked metric panels** — A single combined chart with a dual Y-axis would technically satisfy requirements but obscures rain values and leaves wind entirely invisible. Three stacked panels give each metric an honest scale; page scroll covers the "scrollable graph" requirement without a custom scroll container.

4. **Timezone awareness** — All date logic uses the IANA `timezone` string returned by the Visual Crossing API for the geocoded location, not the user's browser timezone. This ensures the event date and the "today already past" check reflect the meetup location's actual calendar.

5. **"Today already past" handling** — Selecting "Wednesday + Morning" on a Wednesday evening would naively show today's elapsed morning as "This Week." The app automatically advances the base date by one week if the selected time window for today has already elapsed, ensuring the first view is always useful.

6. **`precipprob` over humidity** — The PRD suggests humidity (25–75%) as the rain signal, but raw humidity is an unreliable indicator. `precipprob` (model-computed probability of measurable precipitation) is the standard field for answering "will it rain?" and is used as the primary driver for rain verdicts.

7. **Peak precip probability** — Uses `max` (not `avg`) across hourly probabilities within the time window. If any single hour carries high rain risk, the organizer needs to know — averaging it away would understate the risk.

8. **Single API call** — Fetches the full 15-day forecast once and slices it client-side for each week offset. This minimizes API usage, gives a single atomic loading state, and makes the results cacheable for the session.

9. **Pill-style selectors** — Day and time selectors show all options simultaneously with no click-to-open overhead. This reduces friction compared to a dropdown and naturally extends to multi-select if needed later.

10. **Address autocomplete** — Custom autocomplete on the OpenStreetMap Nominatim API. Nominatim was chosen for its superior coverage of POIs (parks, fields, plazas) which are the core venue types for outdoor meetups. Requests are debounced at 500ms.

11. **Preference persistence** — Location, day, time window, and units are written to `localStorage` and restored on load, providing a "sticky" experience for recurring organizers.

12. **Smart retry** — React Query retries network errors with exponential backoff but skips retries on deterministic 400 responses (e.g., invalid location), saving quota and user time.

## Future Considerations

- **Actual Precip Accumulation** — Factoring in `precip` (inches) alongside probability to distinguish between light drizzle and heavy rain.
- **Syncing Multi-week Domains** — Currently charts use localized domains for precision; syncing Y-axes across weeks would enable easier magnitude comparison.

## API Key

The Visual Crossing API key is bundled into the client (via `VITE_` prefix) — standard for a prototype. Location search uses OpenStreetMap Nominatim and requires no API key.

## Deploy

Deployed on Vercel. Set `VITE_WEATHER_API_KEY` as an environment variable in project settings.
