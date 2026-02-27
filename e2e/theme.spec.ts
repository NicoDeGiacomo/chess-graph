import { test, expect } from '@playwright/test';

test.describe('Theme toggle', () => {
  test('toggle switches between dark and light themes', async ({ page }) => {
    // Force dark color-scheme preference so default is 'dark'
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/repertoires');

    // Should start in dark mode by default
    const html = page.locator('html');
    await expect(html).toHaveClass(/dark/);

    // Find and click the theme toggle button
    const toggle = page.getByLabel(/switch to light mode/i);
    await expect(toggle).toBeVisible();
    await toggle.click();

    // Should switch to light mode
    await expect(html).toHaveClass(/light/);
    await expect(html).not.toHaveClass(/dark/);

    // Toggle back to dark
    const toggleBack = page.getByLabel(/switch to dark mode/i);
    await toggleBack.click();
    await expect(html).toHaveClass(/dark/);
    await expect(html).not.toHaveClass(/light/);
  });

  test('persists theme across page navigation', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/repertoires');

    // Switch to light mode
    const toggle = page.getByLabel(/switch to light mode/i);
    await toggle.click();
    await expect(page.locator('html')).toHaveClass(/light/);

    // Navigate to landing page
    await page.goto('/');
    await expect(page.locator('html')).toHaveClass(/light/);

    // Theme toggle should show dark mode option (since we're in light)
    await expect(page.getByLabel(/switch to dark mode/i)).toBeVisible();
  });

  test('toggle is visible on every page', async ({ page }) => {
    // Landing page
    await page.goto('/');
    await expect(page.getByLabel(/switch to (light|dark) mode/i)).toBeVisible();

    // All graphs page
    await page.goto('/repertoires');
    await expect(page.getByLabel(/switch to (light|dark) mode/i)).toBeVisible();

    // 404 page
    await page.goto('/nonexistent');
    await expect(page.getByLabel(/switch to (light|dark) mode/i)).toBeVisible();
  });
});
