import { test, expect, type Page } from '@playwright/test';

/** Drag a chess piece from one square to another using mouse API */
async function dragPiece(page: Page, from: string, to: string) {
  const fromBox = (await page.locator(`[data-square="${from}"]`).boundingBox())!;
  const toBox = (await page.locator(`[data-square="${to}"]`).boundingBox())!;
  await page.mouse.move(fromBox.x + fromBox.width / 2, fromBox.y + fromBox.height / 2);
  await page.mouse.down();
  await page.mouse.move(toBox.x + toBox.width / 2, toBox.y + toBox.height / 2, { steps: 10 });
  await page.mouse.up();
}

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
  await page.locator('button.bg-zinc-900').first().click();
  await expect(page.locator('[data-testid^="rf__node-"]').first()).toBeVisible({ timeout: 5000 });
}

/** Right-click drag from one square to another to draw an arrow */
async function drawArrow(page: Page, from: string, to: string) {
  const fromBox = (await page.locator(`[data-square="${from}"]`).boundingBox())!;
  const toBox = (await page.locator(`[data-square="${to}"]`).boundingBox())!;
  await page.mouse.move(fromBox.x + fromBox.width / 2, fromBox.y + fromBox.height / 2);
  await page.mouse.down({ button: 'right' });
  await page.mouse.move(toBox.x + toBox.width / 2, toBox.y + toBox.height / 2, { steps: 10 });
  await page.mouse.up({ button: 'right' });
}

/** Count arrow path elements in the chessboard arrow SVG overlay */
async function countArrowPaths(page: Page): Promise<number> {
  return page.locator('svg[style*="pointer-events"] path[stroke]').count();
}

/** Read arrows from IndexedDB for root or child node */
async function getNodeArrows(page: Page, type: 'root' | 'child'): Promise<unknown[]> {
  return page.evaluate(async (nodeType) => {
    return new Promise<unknown[]>((resolve, reject) => {
      const req = indexedDB.open('chess-graph');
      req.onerror = () => reject(req.error);
      req.onsuccess = () => {
        const db = req.result;
        const tx = db.transaction('nodes', 'readonly');
        const store = tx.objectStore('nodes');
        const getAll = store.getAll();
        getAll.onsuccess = () => {
          const nodes = getAll.result as Array<{ parentId: string | null; arrows: unknown[] }>;
          const node = nodeType === 'root'
            ? nodes.find((n) => n.parentId === null)
            : nodes.find((n) => n.parentId !== null);
          resolve(node?.arrows ?? []);
        };
        getAll.onerror = () => reject(getAll.error);
      };
    });
  }, type);
}

test.beforeEach(async ({ page }) => {
  await resetAndEnterEditor(page);
});

// ─── Arrows ─────────────────────────────────────────────────────────

test('right-click drag draws arrow on board', async ({ page }) => {
  await drawArrow(page, 'e2', 'e4');
  await waitForSettle(page);

  // Arrow path should be attached in the DOM (SVG overlay has pointer-events: none so path is "hidden" per Playwright)
  const arrowPaths = page.locator('svg[style*="pointer-events"] path[stroke]');
  await expect(arrowPaths.first()).toBeAttached();
});

test('arrows persist after switching nodes and returning', async ({ page }) => {
  // Draw an arrow on root
  await drawArrow(page, 'e2', 'e4');
  await waitForSettle(page);

  const initialCount = await countArrowPaths(page);
  expect(initialCount).toBeGreaterThanOrEqual(1);

  // Play a move to create and select a new node
  await dragPiece(page, 'e2', 'e4');
  await expect(page.locator('[data-testid^="rf__node-"]')).toHaveCount(2);
  await waitForSettle(page);

  // Go back to root
  await page.locator('.react-flow__node').first().click({ force: true });
  await waitForSettle(page);

  // Arrow SVG should still have paths
  const count = await countArrowPaths(page);
  expect(count).toBeGreaterThanOrEqual(1);
});

test('arrows persist in IndexedDB after page reload', async ({ page }) => {
  await drawArrow(page, 'e2', 'e4');
  await waitForSettle(page);

  // Verify arrow was saved to IndexedDB before reload
  const arrowsBefore = await getNodeArrows(page, 'root');
  expect(arrowsBefore.length).toBeGreaterThanOrEqual(1);

  await page.reload();
  await expect(page.locator('[data-testid^="rf__node-"]').first()).toBeVisible({ timeout: 5000 });

  // Verify arrow data is still in IndexedDB after reload
  const arrowsAfter = await getNodeArrows(page, 'root');
  expect(arrowsAfter.length).toBeGreaterThanOrEqual(1);
});

test('arrows are per-node in IndexedDB', async ({ page }) => {
  // Draw an arrow on root
  await drawArrow(page, 'e2', 'e4');
  await waitForSettle(page);

  // Play a move to create a new node
  await dragPiece(page, 'e2', 'e4');
  await expect(page.locator('[data-testid^="rf__node-"]')).toHaveCount(2);
  await waitForSettle(page);

  // Verify root node has arrows in IndexedDB
  const rootArrows = await getNodeArrows(page, 'root');
  expect(rootArrows.length).toBeGreaterThanOrEqual(1);

  // Verify the new child node has no arrows
  const childArrows = await getNodeArrows(page, 'child');
  expect(childArrows.length).toBe(0);
});

// ─── Square Highlights ──────────────────────────────────────────────

