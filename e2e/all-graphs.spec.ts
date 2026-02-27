import { test, expect } from '@playwright/test';

/** Clear IndexedDB and reload to start fresh on the All Graphs page */
async function resetToAllGraphs(page: import('@playwright/test').Page) {
  await page.goto('/repertoires');
  await page.evaluate(() => new Promise<void>((resolve, reject) => {
    const req = indexedDB.deleteDatabase('chess-graph');
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
    req.onblocked = () => resolve();
  }));
  await page.reload();
  await expect(page.getByText('My Graphs')).toBeVisible();
}

test.beforeEach(async ({ page }) => {
  await resetToAllGraphs(page);
});

test('page loads with repertoire cards', async ({ page }) => {
  // Should show at least the default repertoire card
  await expect(page.locator('[data-testid="graph-card"]')).toHaveCount(1);
});

test('search filters cards', async ({ page }) => {
  // Create a second repertoire so search shows up
  await page.getByRole('button', { name: /New Graph/i }).click();
  await page.getByPlaceholder('Graph name...').fill('Sicilian Defense');
  await page.getByRole('button', { name: 'Create' }).click();
  // Wait for editor to load then go back
  await expect(page.locator('[data-testid^="rf__node-"]').first()).toBeVisible({ timeout: 5000 });
  await page.getByText('Back').click();
  await expect(page.getByText('My Graphs')).toBeVisible();

  // Both cards visible
  await expect(page.locator('[data-testid="graph-card"]')).toHaveCount(2);

  // Search for "sicilian"
  const searchInput = page.getByPlaceholder('Search graphs...');
  await searchInput.fill('Sicilian');

  // Only one card visible
  await expect(page.locator('[data-testid="graph-card"]')).toHaveCount(1);
  await expect(page.getByText('Sicilian Defense')).toBeVisible();

  // Search for something that doesn't match
  await searchInput.fill('xyz');
  await expect(page.locator('[data-testid="graph-card"]')).toHaveCount(0);
  await expect(page.getByText('No graphs match your search.')).toBeVisible();
});

test('create new repertoire from dialog', async ({ page }) => {
  await page.getByRole('button', { name: /New Graph/i }).click();

  // Dialog should appear with name input
  await expect(page.getByPlaceholder('Graph name...')).toBeVisible();

  await page.getByPlaceholder('Graph name...').fill('Kings Indian');
  await page.getByRole('button', { name: 'Create' }).click();

  // Should navigate to editor
  await expect(page.locator('[data-testid^="rf__node-"]').first()).toBeVisible({ timeout: 5000 });
});

test('click card navigates to editor', async ({ page }) => {
  // Click the first card
  await page.locator('[data-testid="graph-card"]').first().click();

  // Should be in editor with graph visible
  await expect(page.locator('[data-testid^="rf__node-"]').first()).toBeVisible({ timeout: 5000 });
  // Back button should be visible
  await expect(page.getByText('Back')).toBeVisible();
});

test('back button returns to All Graphs', async ({ page }) => {
  // Enter editor
  await page.locator('[data-testid="graph-card"]').first().click();
  await expect(page.locator('[data-testid^="rf__node-"]').first()).toBeVisible({ timeout: 5000 });

  // Click back
  await page.getByText('Back').click();

  // Should see All Graphs page
  await expect(page.getByText('My Graphs')).toBeVisible();
});

test('delete from editor redirects to All Graphs', async ({ page }) => {
  // Create a second repertoire first
  await page.getByRole('button', { name: /New Graph/i }).click();
  await page.getByPlaceholder('Graph name...').fill('Temp');
  await page.getByRole('button', { name: 'Create' }).click();
  await expect(page.locator('[data-testid^="rf__node-"]').first()).toBeVisible({ timeout: 5000 });

  // Delete it via styled confirm dialog
  await page.getByRole('button', { name: 'Delete' }).click();
  await expect(page.getByText('Delete Graph')).toBeVisible();
  await page.locator('.bg-red-600').click();

  // Should be back at All Graphs
  await expect(page.getByText('My Graphs')).toBeVisible();
  await expect(page.locator('[data-testid="graph-card"]')).toHaveCount(1);
});

test('invalid repertoire ID redirects to All Graphs', async ({ page }) => {
  await page.goto('/repertoire/nonexistent-id');
  await expect(page.getByText('My Graphs')).toBeVisible({ timeout: 5000 });
});

test('search input has aria-label', async ({ page }) => {
  // Create a second repertoire so the search input appears
  await page.getByRole('button', { name: /New Graph/i }).click();
  await page.getByPlaceholder('Graph name...').fill('Sicilian');
  await page.getByRole('button', { name: 'Create' }).click();
  await expect(page.locator('[data-testid^="rf__node-"]').first()).toBeVisible({ timeout: 5000 });
  await page.getByText('Back').click();
  await expect(page.getByText('My Graphs')).toBeVisible();

  const searchInput = page.getByPlaceholder('Search graphs...');
  await expect(searchInput).toHaveAttribute('aria-label', 'Search graphs');
});

test('card has colored left border', async ({ page }) => {
  const card = page.locator('[data-testid="graph-card"]').first();
  const borderLeft = await card.evaluate((el) => getComputedStyle(el).borderLeftColor);
  // Default node color is theme-dependent: dark=#3f3f46 rgb(63,63,70), light=#d4d4d8 rgb(212,212,216)
  expect(['rgb(63, 63, 70)', 'rgb(212, 212, 216)']).toContain(borderLeft);
});

test('card shows root node tags and comment', async ({ page }) => {
  // Enter editor
  await page.locator('[data-testid="graph-card"]').first().click();
  await expect(page.locator('[data-testid^="rf__node-"]').first()).toBeVisible({ timeout: 5000 });

  // Add a tag via context menu on root node
  const rootNode = page.locator('[data-testid^="rf__node-"]').first();
  await rootNode.click({ button: 'right' });
  await page.getByText('Add Tag').click();
  const tagInput = page.getByPlaceholder('Tag name...');
  await expect(tagInput).toBeVisible();
  await tagInput.fill('repertoire-tag');
  await tagInput.press('Enter');
  await expect(page.getByText('repertoire-tag').first()).toBeVisible();

  // Close context menu by clicking elsewhere
  await page.locator('.react-flow__pane').click();

  // Add a comment via NodeDetails panel
  await rootNode.click();
  await page.getByRole('button', { name: 'Add' }).click();
  const textarea = page.locator('textarea');
  await textarea.fill('This is my repertoire description');
  await page.getByRole('button', { name: 'Save' }).click();

  // Navigate back to All Graphs
  await page.getByText('Back').click();
  await expect(page.getByText('My Graphs')).toBeVisible();

  // Assert tag pill and comment preview are visible on the card
  const card = page.locator('[data-testid="graph-card"]').first();
  await expect(card.getByText('repertoire-tag')).toBeVisible();
  await expect(card.getByText('This is my repertoire description')).toBeVisible();
});
