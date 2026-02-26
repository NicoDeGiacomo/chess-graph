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

test.beforeEach(async ({ page }) => {
  await resetAndEnterEditor(page);
});

test('transposition creates edge instead of duplicate node', async ({ page }) => {
  // Play 1. e4 e5 2. Nf3
  await dragPiece(page, 'e2', 'e4');
  await expect(page.locator('[data-testid^="rf__node-"]')).toHaveCount(2);
  await dragPiece(page, 'e7', 'e5');
  await expect(page.locator('[data-testid^="rf__node-"]')).toHaveCount(3);
  await dragPiece(page, 'g1', 'f3');
  await expect(page.locator('[data-testid^="rf__node-"]')).toHaveCount(4);
  await waitForSettle(page);

  // Go back to root
  await page.locator('.react-flow__node').first().click({ force: true });
  await waitForSettle(page);

  // Play 1. Nf3
  await dragPiece(page, 'g1', 'f3');
  await expect(page.locator('[data-testid^="rf__node-"]')).toHaveCount(5);
  await waitForSettle(page);

  // Play 1... e5
  await dragPiece(page, 'e7', 'e5');
  await expect(page.locator('[data-testid^="rf__node-"]')).toHaveCount(6);
  await waitForSettle(page);

  // Play 2. e4 — this should transpose to the existing position after 1. e4 e5 2. Nf3
  // No new node should be created (still 6 nodes)
  await dragPiece(page, 'e2', 'e4');
  await expect(page.locator('[data-testid^="rf__node-"]')).toHaveCount(6);

  // An orange transposition edge should appear (animated edge with amber stroke)
  const transEdge = page.locator('.react-flow__edge.animated');
  await expect(transEdge.first()).toBeVisible();
});

test('transposition edge shows move label', async ({ page }) => {
  // Play 1. e4 e5 2. Nf3
  await dragPiece(page, 'e2', 'e4');
  await dragPiece(page, 'e7', 'e5');
  await dragPiece(page, 'g1', 'f3');
  await expect(page.locator('[data-testid^="rf__node-"]')).toHaveCount(4);
  await waitForSettle(page);

  // Go back to root
  await page.locator('.react-flow__node').first().click({ force: true });
  await waitForSettle(page);

  // Play 1. Nf3 e5 2. e4 (transposition)
  await dragPiece(page, 'g1', 'f3');
  await dragPiece(page, 'e7', 'e5');
  await dragPiece(page, 'e2', 'e4');
  await waitForSettle(page);

  // The edge label "e4" should be visible on the graph
  const edgeLabel = page.locator('.react-flow__edge-textwrapper');
  await expect(edgeLabel.first()).toBeVisible();
});

test('board shows correct position after clicking transposition target', async ({ page }) => {
  // Build transposition: 1. e4 e5 2. Nf3 via two move orders
  await dragPiece(page, 'e2', 'e4');
  await dragPiece(page, 'e7', 'e5');
  await dragPiece(page, 'g1', 'f3');
  await expect(page.locator('[data-testid^="rf__node-"]')).toHaveCount(4);
  await waitForSettle(page);

  // Go back to root, play 1. Nf3 e5 2. e4
  await page.locator('.react-flow__node').first().click({ force: true });
  await waitForSettle(page);
  await dragPiece(page, 'g1', 'f3');
  await dragPiece(page, 'e7', 'e5');
  await dragPiece(page, 'e2', 'e4');
  await waitForSettle(page);

  // After the transposition move, the board should show Nf3 on f3
  // The FEN should contain the Nf3 position (knight on f3)
  await expect(page.locator('text=PPPP1PPP/RNBQKB1R')).toBeVisible();
});

test('clicking transposition in details panel navigates to target node', async ({ page }) => {
  // Build transposition: 1. e4 e5 2. Nf3 via two move orders
  await dragPiece(page, 'e2', 'e4');
  await dragPiece(page, 'e7', 'e5');
  await dragPiece(page, 'g1', 'f3');
  await expect(page.locator('[data-testid^="rf__node-"]')).toHaveCount(4);
  await waitForSettle(page);

  // Go back to root, play 1. Nf3 e5 2. e4 (transposition)
  await page.locator('.react-flow__node').first().click({ force: true });
  await waitForSettle(page);
  await dragPiece(page, 'g1', 'f3');
  await dragPiece(page, 'e7', 'e5');
  await dragPiece(page, 'e2', 'e4');
  await expect(page.locator('[data-testid^="rf__node-"]')).toHaveCount(6);
  await waitForSettle(page);

  // After transposition, selection moves to the target node.
  // Find the source node (which has outgoing transposition edges) by clicking graph nodes.
  const graphNodes = page.locator('.react-flow__node');
  const count = await graphNodes.count();
  for (let i = 0; i < count; i++) {
    await graphNodes.nth(i).click({ force: true });
    await page.waitForTimeout(200);
    if (await page.getByText('Transpositions').isVisible()) break;
  }

  // The details panel should show a yellow transposition button
  const transButton = page.locator('button.text-yellow-400');
  await expect(transButton.first()).toBeVisible();

  // Capture current FEN before clicking
  const fenBefore = await page.locator('.font-mono.select-all').textContent();

  // Click the transposition button to navigate to the target node
  await transButton.first().click();
  await waitForSettle(page);

  // FEN should have changed (we navigated to the target node)
  const fenAfter = await page.locator('.font-mono.select-all').textContent();
  expect(fenAfter).not.toBe(fenBefore);
});

test('delete target node cleans up transposition edges', async ({ page }) => {
  // Build transposition
  await dragPiece(page, 'e2', 'e4');
  await dragPiece(page, 'e7', 'e5');
  await dragPiece(page, 'g1', 'f3');
  await expect(page.locator('[data-testid^="rf__node-"]')).toHaveCount(4);
  await waitForSettle(page);

  await page.locator('.react-flow__node').first().click({ force: true });
  await waitForSettle(page);

  await dragPiece(page, 'g1', 'f3');
  await dragPiece(page, 'e7', 'e5');
  await dragPiece(page, 'e2', 'e4');
  await expect(page.locator('[data-testid^="rf__node-"]')).toHaveCount(6);
  await waitForSettle(page);

  // Verify transposition edge exists
  const transEdgeBefore = page.locator('.react-flow__edge.animated');
  await expect(transEdgeBefore.first()).toBeVisible();

  // Delete the e4 node in the first branch (target of transposition)
  // First, go to root and then navigate to the first e4 child
  await page.locator('.react-flow__node').first().click({ force: true });
  await waitForSettle(page);
  await page.keyboard.press('ArrowRight');
  await waitForSettle(page);

  // Right-click to delete
  const selectedNode = page.locator('.react-flow__node').filter({ has: page.locator('.ring-2') }).first();
  await selectedNode.click({ button: 'right' });
  await page.locator('.fixed.z-50 button.text-red-400').click();
  await waitForSettle(page);

  // The transposition edge should be gone (the target was deleted along with its subtree)
  const transEdgeAfter = page.locator('.react-flow__edge.animated');
  await expect(transEdgeAfter).toHaveCount(0);
});
