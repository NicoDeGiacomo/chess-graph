import { test, expect } from '@playwright/test';

test('landing page hero loads', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1, name: 'Chess Graph' })).toBeVisible();
  await expect(page.getByText('Visualize your opening repertoire')).toBeVisible();
});

test('Get Started CTA navigates to repertoires', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Get Started' }).click();
  await expect(page.getByText('My Repertoires')).toBeVisible({ timeout: 5000 });
  expect(page.url()).toContain('/repertoires');
});

test('features section is visible', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Features' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Interactive Game Tree' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Synced Chess Board' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'PGN Import & Export' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Local Persistence' })).toBeVisible();
});

test('footer is visible', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('MIT License')).toBeVisible();
});
