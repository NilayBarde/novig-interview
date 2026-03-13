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
  types/weather.ts, app.ts      — Visual Crossing API types, app domain types
  services/
    weatherApi.ts               — API fetch with typed error handling
    weatherMessages.ts          — Pure functions: weather data → verdicts + recommendation
  utils/
    dateUtils.ts                — Date computation (base event date, week offsets, formatting)
    temperatureUtils.ts         — °F/°C conversion
    weatherSummary.ts           — Day summarization: hourly aggregation, precip/wind/temp extraction
  context/EventConfigContext.tsx — Persisted UI state (location, day, time, units)
  hooks/
    useMultiWeekForecasts.ts    — React Query wrapper, extracts N weekly summaries from a single API call
  components/
    layout/                     — Header, PageContainer
    controls/                   — LocationInput, DaySelector, TimeRangeSelector, TempUnitToggle, WindUnitToggle
    weather/                    — WeatherWeekView, RecommendationBanner, WeatherCard, WeatherChart, WeatherMessage
    common/                     — LoadingState, ErrorState
```

### Key Decisions

1. **Side-by-side comparison over a week navigator** — Showing This Week and Next Week simultaneously lets the organizer scan both at once: if this week looks bad and next week looks fine, the decision to reschedule is immediate and obvious. A single-week navigator forces two separate page states to reach the same conclusion. On desktop the two columns sit naturally in a CSS grid. On mobile, prev/next chevrons are embedded in the week heading card itself — this co-locates the navigation with the label it controls, avoids duplicating the week name in a separate tab bar, and is symmetric (both directions are always present, with boundary arrows disabled rather than hidden). A swipe carousel was considered but rejected: for two named options, a carousel creates a discovery problem — there is no obvious affordance for navigating back. Extending to a third week requires only passing `weekCount={3}` to `useMultiWeekForecasts` and adding `md:grid-cols-3` — the data constraint is the Visual Crossing 15-day free-tier window (covers two occurrences of any weekday; a paid plan unlocks a third).

2. **Action recommendation banner** — The organizer's primary question is "should I run this event?" The banner answers this directly above the detail cards, deriving context-aware copy from the actual forecast: caution tells them what to bring; warning tells them why to reconsider. Verdict rows in the card are simplified to plain condition descriptions ("Comfortable", "Rain likely") since the actionable advice lives in the banner.

3. **Stacked metric panels** — A single combined chart with a dual Y-axis (temperature left, rain right) would technically satisfy the PRD's "scrollable graph" requirement but obscures rain values and leaves wind entirely invisible. Three stacked panels give each metric an honest scale; page scroll covers the PRD's scrollability requirement without a custom scroll container.

4. **Timezone awareness** — All date logic uses the IANA `timezone` string returned by the Visual Crossing API for the geocoded location, not the user's browser timezone. The event date, the "today already past" check, and the location date display all reflect the event location's calendar — so a user in Sydney planning a New York meetup sees New York dates throughout.

5. **"Today already past" handling** — Selecting "Wednesday + Morning" on a Wednesday evening would naively show today's elapsed morning as "This Week." If the selected day is today and the time window's final hour has started (`currentHour >= endHour`), the base date advances by one week. This is computed once in `getBaseEventDate` (dateUtils) and hoisted outside the week-iteration loop in `useMultiWeekForecasts`, so all weekly offsets share a consistent anchor date.

6. **`precipprob` over humidity** — The PRD specified humidity (25–75%) as the rain signal. Raw humidity is unreliable — 80% humidity on a clear day is common. `precipprob` is the model-computed probability of measurable precipitation and is the correct field for "will it rain?"

7. **Peak precip probability** — Uses `max` (not `avg`) across hourly probabilities within the time window. If any single hour carries high rain risk, the organizer needs to know — averaging it away would understate the risk. A future improvement would factor in `precip` (actual expected accumulation in inches) alongside `precipprob` — a 90% chance of a light drizzle is meaningfully different from a 90% chance of heavy rain for an outdoor event.

8. **Single API call** — Fetches the full 15-day forecast once and slices it client-side for each week offset. Minimizes API usage, gives atomic loading state, and makes the result cacheable for the full session. `weekOffset` is intentionally excluded from the React Query key.

9. **Day/time selectors as pill buttons** — Pills show all options simultaneously (7 days, 4 time windows) with no click-to-open overhead, and naturally extend to multi-select if the product ever allows comparing multiple days. A dropdown adds friction with no benefit at this scale.

10. **Address autocomplete** — Custom autocomplete on the OpenStreetMap Nominatim API (no API key required). Nominatim was chosen over Mapbox Geocoding v6 because the core venue type for outdoor meetups — parks, fields, plazas — are POIs, and the Mapbox v6 API does not index POIs. Nominatim covers them fully. Requests are debounced at 500ms. Note: browsers do not allow setting the `User-Agent` header from client-side JavaScript; the browser supplies its own `User-Agent` and sends `Referer` automatically.

11. **Preference persistence** — Location, day, time window, and both unit preferences are written to `localStorage` and restored on load. The current week view is not persisted — on load the app always shows This Week and Next Week.

12. **Smart retry** — React Query retries network and server errors with exponential backoff but skips retries on 400 responses (invalid location). Those are deterministic failures; retrying wastes time and quota.

13. **Location-aware date near controls** — Once a location resolves, a line like "Los Angeles — Wednesday, Mar 11" appears between the location input and the day/time selectors. It uses the event location's IANA timezone so the date reflects the event location's calendar day, not the browser's.

14. **Keyboard accessibility** — Day and time selectors use Tab + Enter/Space rather than the WAI-ARIA roving `tabIndex` arrow-key pattern. All controls retain `role="radio"` and `aria-checked` for screen-reader semantics.

## API Key

The Visual Crossing API key is bundled into the client (via `VITE_` prefix) — acceptable for a prototype. A production app would proxy requests through a serverless function. Location search uses OpenStreetMap Nominatim and requires no API key.

## Deploy

Deployed on Vercel. Set `VITE_WEATHER_API_KEY` as an environment variable in project settings.
