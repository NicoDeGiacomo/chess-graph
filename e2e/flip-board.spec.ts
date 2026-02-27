import { test, expect, type Page } from '@playwright/test';

/** Wait for DB writes to flush and graph animations to settle */
async function waitForSettle(page: Page) {
  await page.waitForTimeout(400);
}

/** Clear IndexedDB, reload, and navigate from All Graphs page into the first repertoire */
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

test.beforeEach(async ({ page }) => {
  await resetAndEnterEditor(page);
});

test('flip button is visible', async ({ page }) => {
  const flipButton = page.getByRole('button', { name: 'Flip board' });
  await expect(flipButton).toBeVisible();
});

test('click flips board orientation', async ({ page }) => {
  // Default orientation is white — a1 should be at bottom-left
  // Get position of a1 and h8 before flip
  const a1Before = (await page.locator('[data-square="a1"]').boundingBox())!;
  const h8Before = (await page.locator('[data-square="h8"]').boundingBox())!;

  // a1 should be below h8 (higher y value) in white orientation
  expect(a1Before.y).toBeGreaterThan(h8Before.y);

  // Click flip
  await page.getByRole('button', { name: 'Flip board' }).click();
  await waitForSettle(page);

  // After flipping to black orientation, a1 should be above h8
  const a1After = (await page.locator('[data-square="a1"]').boundingBox())!;
  const h8After = (await page.locator('[data-square="h8"]').boundingBox())!;
  expect(a1After.y).toBeLessThan(h8After.y);
});

test('flip persists after reload', async ({ page }) => {
  // Flip the board
  await page.getByRole('button', { name: 'Flip board' }).click();
  await waitForSettle(page);

  // Verify flipped (a1 above h8)
  const a1Flipped = (await page.locator('[data-square="a1"]').boundingBox())!;
  const h8Flipped = (await page.locator('[data-square="h8"]').boundingBox())!;
  expect(a1Flipped.y).toBeLessThan(h8Flipped.y);

  // Reload
  await page.reload();
  await expect(page.locator('[data-testid^="rf__node-"]').first()).toBeVisible({ timeout: 5000 });

  // Should still be flipped
  const a1After = (await page.locator('[data-square="a1"]').boundingBox())!;
  const h8After = (await page.locator('[data-square="h8"]').boundingBox())!;
  expect(a1After.y).toBeLessThan(h8After.y);
});
