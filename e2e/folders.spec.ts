import { test, expect } from '@playwright/test';

async function resetToAllGraphs(page: import('@playwright/test').Page) {
  await page.goto('/repertoires');
  await page.evaluate(() => new Promise<void>((resolve, reject) => {
    const req = indexedDB.deleteDatabase('chess-graph');
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
    req.onblocked = () => resolve();
  }));
  await page.reload();
  await expect(page.getByText('My Graphs')).toBeVisible();
}

test.beforeEach(async ({ page }) => {
  await resetToAllGraphs(page);
});

test('create folder and see it on All Graphs page', async ({ page }) => {
  await page.getByTestId('new-folder-btn').click();
  await expect(page.getByPlaceholder('Folder name...')).toBeVisible();
  await page.getByPlaceholder('Folder name...').fill('Openings');
  await page.getByRole('button', { name: 'Create' }).click();

  // Folder section header should be visible
  await expect(page.getByText('Openings')).toBeVisible();
  // Uncategorized section should also exist with existing graphs
  await expect(page.getByTestId('folder-section-uncategorized')).toBeVisible();
});

test('move repertoire to folder via context menu', async ({ page }) => {
  // Create a folder first
  await page.getByTestId('new-folder-btn').click();
  await page.getByPlaceholder('Folder name...').fill('My Folder');
  await page.getByRole('button', { name: 'Create' }).click();
  await expect(page.getByText('My Folder')).toBeVisible();

  // Right-click a card to open context menu
  const card = page.locator('[data-testid="graph-card"]').first();
  await card.click({ button: 'right' });

  // Context menu should show "Move to" with folder option
  await expect(page.getByText('Move to')).toBeVisible();
  await page.getByRole('menuitem', { name: 'My Folder' }).click();

  // Card should now be in the folder section
  const folderSection = page.locator('[data-testid^="folder-section-"]:not([data-testid="folder-section-uncategorized"])');
  await expect(folderSection.locator('[data-testid="graph-card"]')).toHaveCount(1);
});

test('collapse and expand folder', async ({ page }) => {
  // Create a folder
  await page.getByTestId('new-folder-btn').click();
  await page.getByPlaceholder('Folder name...').fill('Collapsible');
  await page.getByRole('button', { name: 'Create' }).click();
  await expect(page.getByText('Collapsible')).toBeVisible();

  // Move a card into it
  const card = page.locator('[data-testid="graph-card"]').first();
  await card.click({ button: 'right' });
  await page.getByRole('menuitem', { name: 'Collapsible' }).click();

  // Verify card is visible in folder section
  const folderSection = page.locator('[data-testid^="folder-section-"]:not([data-testid="folder-section-uncategorized"])');
  await expect(folderSection.locator('[data-testid="graph-card"]')).toHaveCount(1);

  // Toggle collapse
  await page.getByTestId(await folderSection.getAttribute('data-testid').then(id => `folder-toggle-${id?.replace('folder-section-', '')}`)).click();

  // Cards in this folder should be hidden
  await expect(folderSection.locator('[data-testid="graph-card"]')).toHaveCount(0);

  // Toggle expand again
  await page.getByTestId(await folderSection.getAttribute('data-testid').then(id => `folder-toggle-${id?.replace('folder-section-', '')}`)).click();
  await expect(folderSection.locator('[data-testid="graph-card"]')).toHaveCount(1);
});

test('delete folder moves graphs to uncategorized', async ({ page }) => {
  // Create a folder
  await page.getByTestId('new-folder-btn').click();
  await page.getByPlaceholder('Folder name...').fill('Temp Folder');
  await page.getByRole('button', { name: 'Create' }).click();
  await expect(page.getByText('Temp Folder')).toBeVisible();

  // Move a card into it
  const card = page.locator('[data-testid="graph-card"]').first();
  await card.click({ button: 'right' });
  await page.getByRole('menuitem', { name: 'Temp Folder' }).click();

  // Count cards before deletion
  const totalCards = await page.locator('[data-testid="graph-card"]').count();

  // Delete the folder via its menu
  const folderSection = page.locator('[data-testid^="folder-section-"]:not([data-testid="folder-section-uncategorized"])');
  const folderId = await folderSection.getAttribute('data-testid').then(id => id?.replace('folder-section-', ''));
  await page.getByTestId(`folder-menu-${folderId}`).click();
  await page.getByRole('button', { name: 'Delete' }).click();

  // Confirm deletion
  await expect(page.getByRole('heading', { name: 'Delete Folder' })).toBeVisible();
  await page.locator('.bg-red-600').click();

  // Wait for dialog to close
  await expect(page.getByRole('heading', { name: 'Delete Folder' })).not.toBeVisible();

  // Folder section should be gone (only uncategorized remains)
  await expect(page.locator('[data-testid^="folder-section-"]:not([data-testid="folder-section-uncategorized"])')).toHaveCount(0);

  // All cards should still exist (moved to uncategorized)
  await expect(page.locator('[data-testid="graph-card"]')).toHaveCount(totalCards);
});

test('rename folder via menu', async ({ page }) => {
  // Create a folder
  await page.getByTestId('new-folder-btn').click();
  await page.getByPlaceholder('Folder name...').fill('Old Name');
  await page.getByRole('button', { name: 'Create' }).click();
  await expect(page.getByText('Old Name')).toBeVisible();

  // Rename via the folder's ... menu
  const folderSection = page.locator('[data-testid^="folder-section-"]:not([data-testid="folder-section-uncategorized"])');
  const folderId = await folderSection.getAttribute('data-testid').then(id => id?.replace('folder-section-', ''));
  await page.getByTestId(`folder-menu-${folderId}`).click();
  await page.getByRole('button', { name: 'Rename' }).click();

  // Input should appear with current name
  const input = folderSection.locator('input');
  await expect(input).toBeVisible();
  await input.fill('New Name');
  await input.press('Enter');

  await expect(page.getByText('New Name')).toBeVisible();
});

test('create graph dialog includes folder selector when folders exist', async ({ page }) => {
  // Create a folder first
  await page.getByTestId('new-folder-btn').click();
  await page.getByPlaceholder('Folder name...').fill('My Folder');
  await page.getByRole('button', { name: 'Create' }).click();
  await expect(page.getByText('My Folder')).toBeVisible();

  // Open create graph dialog
  await page.getByRole('button', { name: /New Graph/i }).click();

  // Folder selector should be visible
  await expect(page.locator('#create-graph-folder')).toBeVisible();
  // Should have Uncategorized + My Folder options
  const options = page.locator('#create-graph-folder option');
  await expect(options).toHaveCount(2);
});

test('folder persists across page reload', async ({ page }) => {
  // Create a folder
  await page.getByTestId('new-folder-btn').click();
  await page.getByPlaceholder('Folder name...').fill('Persistent');
  await page.getByRole('button', { name: 'Create' }).click();
  await expect(page.getByText('Persistent')).toBeVisible();

  // Reload
  await page.reload();
  await expect(page.getByText('My Graphs')).toBeVisible();

  // Folder should still be there
  await expect(page.getByText('Persistent')).toBeVisible();
});
