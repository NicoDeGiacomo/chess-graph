import { test, expect, type Page } from '@playwright/test';

/** Clear IndexedDB, reload, and navigate into the editor */
async function resetAndEnterEditor(page: Page) {
  await page.goto('/repertoires');
  await page.evaluate(() => new Promise<void>((resolve, reject) => {
    const req = indexedDB.deleteDatabase('chess-graph');
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
    req.onblocked = () => resolve();
  }));
  await page.reload();
  await expect(page.getByText('My Graphs')).toBeVisible();
  await page.locator('[data-testid="graph-card"]').filter({ hasText: 'My Initial Graph' }).click();
  await expect(page.locator('[data-testid^="rf__node-"]').first()).toBeVisible({ timeout: 5000 });
}

/** Create a second repertoire via the All Graphs page and return to the editor of the first */
async function createSecondRepertoire(page: Page) {
  await page.getByText('Back').click();
  await expect(page.getByText('My Graphs')).toBeVisible();
  await page.getByRole('button', { name: /New Graph/i }).click();
  await page.getByPlaceholder('Graph name...').fill('Sicilian Defense');
  // Pick Black side via select dropdown
  await page.locator('#create-graph-side').selectOption('black');
  await page.getByRole('button', { name: 'Create' }).click();
  await expect(page.locator('[data-testid^="rf__node-"]').first()).toBeVisible({ timeout: 5000 });
  // Go back and enter the first repertoire again
  await page.getByText('Back').click();
  await expect(page.getByText('My Graphs')).toBeVisible();
  await page.locator('[data-testid="graph-card"]').filter({ hasText: 'My Initial Graph' }).click();
  await expect(page.locator('[data-testid^="rf__node-"]').first()).toBeVisible({ timeout: 5000 });
}

test.beforeEach(async ({ page }) => {
  await resetAndEnterEditor(page);
});

test('hamburger button toggles panel open and closed', async ({ page }) => {
  const toggle = page.locator('[data-testid="panel-toggle"]');
  const panel = page.locator('[data-testid="graph-panel"]');

  // Panel is initially closed (w-0)
  await expect(panel).toHaveClass(/w-0/);

  // Click hamburger to open
  await toggle.click();
  await expect(panel).not.toHaveClass(/w-0/);
  await expect(panel).toHaveClass(/w-64/);

  // Click hamburger again to close
  await toggle.click();
  await expect(panel).toHaveClass(/w-0/);
});

test('panel shows Graphs heading', async ({ page }) => {
  await page.locator('[data-testid="panel-toggle"]').click();
  await expect(page.locator('[data-testid="graph-panel"]').getByText('Graphs', { exact: true })).toBeVisible();
});

test('panel lists all repertoires', async ({ page }) => {
  await createSecondRepertoire(page);

  // Open panel
  await page.locator('[data-testid="panel-toggle"]').click();
  const panel = page.locator('[data-testid="graph-panel"]');

  // Should show both repertoires
  await expect(panel.getByText('My Initial Graph')).toBeVisible();
  await expect(panel.getByText('Sicilian Defense')).toBeVisible();
});

test('current repertoire is visually highlighted', async ({ page }) => {
  await createSecondRepertoire(page);

  await page.locator('[data-testid="panel-toggle"]').click();

  // The first repertoire (currently active) should have highlighted background
  const items = page.locator('[data-testid^="panel-item-"]');
  const firstItem = items.first();
  await expect(firstItem).toHaveClass(/bg-elevated/);
});

test('clicking a different repertoire switches to it', async ({ page }) => {
  await createSecondRepertoire(page);

  await page.locator('[data-testid="panel-toggle"]').click();
  const panel = page.locator('[data-testid="graph-panel"]');

  // Click the Sicilian Defense item
  await panel.getByText('Sicilian Defense').click();

  // URL should change to the other repertoire
  await expect(page).not.toHaveURL(/repertoires$/);
  await expect(page.locator('[data-testid^="rf__node-"]').first()).toBeVisible({ timeout: 5000 });

  // Top bar should show the new repertoire name
  await expect(page.locator('header').getByText('Sicilian Defense')).toBeVisible();
});

test('mouse hover on left edge opens panel', async ({ page }) => {
  const hoverZone = page.locator('[data-testid="panel-hover-zone"]');
  const panel = page.locator('[data-testid="graph-panel"]');

  // Panel starts closed
  await expect(panel).toHaveClass(/w-0/);

  // Hover over the left edge zone
  await hoverZone.hover();

  // Panel should open
  await expect(panel).toHaveClass(/w-64/);
});

test('mouse leave closes panel', async ({ page }) => {
  const panel = page.locator('[data-testid="graph-panel"]');

  // Open panel
  await page.locator('[data-testid="panel-toggle"]').click();
  await expect(panel).toHaveClass(/w-64/);

  // First hover into the panel, then leave it
  await panel.hover();
  await page.locator('[data-square="e4"]').hover();

  // Panel should close
  await expect(panel).toHaveClass(/w-0/);
});