test('right-click square highlights it orange', async ({ page }) => {
  const e4Box = (await page.locator('[data-square="e4"]').boundingBox())!;

  // Right-click on e4
  await page.mouse.click(e4Box.x + e4Box.width / 2, e4Box.y + e4Box.height / 2, { button: 'right' });
  await waitForSettle(page);

  // squareStyles are applied to the inner div inside the square
  const innerDiv = page.locator('[data-square="e4"] > div');
  await expect(innerDiv).toHaveCSS('background-color', 'rgba(255, 170, 0, 0.8)');
});

test('shift+right-click highlights green', async ({ page }) => {
  const e4Box = (await page.locator('[data-square="e4"]').boundingBox())!;

  await page.keyboard.down('Shift');
  await page.mouse.click(e4Box.x + e4Box.width / 2, e4Box.y + e4Box.height / 2, { button: 'right' });
  await page.keyboard.up('Shift');
  await waitForSettle(page);

  const innerDiv = page.locator('[data-square="e4"] > div');
  await expect(innerDiv).toHaveCSS('background-color', 'rgba(76, 175, 80, 0.8)');
});

test('ctrl+right-click highlights red', async ({ page }) => {
  const e4Box = (await page.locator('[data-square="e4"]').boundingBox())!;

  await page.keyboard.down('Control');
  await page.mouse.click(e4Box.x + e4Box.width / 2, e4Box.y + e4Box.height / 2, { button: 'right' });
  await page.keyboard.up('Control');
  await waitForSettle(page);

  const innerDiv = page.locator('[data-square="e4"] > div');
  await expect(innerDiv).toHaveCSS('background-color', 'rgba(244, 67, 54, 0.8)');
});

test('right-click same color removes the highlight', async ({ page }) => {
  const e4Box = (await page.locator('[data-square="e4"]').boundingBox())!;

  // Click once to highlight
  await page.mouse.click(e4Box.x + e4Box.width / 2, e4Box.y + e4Box.height / 2, { button: 'right' });
  await waitForSettle(page);

  // Click again to remove
  await page.mouse.click(e4Box.x + e4Box.width / 2, e4Box.y + e4Box.height / 2, { button: 'right' });
  await waitForSettle(page);

  // Should not have the orange highlight anymore — inner div should not have orange bg
  const innerDiv = page.locator('[data-square="e4"] > div');
  const bg = await innerDiv.evaluate((el) => getComputedStyle(el).backgroundColor);
  expect(bg).not.toBe('rgba(255, 170, 0, 0.8)');
});

test('highlights persist after reload', async ({ page }) => {
  const e4Box = (await page.locator('[data-square="e4"]').boundingBox())!;

  await page.mouse.click(e4Box.x + e4Box.width / 2, e4Box.y + e4Box.height / 2, { button: 'right' });
  await waitForSettle(page);

  await page.reload();
  await expect(page.locator('[data-testid^="rf__node-"]').first()).toBeVisible({ timeout: 5000 });

  const innerDiv = page.locator('[data-square="e4"] > div');
  await expect(innerDiv).toHaveCSS('background-color', 'rgba(255, 170, 0, 0.8)');
});

// ─── Clear Annotations Button ────────────────────────────────────────

test('clear button removes highlights and arrows', async ({ page }) => {
  // Highlight a square
  const e4Box = (await page.locator('[data-square="e4"]').boundingBox())!;
  await page.mouse.click(e4Box.x + e4Box.width / 2, e4Box.y + e4Box.height / 2, { button: 'right' });
  await waitForSettle(page);

  // Draw an arrow
  await drawArrow(page, 'd2', 'd4');
  await waitForSettle(page);

  // Verify annotations exist
  const innerDiv = page.locator('[data-square="e4"] > div');
  await expect(innerDiv).toHaveCSS('background-color', 'rgba(255, 170, 0, 0.8)');

  // Click clear button
  const clearBtn = page.getByRole('button', { name: 'Clear annotations' });
  await clearBtn.click();
  await waitForSettle(page);

  // Highlight should be gone
  const bg = await page.locator('[data-square="e4"] > div').evaluate((el) => getComputedStyle(el).backgroundColor);
  expect(bg).not.toBe('rgba(255, 170, 0, 0.8)');

  // Arrows should be gone from IndexedDB
  const arrows = await getNodeArrows(page, 'root');
  expect(arrows.length).toBe(0);
});

test('clear button is disabled when no annotations exist', async ({ page }) => {
  const clearBtn = page.getByRole('button', { name: 'Clear annotations' });
  await expect(clearBtn).toHaveClass(/opacity-30/);
});

// ─── Right-Click Clears Selection ────────────────────────────────────

test('right-click clears piece selection', async ({ page }) => {
  // Click on e2 pawn to select it (blue highlight)
  await page.locator('[data-square="e2"]').click();
  await waitForSettle(page);

  // Verify blue selection highlight
  const innerDiv = page.locator('[data-square="e2"] > div');
  await expect(innerDiv).toHaveCSS('background-color', 'rgba(59, 130, 246, 0.4)');

  // Right-click on d4 to paint it
  const d4Box = (await page.locator('[data-square="d4"]').boundingBox())!;
  await page.mouse.click(d4Box.x + d4Box.width / 2, d4Box.y + d4Box.height / 2, { button: 'right' });
  await waitForSettle(page);

  // The blue selection on e2 should be gone
  const e2Bg = await page.locator('[data-square="e2"] > div').evaluate((el) => getComputedStyle(el).backgroundColor);
  expect(e2Bg).not.toBe('rgba(59, 130, 246, 0.4)');
});
