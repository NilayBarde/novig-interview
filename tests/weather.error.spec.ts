import { test, expect } from '@playwright/test';

test('WeatherWeek shows rate-limit error state', async ({ page }) => {
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
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
    nativeInputValueSetter?.call(node, 'San Francisco, CA, United States');
    node.dispatchEvent(new Event('input', { bubbles: true }));
    node.dispatchEvent(new Event('change', { bubbles: true }));
  });

  await expect(page.getByText('Rate limited')).toBeVisible({ timeout: 20000 });
  await expect(page.getByText('Too many requests. Please wait a moment and try again.')).toBeVisible({ timeout: 20000 });
  await expect(page.getByRole('button', { name: 'Try again' })).toBeVisible();
});

