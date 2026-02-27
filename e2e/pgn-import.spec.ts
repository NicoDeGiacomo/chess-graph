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

/** The dialog heading used to confirm the dialog is open */
const dialogHeading = (page: Page) => page.getByRole('heading', { name: 'Import PGN' });

/** Open the Import PGN dialog, paste text, and click Import */
async function importPgn(page: Page, pgn: string) {
  await page.getByTestId('import-pgn-btn').click();
  await expect(dialogHeading(page)).toBeVisible();
  await page.getByTestId('pgn-textarea').fill(pgn);
  await page.getByTestId('pgn-import-btn').click();
  // Wait for import result to appear
  await expect(page.getByTestId('pgn-import-result')).toBeVisible({ timeout: 5000 });
}

test.beforeEach(async ({ page }) => {
  await resetAndEnterEditor(page);
});

// ─── Basic Import ───────────────────────────────────────────────────

test('paste simple mainline creates nodes', async ({ page }) => {
  await importPgn(page, '1. e4 e5 2. Nf3 Nc6 *');

  // Should show import result
  await expect(page.getByTestId('pgn-import-result')).toContainText('4 new nodes');

  // Close dialog
  await page.getByTestId('pgn-done-btn').click();
  await expect(dialogHeading(page)).not.toBeVisible();
  await waitForSettle(page);

  // 5 nodes in graph (root + e4 + e5 + Nf3 + Nc6)
  await expect(page.locator('[data-testid^="rf__node-"]')).toHaveCount(5);
});

test('paste PGN with RAVs creates branches', async ({ page }) => {
  await importPgn(page, '1. e4 e5 (1... c5) 2. Nf3 *');

  await expect(page.getByTestId('pgn-import-result')).toContainText('4 new nodes');

  await page.getByTestId('pgn-done-btn').click();
  await waitForSettle(page);

  // 5 nodes: root + e4 + e5 + c5 + Nf3
  await expect(page.locator('[data-testid^="rf__node-"]')).toHaveCount(5);
});

// ─── File Upload ────────────────────────────────────────────────────

test('file upload imports PGN', async ({ page }) => {
  await page.getByTestId('import-pgn-btn').click();
  await expect(dialogHeading(page)).toBeVisible();

  // Upload file via the hidden input
  const fileInput = page.getByTestId('pgn-file-input');
  await fileInput.setInputFiles({
    name: 'test.pgn',
    mimeType: 'text/plain',
    buffer: Buffer.from('1. e4 e5 2. Nf3 *'),
  });

  // Textarea should be populated
  await expect(page.getByTestId('pgn-textarea')).toHaveValue('1. e4 e5 2. Nf3 *');

  // Import
  await page.getByTestId('pgn-import-btn').click();
  await expect(page.getByTestId('pgn-import-result')).toBeVisible({ timeout: 5000 });
  await expect(page.getByTestId('pgn-import-result')).toContainText('3 new nodes');

  await page.getByTestId('pgn-done-btn').click();
  await waitForSettle(page);

  await expect(page.locator('[data-testid^="rf__node-"]')).toHaveCount(4);
});

// ─── Comments ───────────────────────────────────────────────────────

test('comments appear on imported nodes', async ({ page }) => {
  await importPgn(page, '1. e4 {Best by test} *');

  await page.getByTestId('pgn-done-btn').click();
  await waitForSettle(page);

  // Click the e4 node to select it
  const nodes = page.locator('[data-testid^="rf__node-"]');
  await nodes.nth(1).click({ force: true });
  await waitForSettle(page);

  // Comment should be visible in the details panel
  await expect(page.getByText('Best by test')).toBeVisible();
});

// ─── Merge With Existing ────────────────────────────────────────────

test('import merges with existing moves', async ({ page }) => {
  // First import
  await importPgn(page, '1. e4 e5 *');
  await page.getByTestId('pgn-done-btn').click();
  await waitForSettle(page);
  await expect(page.locator('[data-testid^="rf__node-"]')).toHaveCount(3);

  // Second import with overlapping + new moves
  await importPgn(page, '1. e4 e5 2. Nf3 *');
  await expect(page.getByTestId('pgn-import-result')).toContainText('merged');
  await page.getByTestId('pgn-done-btn').click();
  await waitForSettle(page);

  // 4 nodes: root + e4 + e5 + Nf3 (e4, e5 reused)
  await expect(page.locator('[data-testid^="rf__node-"]')).toHaveCount(4);
});

// ─── Undo ───────────────────────────────────────────────────────────

test('undo reverts entire import', async ({ page }) => {
  await importPgn(page, '1. e4 e5 2. Nf3 *');
  await page.getByTestId('pgn-done-btn').click();
  await waitForSettle(page);

  await expect(page.locator('[data-testid^="rf__node-"]')).toHaveCount(4);

  // Undo (Ctrl+Z)
  await page.keyboard.press('Control+z');
  await waitForSettle(page);

  // Should be back to just root
  await expect(page.locator('[data-testid^="rf__node-"]')).toHaveCount(1);
});

// ─── Invalid PGN ────────────────────────────────────────────────────

test('invalid PGN shows error info', async ({ page }) => {
  await importPgn(page, '1. e4 Zz9 *');

  // Should show errors
  await expect(page.getByTestId('pgn-toggle-errors')).toBeVisible();
  await page.getByTestId('pgn-toggle-errors').click();
  await expect(page.getByTestId('pgn-error-list')).toBeVisible();

  await page.getByTestId('pgn-done-btn').click();
});

// ─── Dialog Cancellation ────────────────────────────────────────────

test('dialog cancellation does not import', async ({ page }) => {
  await page.getByTestId('import-pgn-btn').click();
  await expect(dialogHeading(page)).toBeVisible();
  await page.getByTestId('pgn-textarea').fill('1. e4 e5 *');

  // Click Cancel
  await page.getByRole('button', { name: 'Cancel' }).click();
  await expect(dialogHeading(page)).not.toBeVisible();
  await waitForSettle(page);

  // Should still be just root
  await expect(page.locator('[data-testid^="rf__node-"]')).toHaveCount(1);
});

test('Escape closes dialog without importing', async ({ page }) => {
  await page.getByTestId('import-pgn-btn').click();
  await expect(dialogHeading(page)).toBeVisible();

  await page.keyboard.press('Escape');
  await expect(dialogHeading(page)).not.toBeVisible();
});
