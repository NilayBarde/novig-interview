import { test, expect } from '@playwright/test';

test('WeatherWeek Core Flow', async ({ page }) => {
  // Mock the weather API call so we don't consume credits or flake on live data
  await page.route('**/VisualCrossingWebServices/rest/services/timeline/**', async route => {
    const json = {
      queryCost: 1,
      latitude: 37.773972,
      longitude: -122.431297,
      resolvedAddress: "San Francisco, CA, United States",
      address: "san francisco",
      timezone: "America/Los_Angeles",
      tzoffset: -8.0,
      days: [
        // Generate a simple 15-day mock starting from today
        ...Array.from({ length: 15 }).map((_, i) => {
          const d = new Date();
          d.setDate(d.getDate() + i);
          return {
            datetime: d.toISOString().split('T')[0],
            temp: 65,
            tempmax: 70,
            tempmin: 60,
            humidity: 50,
            precip: 0,
            precipprob: 10, // low chance of rain
            windspeed: 5, // low wind
            windgust: 10,
            conditions: "Clear",
            icon: "clear-day",
            hours: Array.from({ length: 24 }).map((_, h) => ({
              datetime: `${String(h).padStart(2, '0')}:00:00`,
              temp: 60 + (h % 10), // slight variation
              humidity: 50,
              precip: 0,
              precipprob: 10,
              windspeed: 5,
              windgust: 10,
              conditions: "Clear",
              icon: "clear-day",
            }))
          };
        })
      ]
    };
    await route.fulfill({ json });
  });

  // Mock Nominatim search API so tests don't hit the live endpoint
  await page.route('**/nominatim.openstreetmap.org/search**', async (route) => {
    await route.fulfill({
      json: [
        {
          place_id: 12345,
          name: 'San Francisco',
          display_name: 'San Francisco, CA, United States',
        },
      ],
    });
  });

  // Load the app
  await page.goto('/');

  // Verify empty state is visible initially
  await expect(page.getByText("Where's the meetup?")).toBeVisible();

  // To avoid extremely flaky 3rd party shadow DOM event listeners in headless browser tests,
  // we circumvent the autocomplete entirely via a hidden state-injection input exposed only in non-prod.
  // This verifies that WHEN autocomplete successfully resolves a place, the rest of the app reacts correctly.
  const injectionInput = page.getByTestId('e2e-location-inject');
  await injectionInput.evaluate((node: HTMLInputElement) => {
    // React synthetic events need the native value setter bypassed to trigger onChange properly
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
    nativeInputValueSetter?.call(node, 'San Francisco, CA, United States');
    node.dispatchEvent(new Event('input', { bubbles: true }));
    node.dispatchEvent(new Event('change', { bubbles: true }));
  });

  // Wait for the "Found: San Francisco, CA" to appear indicating API success
  await expect(page.getByText(/Found: .*/)).toBeVisible();

  // Verify both week columns are visible simultaneously
  await expect(page.getByText('This Week').first()).toBeVisible();
  await expect(page.getByText('Next Week').first()).toBeVisible();

  // Verify the recommendation banner fires with the correct verdict for the mock data
  // (65°F comfortable, 10% rain, 5mph calm winds → all good)
  await expect(page.getByText('All good — enjoy the event').first()).toBeVisible();
});
