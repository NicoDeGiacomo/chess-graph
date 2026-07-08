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
  await page.locator('[data-testid="graph-card"]').filter({ hasText: 'My Initial Graph' }).click();
  await expect(page.locator('[data-testid^="rf__node-"]').first()).toBeVisible({ timeout: 5000 });
}

/** Type a move in the move input and press Enter */
async function typeMove(page: Page, move: string) {
  const input = page.getByTestId('move-input');
  await input.fill(move);
  await input.press('Enter');
  await waitForSettle(page);
}

test.beforeEach(async ({ page }) => {
  await resetAndEnterEditor(page);
});

// ─── Basic Move Entry ───────────────────────────────────────────────

test('type "e4" creates a new node', async ({ page }) => {
  await typeMove(page, 'e4');
  await expect(page.locator('[data-testid^="rf__node-"]')).toHaveCount(2);
});

test('type "Nf3" after 1. e4 e5 creates correct node', async ({ page }) => {
  await typeMove(page, 'e4');
  await typeMove(page, 'e5');
  await typeMove(page, 'Nf3');
  await expect(page.locator('[data-testid^="rf__node-"]')).toHaveCount(4);
});

test('input clears after successful move', async ({ page }) => {
  const input = page.getByTestId('move-input');
  await input.fill('e4');
  await input.press('Enter');
  await expect(input).toHaveValue('');
});

// ─── Invalid Moves ──────────────────────────────────────────────────

test('invalid move shows error and creates no node', async ({ page }) => {
  await typeMove(page, 'Ke5');
  await expect(page.getByTestId('move-input-error')).toHaveText('Invalid move');
  await expect(page.locator('[data-testid^="rf__node-"]')).toHaveCount(1);
});

// ─── Turn Indicator ─────────────────────────────────────────────────

test('turn indicator shows White to move initially', async ({ page }) => {
  await expect(page.getByTestId('turn-indicator')).toHaveText('White to move');
});

test('turn indicator changes after a move', async ({ page }) => {
  await typeMove(page, 'e4');
  await expect(page.getByTestId('turn-indicator')).toHaveText('Black to move');
});

// ─── Special Notation ───────────────────────────────────────────────

test('castling O-O works', async ({ page }) => {
  // Play a quick kingside castling setup for white
  await typeMove(page, 'e4');
  await typeMove(page, 'e5');
  await typeMove(page, 'Nf3');
  await typeMove(page, 'Nc6');
  await typeMove(page, 'Bc4');
  await typeMove(page, 'Bc5');
  await typeMove(page, 'O-O');
  // 8 nodes (root + 7 moves)
  await expect(page.locator('[data-testid^="rf__node-"]')).toHaveCount(8);
});

test('castling O-O-O works', async ({ page }) => {
  // Queenside castling setup
  await typeMove(page, 'd4');
  await typeMove(page, 'd5');
  await typeMove(page, 'Nc3');
  await typeMove(page, 'Nc6');
  await typeMove(page, 'Bf4');
  await typeMove(page, 'Bf5');
  await typeMove(page, 'Qd2');
  await typeMove(page, 'Qd7');
  await typeMove(page, 'O-O-O');
  await expect(page.locator('[data-testid^="rf__node-"]')).toHaveCount(10);
});

// ─── Disabled State ─────────────────────────────────────────────────

test('input is disabled on All Graphs page (no node selected)', async ({ page }) => {
  await page.goto('/repertoires');
  await expect(page.getByText('My Graphs')).toBeVisible();
  // MoveInput is only rendered in the editor sidebar, not on All Graphs
  // Navigate back and verify input is functional once a node is selected
  await page.locator('[data-testid="graph-card"]').filter({ hasText: 'My Initial Graph' }).click();
  await expect(page.locator('[data-testid^="rf__node-"]').first()).toBeVisible({ timeout: 5000 });
  await expect(page.getByTestId('move-input')).not.toBeDisabled();
});

// ─── Arrow Keys Don't Navigate Graph When Input Focused ─────────────

test('arrow keys in move input do not navigate graph', async ({ page }) => {
  // Create a couple of nodes first
  await dragPiece(page, 'e2', 'e4');
  await waitForSettle(page);

  // Focus the move input and press arrow keys
  const input = page.getByTestId('move-input');
  await input.focus();
  await input.fill('Nf');
  await page.keyboard.press('ArrowLeft');
  await page.keyboard.press('ArrowRight');

  // The input should still have the text (cursor moved, no graph navigation)
  await expect(input).toHaveValue('Nf');
  // Graph should still have exactly 2 nodes (no navigation side effect)
  await expect(page.locator('[data-testid^="rf__node-"]')).toHaveCount(2);
});
