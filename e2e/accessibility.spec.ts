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

// ─── Semantic Landmarks ──────────────────────────────────────────────

test('editor uses semantic landmarks', async ({ page }) => {
  await expect(page.locator('main')).toBeVisible();
  await expect(page.locator('header')).toBeVisible();
  await expect(page.locator('aside')).toBeVisible();
});

// ─── Dialog ARIA Attributes ──────────────────────────────────────────

test('create graph dialog has ARIA attributes', async ({ page }) => {
  // Go to All Graphs page and open create dialog
  await page.getByText('Back').click();
  await expect(page.getByText('My Graphs')).toBeVisible();
  await page.getByRole('button', { name: /New Graph/i }).click();

  const dialog = page.locator('[role="dialog"]');
  await expect(dialog).toBeVisible();
  await expect(dialog).toHaveAttribute('aria-modal', 'true');

  const labelledBy = await dialog.getAttribute('aria-labelledby');
  expect(labelledBy).toBeTruthy();

  // The heading with matching ID should exist
  const heading = page.locator(`#${labelledBy}`);
  await expect(heading).toBeVisible();
  await expect(heading).toHaveText('New Graph');
});

// ─── Form Label Associations ─────────────────────────────────────────

test('create dialog form labels are associated', async ({ page }) => {
  await page.getByText('Back').click();
  await expect(page.getByText('My Graphs')).toBeVisible();
  await page.getByRole('button', { name: /New Graph/i }).click();

  // Name label → input
  const nameLabel = page.locator('label[for="create-graph-name"]');
  await expect(nameLabel).toBeVisible();
  await expect(page.locator('#create-graph-name')).toBeVisible();

  // Side label → select
  const sideLabel = page.locator('label[for="create-graph-side"]');
  await expect(sideLabel).toBeVisible();
  await expect(page.locator('#create-graph-side')).toBeVisible();
});

// ─── Color Picker Button Labels ──────────────────────────────────────

test('color picker buttons have aria-labels', async ({ page }) => {
  const rootNode = page.locator('[data-testid^="rf__node-"]').first();
  await rootNode.click({ button: 'right' });

  // Expand color picker
  await page.getByText('Change Color').click();

  const colorButtons = page.locator('button[aria-label^="Set color to"]');
  const count = await colorButtons.count();
  expect(count).toBeGreaterThan(0);

  for (let i = 0; i < count; i++) {
    const label = await colorButtons.nth(i).getAttribute('aria-label');
    expect(label).toMatch(/^Set color to /);
  }
});

// ─── Tag Remove Button Labels ────────────────────────────────────────

test('tag remove buttons have aria-labels', async ({ page }) => {
  // Add a tag via context menu
  const rootNode = page.locator('[data-testid^="rf__node-"]').first();
  await rootNode.click({ button: 'right' });
  await page.getByText('Add Tag').click();
  const tagInput = page.getByPlaceholder('Tag name...');
  await tagInput.fill('test-tag');
  await tagInput.press('Enter');
  await waitForSettle(page);

  // Re-open context menu to see the tag
  await rootNode.click({ button: 'right' });
  await waitForSettle(page);

  const removeBtn = page.locator('button[aria-label^="Remove tag:"]');
  await expect(removeBtn.first()).toBeVisible();
  const label = await removeBtn.first().getAttribute('aria-label');
  expect(label).toBe('Remove tag: test-tag');
});

// ─── Confirm Dialog ARIA ─────────────────────────────────────────────

test('confirm dialog has ARIA attributes', async ({ page }) => {
  // Open the delete confirm dialog
  await page.getByRole('button', { name: 'Delete' }).click();

  const dialog = page.locator('[role="dialog"]');
  await expect(dialog).toBeVisible();
  await expect(dialog).toHaveAttribute('aria-modal', 'true');
  await expect(dialog).toHaveAttribute('aria-labelledby', 'confirm-dialog-title');

  const heading = page.locator('#confirm-dialog-title');
  await expect(heading).toBeVisible();
});

// ─── Context Menu ARIA & Keyboard ────────────────────────────────

test('context menu has role="menu" and menuitem roles', async ({ page }) => {
  const rootNode = page.locator('[data-testid^="rf__node-"]').first();
  await rootNode.click({ button: 'right' });

  const menu = page.locator('[role="menu"]');
  await expect(menu).toBeVisible();

  const menuItems = menu.locator('[role="menuitem"]');
  const count = await menuItems.count();
  expect(count).toBeGreaterThanOrEqual(3); // Edit Comment, Change Color, Add Tag
});

test('context menu closes on Escape key', async ({ page }) => {
  const rootNode = page.locator('[data-testid^="rf__node-"]').first();
  await rootNode.click({ button: 'right' });

  const menu = page.locator('[role="menu"]');
  await expect(menu).toBeVisible();

  await page.keyboard.press('Escape');
  await expect(menu).not.toBeVisible();
});

test('context menu arrow keys move focus between items', async ({ page }) => {
  const rootNode = page.locator('[data-testid^="rf__node-"]').first();
  await rootNode.click({ button: 'right' });

  const menu = page.locator('[role="menu"]');
  await expect(menu).toBeVisible();

  // First menuitem should be focused on open
  const items = menu.locator('[role="menuitem"]');
  await expect(items.first()).toBeFocused();

  // Arrow down moves to next item
  await page.keyboard.press('ArrowDown');
  await expect(items.nth(1)).toBeFocused();

  // Arrow up moves back
  await page.keyboard.press('ArrowUp');
  await expect(items.first()).toBeFocused();

  // Arrow up from first wraps to last
  await page.keyboard.press('ArrowUp');
  await expect(items.last()).toBeFocused();
});

// ─── Back Link Label ─────────────────────────────────────────────────

test('back link has aria-label', async ({ page }) => {
  const backLink = page.getByLabel('Back to all graphs');
  await expect(backLink).toBeVisible();
});
