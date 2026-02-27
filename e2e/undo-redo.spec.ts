import { test, expect, type Page } from '@playwright/test';

async function dragPiece(page: Page, from: string, to: string) {
  const fromBox = (await page.locator(`[data-square="${from}"]`).boundingBox())!;
  const toBox = (await page.locator(`[data-square="${to}"]`).boundingBox())!;
  await page.mouse.move(fromBox.x + fromBox.width / 2, fromBox.y + fromBox.height / 2);
  await page.mouse.down();
  await page.mouse.move(toBox.x + toBox.width / 2, toBox.y + toBox.height / 2, { steps: 10 });
  await page.mouse.up();
}

async function waitForSettle(page: Page) {
  await page.waitForTimeout(400);
}

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
  await page.locator('[data-testid="graph-card"]').first().click();
  await expect(page.locator('[data-testid^="rf__node-"]').first()).toBeVisible({ timeout: 5000 });
}

test.beforeEach(async ({ page }) => {
  await resetAndEnterEditor(page);
});

test('undo reverts adding a move', async ({ page }) => {
  // Play e4
  await dragPiece(page, 'e2', 'e4');
  await expect(page.locator('[data-testid^="rf__node-"]')).toHaveCount(2);
  await waitForSettle(page);

  // Undo
  await page.keyboard.press('Meta+z');
  await waitForSettle(page);

  // Should be back to 1 node (root only)
  await expect(page.locator('[data-testid^="rf__node-"]')).toHaveCount(1);
});

test('redo restores an undone move', async ({ page }) => {
  // Play e4
  await dragPiece(page, 'e2', 'e4');
  await expect(page.locator('[data-testid^="rf__node-"]')).toHaveCount(2);
  await waitForSettle(page);

  // Undo
  await page.keyboard.press('Meta+z');
  await waitForSettle(page);
  await expect(page.locator('[data-testid^="rf__node-"]')).toHaveCount(1);

  // Redo
  await page.keyboard.press('Meta+Shift+z');
  await waitForSettle(page);

  // Should be back to 2 nodes
  await expect(page.locator('[data-testid^="rf__node-"]')).toHaveCount(2);
});

test('undo reverts deleting a node', async ({ page }) => {
  // Play e4
  await dragPiece(page, 'e2', 'e4');
  await expect(page.locator('[data-testid^="rf__node-"]')).toHaveCount(2);
  await waitForSettle(page);

  // Delete e4 via context menu
  const nodes = page.locator('[data-testid^="rf__node-"]');
  await nodes.nth(1).click({ button: 'right' });
  await page.locator('.fixed.z-50 button.text-red-400').click();
  await expect(page.locator('[data-testid^="rf__node-"]')).toHaveCount(1);
  await waitForSettle(page);

  // Undo should restore e4
  await page.keyboard.press('Meta+z');
  await waitForSettle(page);
  await expect(page.locator('[data-testid^="rf__node-"]')).toHaveCount(2);
});

test('undo reverts clearing the graph', async ({ page }) => {
  // Play e4 → e5
  await dragPiece(page, 'e2', 'e4');
  await expect(page.locator('[data-testid^="rf__node-"]')).toHaveCount(2);
  await dragPiece(page, 'e7', 'e5');
  await expect(page.locator('[data-testid^="rf__node-"]')).toHaveCount(3);
  await waitForSettle(page);

  // Clear graph
  await page.getByRole('button', { name: 'Clear', exact: true }).click();
  await page.locator('.bg-red-600').click();
  await expect(page.locator('[data-testid^="rf__node-"]')).toHaveCount(1);
  await waitForSettle(page);

  // Undo should restore all nodes
  await page.keyboard.press('Meta+z');
  await waitForSettle(page);
  await expect(page.locator('[data-testid^="rf__node-"]')).toHaveCount(3);
});

test('new action clears redo stack', async ({ page }) => {
  // Play e4
  await dragPiece(page, 'e2', 'e4');
  await expect(page.locator('[data-testid^="rf__node-"]')).toHaveCount(2);
  await waitForSettle(page);

  // Undo
  await page.keyboard.press('Meta+z');
  await waitForSettle(page);
  await expect(page.locator('[data-testid^="rf__node-"]')).toHaveCount(1);

  // Play d4 instead (new action should clear redo stack)
  await dragPiece(page, 'd2', 'd4');
  await expect(page.locator('[data-testid^="rf__node-"]')).toHaveCount(2);
  await waitForSettle(page);

  // Redo should do nothing (stack cleared)
  await page.keyboard.press('Meta+Shift+z');
  await waitForSettle(page);
  await expect(page.locator('[data-testid^="rf__node-"]')).toHaveCount(2);
});

test('undo/redo buttons are in the toolbar', async ({ page }) => {
  const undoBtn = page.getByRole('button', { name: 'Undo' });
  const redoBtn = page.getByRole('button', { name: 'Redo' });

  // Both should be visible but disabled initially
  await expect(undoBtn).toBeVisible();
  await expect(redoBtn).toBeVisible();
  await expect(undoBtn).toBeDisabled();
  await expect(redoBtn).toBeDisabled();

  // Play e4 — undo should become enabled
  await dragPiece(page, 'e2', 'e4');
  await expect(page.locator('[data-testid^="rf__node-"]')).toHaveCount(2);
  await waitForSettle(page);
  await expect(undoBtn).toBeEnabled();

  // Click undo button
  await undoBtn.click();
  await waitForSettle(page);
  await expect(page.locator('[data-testid^="rf__node-"]')).toHaveCount(1);
  await expect(redoBtn).toBeEnabled();
});
