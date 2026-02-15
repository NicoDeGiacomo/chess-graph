import { test, expect, type Page } from '@playwright/test';

/** Drag a chess piece from one square to another using mouse API (dnd-kit needs real mouse events) */
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
  // Properly await IndexedDB deletion
  await page.evaluate(() => new Promise<void>((resolve, reject) => {
    const req = indexedDB.deleteDatabase('chess-graph');
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
    req.onblocked = () => resolve(); // proceed even if blocked
  }));
  await page.reload();
  // Wait for All Graphs page to load with at least one card
  await expect(page.getByText('My Repertoires')).toBeVisible();
  // Click the first repertoire card to enter the editor
  await page.locator('button.bg-zinc-900').first().click();
  // Wait for the editor to load (graph node visible)
  await expect(page.locator('[data-testid^="rf__node-"]').first()).toBeVisible({ timeout: 5000 });
}

test.beforeEach(async ({ page }) => {
  await resetAndEnterEditor(page);
});

// ─── App Initialization ──────────────────────────────────────────────

test('loads app with default repertoire and creates a child node via drag', async ({ page }) => {
  // Root node visible in graph
  await expect(page.locator('[data-testid^="rf__node-"]').first()).toBeVisible();

  // Chessboard rendered
  await expect(page.locator('[data-square="e2"]')).toBeVisible();

  // Drag e2 to e4
  await dragPiece(page, 'e2', 'e4');

  // 2 nodes in graph (root + e4)
  await expect(page.locator('[data-testid^="rf__node-"]')).toHaveCount(2);
});

test('default repertoire is not named "New Opening"', async ({ page }) => {
  // The repertoire name is shown in the EditorTopBar
  const nameSpan = page.locator('.font-medium').first();
  const name = await nameSpan.textContent();
  expect(name).not.toBe('New Opening');
});

test('graph nodes are draggable', async ({ page }) => {
  const rootNode = page.locator('[data-testid^="rf__node-"]').first();
  await expect(rootNode).toBeVisible();

  const classList = await rootNode.getAttribute('class');
  expect(classList).toContain('draggable');
});

test('edges have arrow markers', async ({ page }) => {
  await dragPiece(page, 'e2', 'e4');
  await expect(page.locator('[data-testid^="rf__node-"]')).toHaveCount(2);

  const markers = page.locator('.react-flow__edges marker');
  await expect(markers.first()).toBeAttached();
});

// ─── Move Creation ───────────────────────────────────────────────────

test('plays multiple moves building a line (e4 e5 Nf3)', async ({ page }) => {
  await dragPiece(page, 'e2', 'e4');
  await expect(page.locator('[data-testid^="rf__node-"]')).toHaveCount(2);

  await dragPiece(page, 'e7', 'e5');
  await expect(page.locator('[data-testid^="rf__node-"]')).toHaveCount(3);

  await dragPiece(page, 'g1', 'f3');
  await expect(page.locator('[data-testid^="rf__node-"]')).toHaveCount(4);
});

test('clicking a graph node selects it and updates FEN', async ({ page }) => {
  // Play e4 — auto-selected after creation
  await dragPiece(page, 'e2', 'e4');
  await expect(page.locator('[data-testid^="rf__node-"]')).toHaveCount(2);
  await waitForSettle(page);

  // FEN should show e4 position (contains "4P3")
  await expect(page.locator('text=4P3')).toBeVisible();

  // Click the root node by its visible text (repertoire name)
  await page.locator('.react-flow__node').first().click({ force: true });
  await waitForSettle(page);

  // FEN should now show starting position (full starting FEN without e4)
  await expect(page.locator('text=8/8/PPPPPPPP')).toBeVisible();
});

test('same move from same position does not create duplicate node', async ({ page }) => {
  await dragPiece(page, 'e2', 'e4');
  await expect(page.locator('[data-testid^="rf__node-"]')).toHaveCount(2);
  await waitForSettle(page);

  // Click root node to go back
  await page.locator('.react-flow__node').first().click({ force: true });
  await waitForSettle(page);

  // Play e4 again from root — should navigate to existing node, not create duplicate
  await dragPiece(page, 'e2', 'e4');
  await expect(page.locator('[data-testid^="rf__node-"]')).toHaveCount(2);
});

