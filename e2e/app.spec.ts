import { test, expect } from '@playwright/test';

test('loads app with default repertoire and creates a child node via drag', async ({ page }) => {
  // Clear IndexedDB to start fresh
  await page.goto('/');
  await page.evaluate(() => indexedDB.deleteDatabase('chess-graph'));
  await page.reload();

  // Wait for app to load (select has a value)
  await expect(page.locator('select')).toHaveValue(/.+/);

  // Root node visible in graph
  const rootNode = page.locator('[data-testid^="rf__node-"]').first();
  await expect(rootNode).toBeVisible();

  // Chessboard is rendered with starting position
  const e2 = page.locator('[data-square="e2"]');
  await expect(e2).toBeVisible();

  // Drag e2 to e4 using mouse API (dnd-kit requires real mouse events)
  const e2Box = (await e2.boundingBox())!;
  const e4Box = (await page.locator('[data-square="e4"]').boundingBox())!;

  await page.mouse.move(e2Box.x + e2Box.width / 2, e2Box.y + e2Box.height / 2);
  await page.mouse.down();
  await page.mouse.move(e4Box.x + e4Box.width / 2, e4Box.y + e4Box.height / 2, { steps: 10 });
  await page.mouse.up();

  // The "e4" node should appear in the graph (2 nodes total)
  await expect(page.locator('[data-testid^="rf__node-"]')).toHaveCount(2);
});
