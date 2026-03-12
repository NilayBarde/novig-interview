# WeatherWeek

A React single-page app for outdoor meetup organizers to compare this week's weather forecast with next week's — helping decide the best day and time to meet.

## Features

- **Week-over-week comparison** — Side-by-side weather cards for the same day, one week apart
- **Hourly charts** — Temperature, rain probability, and wind speed in stacked metric panels with synchronized Y-axes for honest visual comparison
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

1. **Stacked metric panels** — The PRD described a scrollable graph comparing weather metrics. A single combined chart with a hidden dual Y-axis (temperature left, rain right) would technically satisfy that but obscures rain values (readable only via tooltip), leaves wind entirely invisible, and misrepresents rain area height against the temperature scale. Instead: three stacked rows — Temperature, Rain Probability, Wind Speed — both weeks side-by-side per row. Each metric gets its own honest scale, wind becomes visible, and per-metric comparison is immediate. Page scroll covers the PRD's "scrollable" requirement without a custom scroll container.

2. **Timezone awareness** — All date logic uses the IANA `timezone` string returned by the Visual Crossing API for the geocoded location, not the user's local browser timezone. "This Week" and "Next Week" dates, the "today already past" check, and the header's date display all reflect the event location's calendar — so a user in Sydney planning a New York meetup sees New York dates throughout.

3. **"Today already past" handling** — The PRD doesn't address this edge case, but the naive behaviour is wrong: selecting "Wednesday + Morning" on a Wednesday evening would show today's elapsed morning as "This Week." If the selected day is today and the time window's final hour has started (`currentHour >= endHour`), both dates advance by 7 days so users always see a future forecast.

4. **`precipprob` over humidity** — The PRD specified humidity (25–75%) as the rain signal. Raw humidity is unreliable for that purpose — 80% humidity on a clear day is common. `precipprob` is the model-computed probability of measurable precipitation and is the right field for "will it rain?"

5. **Peak precip probability** — Uses `max` (not `avg`) across hourly probabilities within the time window. If any single hour carries high rain risk, the organizer needs to know — averaging it away would understate the risk.

6. **Single API call** — Fetches the full 15-day forecast once and slices it client-side for "this week" and "next week." Halves API usage vs. two targeted requests, gives atomic loading state, and makes the query cacheable for the full session.

7. **Day/time selectors as pill buttons** — The PRD left selector UX open. Pills show all options simultaneously (7 days, 4 time windows) with no click-to-open overhead, and naturally extend to multi-select if the product ever allows comparing multiple days. A dropdown adds friction with no benefit at this scale.

8. **Synchronized chart axes** — Both weekly temperature charts share a computed min/max Y-axis domain. A 5° difference looks the same on both charts — preventing the visual illusion of a larger gap on a chart with a narrower range.

9. **Address autocomplete** — Custom autocomplete on the Mapbox Geocoding v6 REST API with debounced fetch, keyboard navigation, and full ARIA combobox semantics. No third-party UI component was used to avoid shadow-DOM override complexity and keep full control over the interaction model.

10. **Preference persistence** — Location, day, time window, and both unit preferences are written to `localStorage` and restored on load. The organizer's recurring event shouldn't need to be re-entered on every visit.

11. **Smart retry** — React Query retries network and server errors with exponential backoff but skips retries on 400 responses (invalid location). Those are deterministic failures; retrying wastes time and quota.

12. **Location-aware date near controls** — Once a location resolves, a line like "Los Angeles — Wednesday, Mar 11" appears between the location input and the day/time selectors. It uses the event location's IANA timezone so the date reflects the event location's calendar day, not the browser's. A user in New York planning a Los Angeles event sees Wednesday, Mar 11 even though their local date is Thursday — directly explaining why the forecast is anchored to Wednesday. The header date intentionally stays as browser local time (no timezone attribution there; switching it silently would confuse users).

13. **Keyboard accessibility** — Day and time selectors use Tab + Enter/Space rather than the WAI-ARIA roving `tabIndex` arrow-key pattern. The arrow-key pattern is designed for traditional radio buttons; for small pill toggles it's less discoverable. All controls retain `role="radio"` and `aria-checked` for screen-reader semantics.


## API Key

The API key is bundled into the client (via `VITE_` prefix) — acceptable for a prototype. A production app would proxy requests through a serverless function.

## Deploy

Deployed on Vercel. Set `VITE_WEATHER_API_KEY` as an environment variable in project settings.