test('branching: two different moves from same position', async ({ page }) => {
  // Play e4
  await dragPiece(page, 'e2', 'e4');
  await expect(page.locator('[data-testid^="rf__node-"]')).toHaveCount(2);
  await waitForSettle(page);

  // Go back to root by clicking on the root graph node
  await page.locator('.react-flow__node').first().click({ force: true });
  await waitForSettle(page);

  // Verify we're back at starting position (white to move — d2 pawn should be draggable)
  await expect(page.locator('text=8/8/PPPPPPPP')).toBeVisible();

  // Play d4 from root — creates a branch
  await dragPiece(page, 'd2', 'd4');
  await expect(page.locator('[data-testid^="rf__node-"]')).toHaveCount(3);
});

// ─── Repertoire Management ───────────────────────────────────────────

test('no duplicate nodes after switching repertoires via All Graphs', async ({ page }) => {
  await dragPiece(page, 'e2', 'e4');
  await expect(page.locator('[data-testid^="rf__node-"]')).toHaveCount(2);

  // Wait for DB write to flush
  await page.waitForTimeout(800);

  // Go back to All Graphs
  await page.getByText('Back').click();
  await expect(page.getByText('My Repertoires')).toBeVisible();

  // Create a second repertoire
  await page.getByRole('button', { name: /New Repertoire/i }).click();
  await page.getByPlaceholder('Opening name...').fill('Sicilian');
  await page.getByRole('button', { name: 'Create' }).click();

  // Should navigate to editor with 1 root node
  await expect(page.locator('[data-testid^="rf__node-"]')).toHaveCount(1, { timeout: 5000 });

  // Go back and click the original repertoire (not the Sicilian)
  await page.getByText('Back').click();
  await expect(page.getByText('My Repertoires')).toBeVisible();
  await page.getByText('My Repertoire', { exact: true }).click();

  await expect(page.locator('[data-testid^="rf__node-"]')).toHaveCount(2, { timeout: 5000 });
});

test('create repertoire from All Graphs page', async ({ page }) => {
  // Go back to All Graphs
  await page.getByText('Back').click();
  await expect(page.getByText('My Repertoires')).toBeVisible();

  await page.getByRole('button', { name: /New Repertoire/i }).click();
  await page.getByPlaceholder('Opening name...').fill('Sicilian');
  await page.getByRole('button', { name: 'Create' }).click();

  // Should be in editor now
  await expect(page.locator('[data-testid^="rf__node-"]').first()).toBeVisible({ timeout: 5000 });

  // Go back — should see 2 cards
  await page.getByText('Back').click();
  await expect(page.locator('button.bg-zinc-900')).toHaveCount(2);
});

test('rename repertoire', async ({ page }) => {
  // Click Rename button
  await page.getByRole('button', { name: 'Rename' }).click();

  // The rename input should appear with current name
  const renameInput = page.locator('input').first();
  await expect(renameInput).toBeVisible();
  await renameInput.fill('Italian Game');

  // Press Enter to save
  await renameInput.press('Enter');
  await waitForSettle(page);

  // EditorTopBar should show new name
  await expect(page.locator('.font-medium').first()).toHaveText('Italian Game');
});

test('delete repertoire redirects to All Graphs', async ({ page }) => {
  // Create a second repertoire first
  await page.getByText('Back').click();
  await page.getByRole('button', { name: /New Repertoire/i }).click();
  await page.getByPlaceholder('Opening name...').fill('Temp');
  await page.getByRole('button', { name: 'Create' }).click();
  await expect(page.locator('[data-testid^="rf__node-"]').first()).toBeVisible({ timeout: 5000 });

  // Delete current repertoire (Temp)
  page.on('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Delete' }).click();

  // Should redirect to All Graphs
  await expect(page.getByText('My Repertoires')).toBeVisible();
  // Should see 1 remaining card
  await expect(page.locator('button.bg-zinc-900')).toHaveCount(1);
});

// ─── Node Details ────────────────────────────────────────────────────

test('node details show FEN for selected node', async ({ page }) => {
  // Starting position FEN should contain recognizable fragment
  await expect(page.locator('text=PPPPPPPP/RNBQKBNR w KQkq')).toBeVisible();
});

test('node details show move path after playing moves', async ({ page }) => {
  await dragPiece(page, 'e2', 'e4');
  await expect(page.locator('[data-testid^="rf__node-"]')).toHaveCount(2);

  // The move path badge should show "e4"
  await expect(page.locator('.font-mono').getByText('e4')).toBeVisible();
});

test('add and save a comment on a node', async ({ page }) => {
  // Click "Add" button for comment
  await page.getByRole('button', { name: 'Add' }).click();

  // Type a comment
  const textarea = page.locator('textarea');
  await expect(textarea).toBeVisible();
  await textarea.fill('This is the starting position');

  // Save
  await page.getByRole('button', { name: 'Save' }).click();

  // Comment should be visible
  await expect(page.getByText('This is the starting position')).toBeVisible();
});

