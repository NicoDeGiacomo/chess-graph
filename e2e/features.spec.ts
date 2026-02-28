import { test, expect } from '@playwright/test';

test('page loads with correct title', async ({ page }) => {
  await page.goto('/features');
  await expect(page).toHaveTitle('Chess Opening Tree Features — Chess Graph');
});

test('hero heading is visible', async ({ page }) => {
  await page.goto('/features');
  await expect(page.getByRole('heading', { name: 'Chess Graph Features', exact: true })).toBeVisible();
});

test('table of contents has 9 links', async ({ page }) => {
  await page.goto('/features');
  const toc = page.locator('nav[aria-label="Table of contents"]');
  await expect(toc).toBeVisible();
  const links = toc.locator('a');
  await expect(links).toHaveCount(9);
});

test('TOC anchor scrolls to target section', async ({ page }) => {
  await page.goto('/features');
  const tocLink = page.locator('nav[aria-label="Table of contents"] a', { hasText: 'PGN Import' });
  await tocLink.click();
  const section = page.locator('#pgn-import');
  await expect(section).toBeInViewport({ timeout: 3000 });
});

test('all 9 section headings are visible', async ({ page }) => {
  await page.goto('/features');
  const headings = [
    'Interactive Game Tree',
    'Chess Board',
    'Move Input',
    'Keyboard Shortcuts',
    'Node Customization',
    'PGN Import',
    'Export & Import',
    'Repertoire Management',
    'Additional Features',
  ];
  for (const heading of headings) {
    await expect(page.getByRole('heading', { name: heading })).toBeVisible();
  }
});

test('keyboard shortcuts table has kbd elements', async ({ page }) => {
  await page.goto('/features');
  const shortcutsSection = page.locator('section#keyboard-shortcuts');
  await expect(shortcutsSection).toBeVisible();
  await expect(shortcutsSection.locator('kbd').first()).toBeVisible();
  const count = await shortcutsSection.locator('kbd').count();
  expect(count).toBeGreaterThan(5);
});

test('screenshot images have correct src attributes', async ({ page }) => {
  await page.goto('/features');
  const expectedSrcs = [
    '/screenshots/features/game-tree.png',
    '/screenshots/features/chess-board.png',
    '/screenshots/features/move-input.png',
    '/screenshots/features/context-menu.png',
    '/screenshots/features/pgn-import.png',
    '/screenshots/features/repertoire-management.png',
  ];
  for (const src of expectedSrcs) {
    const img = page.locator(`img[src="${src}"]`);
    await expect(img).toBeAttached();
  }
});

test('footer is visible', async ({ page }) => {
  await page.goto('/features');
  await expect(page.locator('footer').getByText('MIT License')).toBeVisible();
});

test('Get Started CTA navigates to repertoires', async ({ page }) => {
  await page.goto('/features');
  // Scroll to bottom to find the CTA
  const cta = page.getByRole('link', { name: 'Get Started' });
  await cta.click();
  await expect(page.getByText('My Graphs')).toBeVisible({ timeout: 5000 });
  expect(page.url()).toContain('/repertoires');
});

test('logo links back to home', async ({ page }) => {
  await page.goto('/features');
  await page.getByRole('img', { name: 'Chess Graph' }).click();
  await expect(page).toHaveURL('/');
});
