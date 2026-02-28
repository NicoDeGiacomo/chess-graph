import { test, expect } from '@playwright/test';

test('landing page hero loads', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('img', { name: 'Chess Graph', exact: true })).toBeVisible();
  await expect(page.getByText('Visualize your opening repertoire as an interactive game tree.')).toBeVisible();
});

test('Get Started CTA navigates to repertoires', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Get Started' }).click();
  await expect(page.getByText('My Graphs')).toBeVisible({ timeout: 5000 });
  expect(page.url()).toContain('/repertoires');
});

test('features section is visible', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Chess Opening Visualization Features' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Interactive Game Tree', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Synced Chess Board', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'PGN Import & Export', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Local Persistence', exact: true })).toBeVisible();
});

test('how it works section is visible', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'How It Works' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Build Your Repertoire Visually' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Board and Graph Stay in Sync' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'No Account Required' })).toBeVisible();
});

test('who uses section is visible', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Who Uses Chess Graph' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Tournament Players' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Chess Coaches' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Casual Improvers' })).toBeVisible();
});

test('about section is visible', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'About Chess Graph' })).toBeVisible();
  await expect(page.getByText('Nico De Giacomo')).toBeVisible();
});

test('GitHub links have accessible labels', async ({ page }) => {
  await page.goto('/');
  const githubLinks = page.locator('a[href*="github.com"]');
  await expect(githubLinks.first()).toBeVisible();
  const count = await githubLinks.count();
  expect(count).toBeGreaterThanOrEqual(2);

  for (let i = 0; i < count; i++) {
    const label = await githubLinks.nth(i).getAttribute('aria-label');
    expect(label).toBeTruthy();
    expect(label!).toContain('(opens in new tab)');
  }
});

test('footer is visible', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('footer').getByText('MIT License')).toBeVisible();
});

test('footer Features link navigates to /features', async ({ page }) => {
  await page.goto('/');
  await page.locator('footer').getByRole('link', { name: 'Features' }).click();
  await expect(page.getByRole('heading', { name: 'Chess Graph Features', exact: true })).toBeVisible({ timeout: 5000 });
  expect(page.url()).toContain('/features');
});
