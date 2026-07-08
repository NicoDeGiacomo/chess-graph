/**
 * Playwright script to capture screenshots for the /features page.
 *
 * Usage:
 *   npx playwright test scripts/capture-screenshots.ts
 *
 * Outputs PNG + WebP to public/screenshots/features/
 */
import { test, expect, type Page } from '@playwright/test';
import { execSync } from 'child_process';
import path from 'path';

const OUT_DIR = path.resolve('public/screenshots/features');

/** Delete IndexedDB and reload so the app seeds fresh example data. */
async function resetApp(page: Page) {
  await page.goto('/repertoires');
  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        const req = indexedDB.deleteDatabase('chess-graph');
        req.onsuccess = () => resolve();
        req.onblocked = () => resolve();
      }),
  );
  await page.reload();
  await expect(page.getByText('My Graphs')).toBeVisible({ timeout: 10000 });
}

async function enterExampleRepertoire(page: Page) {
  await page
    .locator('[data-testid="graph-card"]')
    .filter({ hasText: '1.e4 Repertoire' })
    .click();
  await expect(
    page.locator('[data-testid^="rf__node-"]').first(),
  ).toBeVisible({ timeout: 5000 });
  // Let layout settle
  await page.waitForTimeout(800);
}

async function dragPiece(page: Page, from: string, to: string) {
  const fromBox = (await page.locator(`[data-square="${from}"]`).boundingBox())!;
  const toBox = (await page.locator(`[data-square="${to}"]`).boundingBox())!;
  await page.mouse.move(
    fromBox.x + fromBox.width / 2,
    fromBox.y + fromBox.height / 2,
  );
  await page.mouse.down();
  await page.mouse.move(
    toBox.x + toBox.width / 2,
    toBox.y + toBox.height / 2,
    { steps: 10 },
  );
  await page.mouse.up();
}

function convertToWebP(pngPath: string) {
  const webpPath = pngPath.replace('.png', '.webp');
  try {
    execSync(`cwebp -q 85 "${pngPath}" -o "${webpPath}"`, { stdio: 'ignore' });
  } catch {
    // cwebp not installed — skip WebP generation silently
  }
}

test.describe('Feature screenshots', () => {
  test.beforeEach(async ({ page }) => {
    // Force dark mode and consistent viewport
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.emulateMedia({ colorScheme: 'dark' });
  });

  test('game-tree.png — graph with branching nodes', async ({ page }) => {
    await resetApp(page);
    await enterExampleRepertoire(page);

    const pngPath = path.join(OUT_DIR, 'game-tree.png');
    await page.screenshot({ path: pngPath, fullPage: false });
    convertToWebP(pngPath);
  });

  test('chess-board.png — board with arrow and highlight', async ({ page }) => {
    await resetApp(page);
    await enterExampleRepertoire(page);

    // Play e4
    await dragPiece(page, 'e2', 'e4');
    await page.waitForTimeout(400);

    // Draw an arrow from e2 to e4 (right-click drag)
    const e2Box = (await page.locator('[data-square="e2"]').boundingBox())!;
    const e4Box = (await page.locator('[data-square="e4"]').boundingBox())!;
    await page.mouse.move(e2Box.x + e2Box.width / 2, e2Box.y + e2Box.height / 2);
    await page.mouse.down({ button: 'right' });
    await page.mouse.move(e4Box.x + e4Box.width / 2, e4Box.y + e4Box.height / 2, {
      steps: 10,
    });
    await page.mouse.up({ button: 'right' });
    await page.waitForTimeout(300);

    // Highlight e4 square (right-click without drag)
    await page.locator('[data-square="e4"]').click({ button: 'right' });
    await page.waitForTimeout(300);

    const pngPath = path.join(OUT_DIR, 'chess-board.png');
    await page.screenshot({ path: pngPath, fullPage: false });
    convertToWebP(pngPath);
  });

  test('move-input.png — move input with turn indicator', async ({ page }) => {
    await resetApp(page);
    await enterExampleRepertoire(page);

    // Click root node to select it, then focus move input
    await page.locator('[data-testid^="rf__node-"]').first().click();
    await page.waitForTimeout(300);

    const moveInput = page.getByTestId('move-input');
    await moveInput.click();

    const pngPath = path.join(OUT_DIR, 'move-input.png');
    await page.screenshot({ path: pngPath, fullPage: false });
    convertToWebP(pngPath);
  });

  test('context-menu.png — node context menu', async ({ page }) => {
    await resetApp(page);
    await enterExampleRepertoire(page);

    // Right-click a non-root node to open context menu
    const nodes = page.locator('[data-testid^="rf__node-"]');
    const nodeCount = await nodes.count();
    if (nodeCount > 1) {
      await nodes.nth(1).click({ button: 'right' });
    }
    await page.waitForTimeout(300);

    // Verify context menu is open
    await expect(page.getByText('Edit Comment')).toBeVisible({ timeout: 3000 });

    const pngPath = path.join(OUT_DIR, 'context-menu.png');
    await page.screenshot({ path: pngPath, fullPage: false });
    convertToWebP(pngPath);
  });

  test('pgn-import.png — PGN import dialog', async ({ page }) => {
    await resetApp(page);
    await enterExampleRepertoire(page);

    // Open the PGN import dialog
    await page.getByTestId('import-pgn-btn').click();
    await expect(
      page.getByRole('heading', { name: 'Import PGN' }),
    ).toBeVisible({ timeout: 3000 });

    // Put some sample PGN text in the textarea
    await page.getByTestId('pgn-textarea').fill(
      '1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O *',
    );

    const pngPath = path.join(OUT_DIR, 'pgn-import.png');
    await page.screenshot({ path: pngPath, fullPage: false });
    convertToWebP(pngPath);
  });

  test('repertoire-management.png — All Graphs page', async ({ page }) => {
    await resetApp(page);

    // Already on /repertoires after reset — just take the screenshot
    const pngPath = path.join(OUT_DIR, 'repertoire-management.png');
    await page.screenshot({ path: pngPath, fullPage: false });
    convertToWebP(pngPath);
  });
});
