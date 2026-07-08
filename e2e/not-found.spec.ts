import { test, expect } from '@playwright/test';

test('unknown route shows 404 page', async ({ page }) => {
  await page.goto('/some-nonexistent-page');
  await expect(page.getByRole('heading', { name: 'Page Not Found' })).toBeVisible();
  await expect(page.getByText("doesn't exist")).toBeVisible();
});

test('404 page has link back to home', async ({ page }) => {
  await page.goto('/some-nonexistent-page');
  await page.getByRole('link', { name: 'Back to Home' }).click();
  await expect(page).toHaveURL('/');
});
