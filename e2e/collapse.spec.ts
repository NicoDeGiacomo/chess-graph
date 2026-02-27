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

test('double-click collapses children and shows badge', async ({ page }) => {
  // Build a line: root → e4 → e5
  await dragPiece(page, 'e2', 'e4');
  await expect(page.locator('[data-testid^="rf__node-"]')).toHaveCount(2);
  await dragPiece(page, 'e7', 'e5');
  await expect(page.locator('[data-testid^="rf__node-"]')).toHaveCount(3);
  await waitForSettle(page);

  // Double-click root node to collapse
  await page.locator('.react-flow__node').first().dblclick({ force: true });
  await waitForSettle(page);

  // Only root should be visible
  await expect(page.locator('[data-testid^="rf__node-"]')).toHaveCount(1);

  // Badge should show +2 (2 hidden descendants)
  await expect(page.locator('[data-testid="collapse-badge"]')).toHaveText('+2');
});

test('double-click expands collapsed node', async ({ page }) => {
  // Build a line: root → e4
  await dragPiece(page, 'e2', 'e4');
  await expect(page.locator('[data-testid^="rf__node-"]')).toHaveCount(2);
  await waitForSettle(page);

  // Collapse root
  await page.locator('.react-flow__node').first().dblclick({ force: true });
  await waitForSettle(page);
  await expect(page.locator('[data-testid^="rf__node-"]')).toHaveCount(1);

  // Double-click again to expand
  await page.locator('.react-flow__node').first().dblclick({ force: true });
  await waitForSettle(page);

  // Both nodes should be visible again
  await expect(page.locator('[data-testid^="rf__node-"]')).toHaveCount(2);

  // Badge should not be visible
  await expect(page.locator('[data-testid="collapse-badge"]')).toHaveCount(0);
});

test('collapse hides deep descendants', async ({ page }) => {
  // Build a deeper line: root → e4 → e5 → Nf3
  await dragPiece(page, 'e2', 'e4');
  await expect(page.locator('[data-testid^="rf__node-"]')).toHaveCount(2);
  await dragPiece(page, 'e7', 'e5');
  await expect(page.locator('[data-testid^="rf__node-"]')).toHaveCount(3);
  await dragPiece(page, 'g1', 'f3');
  await expect(page.locator('[data-testid^="rf__node-"]')).toHaveCount(4);
  await waitForSettle(page);

  // Collapse e4 (second node) — should hide e5 and Nf3
  // First, click e4 to select it
  await page.locator('.react-flow__node').nth(1).click({ force: true });
  await waitForSettle(page);

  // Double-click e4 to collapse
  await page.locator('.react-flow__node').nth(1).dblclick({ force: true });
  await waitForSettle(page);

  // Should see root + e4 only
  await expect(page.locator('[data-testid^="rf__node-"]')).toHaveCount(2);

  // Badge on e4 should show +2
  await expect(page.locator('[data-testid="collapse-badge"]')).toHaveText('+2');
});

test('collapsing node with selected descendant selects the collapsed node', async ({ page }) => {
  // Build: root → e4 → e5
  await dragPiece(page, 'e2', 'e4');
  await expect(page.locator('[data-testid^="rf__node-"]')).toHaveCount(2);
  await dragPiece(page, 'e7', 'e5');
  await expect(page.locator('[data-testid^="rf__node-"]')).toHaveCount(3);
  await waitForSettle(page);

  // e5 is currently selected (last played move)
  // Double-click root to collapse — should select root since e5 is a descendant
  await page.locator('.react-flow__node').first().dblclick({ force: true });
  await waitForSettle(page);

  // FEN should show starting position (root selected)
  await expect(page.locator('text=8/8/PPPPPPPP')).toBeVisible();
});
