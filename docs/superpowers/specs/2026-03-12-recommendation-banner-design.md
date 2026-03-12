# Recommendation Banner

**Date:** 2026-03-12
**Status:** Approved

## Problem

The existing verdict messages in `WeatherCard` tell the organizer *what* the conditions are, but they have to read several items before forming a decision. There is no single prominent answer to the primary question: "Should I run this event?"

## Solution

Add a slim `RecommendationBanner` component inside `WeatherWeekView`, rendered below the week navigation header and above `WeatherCard`. The banner gives a single, bold, color-coded action recommendation scoped to the currently-displayed week.

## Placement

Inside `WeatherWeekView`, in this order:
1. Nav header (Prev / week label / Next)
2. **RecommendationBanner** ← new
3. WeatherCard
4. Charts

The recommendation is per-week (derived from the current `forecast` prop) so it belongs inside the week view, not at the app level.

## Copy

Maps directly to the existing three severity levels:

| Severity | Message |
|----------|---------|
| `good` | "Looks good — go for it" |
| `caution` | "Come prepared — some conditions need attention" |
| `warning` | "Consider rescheduling" |

## Visual Design

- Slim full-width banner matching the existing glass-warm card style
- Background and text tinted by severity (sage green / amber / rose), consistent with `WeatherMessage`
- No icon — the color alone carries the meaning at this size
- Fades in with the rest of the view (existing `animate-fade-up` pattern)

## Files Changed

**`src/services/weatherMessages.ts`**
- Add `getRecommendation(severity: Severity): string` — pure function returning the copy above

**`src/components/weather/RecommendationBanner.tsx`** ← new
- Props: `{ severity: Severity }`
- Derives message from `getRecommendation(severity)`
- Renders severity-colored banner

**`src/components/weather/WeatherWeekView.tsx`**
- Import `RecommendationBanner`
- Derive `severity` from `getOverallSeverity(getAllVerdicts(forecast))`
- Render `<RecommendationBanner severity={severity} />` between nav header and `WeatherCard`

## Files Unchanged

- `WeatherCard.tsx` — verdict messages stay; the banner adds a summary above, not a replacement
- `App.tsx` — no changes needed; severity is derived inside `WeatherWeekView` from the existing `forecast` prop
- `types/app.ts`, `constants.ts` — no changes

## Out of Scope

- Per-metric recommendation detail (the card verdicts already cover this)
- Recommendation influencing the week navigator (each week is independent)
