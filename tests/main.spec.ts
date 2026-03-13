import { test, expect } from '@playwright/test';

test.describe('WeatherWeek', () => {
  test.beforeEach(async ({ page }) => {
    // Mock the weather API call
    await page.route('**/VisualCrossingWebServices/rest/services/timeline/**', async route => {
      const json = {
        queryCost: 1,
        latitude: 37.773972,
        longitude: -122.431297,
        resolvedAddress: "San Francisco, CA, United States",
        address: "san francisco",
        timezone: "America/Los_Angeles",
        tzoffset: -8.0,
        days: Array.from({ length: 15 }).map((_, i) => {
          const d = new Date();
          d.setDate(d.getDate() + i);
          return {
            datetime: d.toISOString().split('T')[0],
            temp: 65,
            tempmax: 70,
            tempmin: 60,
            humidity: 50,
            precip: 0,
            precipprob: 10,
            windspeed: 5,
            windgust: 10,
            conditions: "Clear",
            icon: "clear-day",
            hours: Array.from({ length: 24 }).map((_, h) => ({
              datetime: `${String(h).padStart(2, '0')}:00:00`,
              temp: 60 + (h % 10),
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
      };
      await route.fulfill({ json });
    });

    // Mock Nominatim search API
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
  });

  test('Core Flow: location search and forecast display', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText("Where's the meetup?")).toBeVisible();

    // Use the E2E injection input for stability
    const injectionInput = page.getByTestId('e2e-location-inject');
    await injectionInput.evaluate((node: HTMLInputElement) => {
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
      nativeInputValueSetter?.call(node, 'San Francisco, CA, United States');
      node.dispatchEvent(new Event('input', { bubbles: true }));
      node.dispatchEvent(new Event('change', { bubbles: true }));
    });

    await expect(page.getByText(/Found: .*/)).toBeVisible();
    await expect(page.getByText('This Week').first()).toBeVisible();
    await expect(page.getByText('Next Week').first()).toBeVisible();
    await expect(page.getByText('All good — enjoy the event').first()).toBeVisible();
  });

  test('Error states: handling rate limiting', async ({ page }) => {
    // Override weather route to return 429
    await page.route('**/VisualCrossingWebServices/rest/services/timeline/**', async (route) => {
      await route.fulfill({
        status: 429,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'rate_limited' }),
      });
    });

    await page.goto('/');
    const injectionInput = page.getByTestId('e2e-location-inject');
    await injectionInput.evaluate((node: HTMLInputElement) => {
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
      nativeInputValueSetter?.call(node, 'San Francisco, CA, United States');
      node.dispatchEvent(new Event('input', { bubbles: true }));
      node.dispatchEvent(new Event('change', { bubbles: true }));
    });

    await expect(page.getByText('Rate limited')).toBeVisible({ timeout: 10000 });
  });
});