// ─── Context Menu ────────────────────────────────────────────────────

test('right-click opens context menu on a node', async ({ page }) => {
  const rootNode = page.locator('[data-testid^="rf__node-"]').first();
  await rootNode.click({ button: 'right' });

  await expect(page.getByText('Edit Comment')).toBeVisible();
  await expect(page.getByText('Change Color')).toBeVisible();
  await expect(page.getByText('Link Transposition')).toBeVisible();
});

test('context menu allows changing node color', async ({ page }) => {
  // Make a move for a non-root node
  await dragPiece(page, 'e2', 'e4');
  await expect(page.locator('[data-testid^="rf__node-"]')).toHaveCount(2);

  // Right-click the e4 node
  const nodes = page.locator('[data-testid^="rf__node-"]');
  await nodes.nth(1).click({ button: 'right' });

  // Expand "Change Color"
  await page.getByText('Change Color').click();

  // Color buttons render as small squares with a title attribute
  const greenBtn = page.locator('button[title="Green"]');
  await expect(greenBtn).toBeVisible();
  await greenBtn.click();

  // Context menu should close
  await expect(page.getByText('Change Color')).not.toBeVisible();
});

test('context menu delete removes a node and its children', async ({ page }) => {
  // Build a line: e4 → e5
  await dragPiece(page, 'e2', 'e4');
  await expect(page.locator('[data-testid^="rf__node-"]')).toHaveCount(2);
  await dragPiece(page, 'e7', 'e5');
  await expect(page.locator('[data-testid^="rf__node-"]')).toHaveCount(3);

  // Right-click e4 node (middle of tree) and delete via the context menu button
  const nodes = page.locator('[data-testid^="rf__node-"]');
  await nodes.nth(1).click({ button: 'right' });

  // Use the context menu's Delete button (styled with text-red-400)
  await page.locator('.fixed.z-50 button.text-red-400').click();

  // Should be back to 1 node (root only — e4 and e5 both cascade-deleted)
  await expect(page.locator('[data-testid^="rf__node-"]')).toHaveCount(1);
});

test('context menu does not show delete for root node', async ({ page }) => {
  const rootNode = page.locator('[data-testid^="rf__node-"]').first();
  await rootNode.click({ button: 'right' });

  // "Edit Comment" should be visible
  await expect(page.getByText('Edit Comment')).toBeVisible();

  // Root context menu should not have a delete button (text-red-400 styled button)
  const deleteBtn = page.locator('.fixed.z-50 button.text-red-400');
  await expect(deleteBtn).toHaveCount(0);
});

test('context menu add tag', async ({ page }) => {
  const rootNode = page.locator('[data-testid^="rf__node-"]').first();
  await rootNode.click({ button: 'right' });

  // Click "Add Tag"
  await page.getByText('Add Tag').click();

  // Type a tag and press Enter
  const tagInput = page.getByPlaceholder('Tag name...');
  await expect(tagInput).toBeVisible();
  await tagInput.fill('mainline');
  await tagInput.press('Enter');

  // The tag should appear (visible in both graph node and details panel)
  await expect(page.getByText('mainline').first()).toBeVisible();
});

// ─── Persistence ─────────────────────────────────────────────────────

test('data persists after page reload', async ({ page }) => {
  await dragPiece(page, 'e2', 'e4');
  await expect(page.locator('[data-testid^="rf__node-"]')).toHaveCount(2);
  await waitForSettle(page);

  // Reload (without clearing DB) — stays on the editor route
  await page.reload();
  await expect(page.locator('[data-testid^="rf__node-"]').first()).toBeVisible({ timeout: 5000 });

  // Should still have 2 nodes
  await expect(page.locator('[data-testid^="rf__node-"]')).toHaveCount(2);
});

test('comment persists after page reload', async ({ page }) => {
  // Add a comment
  await page.getByRole('button', { name: 'Add' }).click();
  const textarea = page.locator('textarea');
  await textarea.fill('Test comment');
  await page.getByRole('button', { name: 'Save' }).click();
  await waitForSettle(page);

  // Reload — stays on the editor route
  await page.reload();
  await expect(page.locator('[data-testid^="rf__node-"]').first()).toBeVisible({ timeout: 5000 });

  // Comment should still be there
  await expect(page.getByText('Test comment')).toBeVisible();
});
