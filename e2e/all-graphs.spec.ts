import { test, expect } from '@playwright/test';

/** Clear IndexedDB and reload to start fresh on the All Graphs page */
async function resetToAllGraphs(page: import('@playwright/test').Page) {
  await page.goto('/');
  await page.evaluate(() => new Promise<void>((resolve, reject) => {
    const req = indexedDB.deleteDatabase('chess-graph');
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
    req.onblocked = () => resolve();
  }));
  await page.reload();
  await expect(page.getByText('My Repertoires')).toBeVisible();
}

test.beforeEach(async ({ page }) => {
  await resetToAllGraphs(page);
});

test('page loads with repertoire cards', async ({ page }) => {
  // Should show at least the default repertoire card
  await expect(page.locator('button.bg-zinc-900')).toHaveCount(1);
});

test('search filters cards', async ({ page }) => {
  // Create a second repertoire so search shows up
  await page.getByRole('button', { name: /New Repertoire/i }).click();
  await page.getByPlaceholder('Opening name...').fill('Sicilian Defense');
  await page.getByRole('button', { name: 'Create' }).click();
  // Wait for editor to load then go back
  await expect(page.locator('[data-testid^="rf__node-"]').first()).toBeVisible({ timeout: 5000 });
  await page.getByText('Back').click();
  await expect(page.getByText('My Repertoires')).toBeVisible();

  // Both cards visible
  await expect(page.locator('button.bg-zinc-900')).toHaveCount(2);

  // Search for "sicilian"
  const searchInput = page.getByPlaceholder('Search repertoires...');
  await searchInput.fill('Sicilian');

  // Only one card visible
  await expect(page.locator('button.bg-zinc-900')).toHaveCount(1);
  await expect(page.getByText('Sicilian Defense')).toBeVisible();

  // Search for something that doesn't match
  await searchInput.fill('xyz');
  await expect(page.locator('button.bg-zinc-900')).toHaveCount(0);
  await expect(page.getByText('No repertoires match your search.')).toBeVisible();
});

test('create new repertoire from dialog', async ({ page }) => {
  await page.getByRole('button', { name: /New Repertoire/i }).click();

  // Dialog should appear with name input
  await expect(page.getByPlaceholder('Opening name...')).toBeVisible();

  await page.getByPlaceholder('Opening name...').fill('Kings Indian');
  await page.getByRole('button', { name: 'Create' }).click();

  // Should navigate to editor
  await expect(page.locator('[data-testid^="rf__node-"]').first()).toBeVisible({ timeout: 5000 });
});

test('click card navigates to editor', async ({ page }) => {
  // Click the first card
  await page.locator('button.bg-zinc-900').first().click();

  // Should be in editor with graph visible
  await expect(page.locator('[data-testid^="rf__node-"]').first()).toBeVisible({ timeout: 5000 });
  // Back button should be visible
  await expect(page.getByText('Back')).toBeVisible();
});

test('back button returns to All Graphs', async ({ page }) => {
  // Enter editor
  await page.locator('button.bg-zinc-900').first().click();
  await expect(page.locator('[data-testid^="rf__node-"]').first()).toBeVisible({ timeout: 5000 });

  // Click back
  await page.getByText('Back').click();

  // Should see All Graphs page
  await expect(page.getByText('My Repertoires')).toBeVisible();
});

test('delete from editor redirects to All Graphs', async ({ page }) => {
  // Create a second repertoire first
  await page.getByRole('button', { name: /New Repertoire/i }).click();
  await page.getByPlaceholder('Opening name...').fill('Temp');
  await page.getByRole('button', { name: 'Create' }).click();
  await expect(page.locator('[data-testid^="rf__node-"]').first()).toBeVisible({ timeout: 5000 });

  // Delete it
  page.on('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Delete' }).click();

  // Should be back at All Graphs
  await expect(page.getByText('My Repertoires')).toBeVisible();
  await expect(page.locator('button.bg-zinc-900')).toHaveCount(1);
});

test('invalid repertoire ID redirects to All Graphs', async ({ page }) => {
  await page.goto('/repertoire/nonexistent-id');
  await expect(page.getByText('My Repertoires')).toBeVisible({ timeout: 5000 });
});
