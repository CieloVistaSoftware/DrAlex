import { test, expect } from '@playwright/test';

// Test the left-nav layout for correct slotting and grid placement

test.describe('LeftNav Layout', () => {
  test('about.html displays header, main, and footer in correct grid areas', async ({ page }) => {
    await page.goto('/about.html');

    // Check that the header is visible and in the correct slot
    const header = page.locator('left-nav > site-header[slot="header"]');
    await expect(header).toBeVisible();
    await expect(header).toHaveText(/About Our Team/);

    // Check that the main content is visible and in the correct slot
    const main = page.locator('left-nav > main[slot="main"]');
    await expect(main).toBeVisible();
    await expect(main).toContainText('Our Team');

    // Check that the footer is visible and in the correct slot
    const footer = page.locator('left-nav > site-footer[slot="footer"]');
    await expect(footer).toBeVisible();
    await expect(footer).toContainText('All rights reserved');
  });

  // Add more tests for responsiveness, nav, etc. as needed
});
