import { test, expect } from '@playwright/test';

test('Mobile: long location is truncated in input but fully visible below', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });

  const longAddress = 'Williamsburg, Brooklyn, New York, United States';

  await page.route('**/nominatim.openstreetmap.org/search**', async (route) => {
    await route.fulfill({
      json: [
        {
          place_id: 67890,
          name: 'Williamsburg',
          display_name: longAddress,
        },
      ],
    });
  });

  await page.route('**/VisualCrossingWebServices/rest/services/timeline/**', async (route) => {
    const d = new Date();
    const days = Array.from({ length: 15 }).map((_, i) => {
      const day = new Date(d);
      day.setDate(day.getDate() + i);
      return {
        datetime: day.toISOString().split('T')[0],
        temp: 65,
        tempmax: 70,
        tempmin: 60,
        humidity: 50,
        precip: 0,
        precipprob: 10,
        windspeed: 5,
        windgust: 10,
        conditions: 'Clear',
        icon: 'clear-day',
        hours: Array.from({ length: 24 }).map((_, h) => ({
          datetime: `${String(h).padStart(2, '0')}:00:00`,
          temp: 60 + (h % 10),
          humidity: 50,
          precip: 0,
          precipprob: 10,
          windspeed: 5,
          windgust: 10,
          conditions: 'Clear',
          icon: 'clear-day',
        })),
      };
    });

    await route.fulfill({
      json: {
        queryCost: 1,
        latitude: 40.7081,
        longitude: -73.9571,
        resolvedAddress: longAddress,
        address: 'williamsburg',
        timezone: 'America/New_York',
        tzoffset: -5.0,
        days,
      },
    });
  });

  await page.goto('/');

  const locationInput = page.locator('#location-input');
  await locationInput.fill('Williams');

  const option = page.getByRole('option').first();
  await expect(option).toBeVisible();
  await option.click();

  await expect(locationInput).toHaveValue(longAddress);
  await expect(locationInput).toHaveClass(/truncate/);

  await expect(page.getByText('Found:')).toBeVisible();
  await expect(page.getByText(longAddress)).toBeVisible();
});

