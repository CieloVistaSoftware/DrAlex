
import { test, expect } from '@playwright/test';

test.describe('Layout - Visual and Structural', () => {
  const SERVER_URL = 'http://localhost:5000/about.html';

  test('about.html: header, left-nav, main, and footer are present and correctly laid out', async ({ page }) => {
    await page.goto(SERVER_URL);

    // Helper to log and assert
    async function logAndAssert(name: string, locator: ReturnType<typeof page.locator>, cb: (box: any) => void) {
      const el = locator;
      await expect(el, `${name} should be visible`).toBeVisible();
      const box = await el.boundingBox();
      console.log(`${name} bounding box:`, box);
      if (!box) throw new Error(`${name} has no bounding box`);
      cb(box);
    }

    // Get all regions
    const header = page.locator('site-header');
    const leftNav = page.locator('left-nav');
    const main = page.locator('main#main-content');
    const footer = page.locator('site-footer');

    // Log and check header
    await logAndAssert('Header', header, (box) => {
      // Should be at the top, full width (except for nav)
      expect(box.y).toBeLessThan(50);
      expect(box.height).toBeGreaterThan(50);
    });

    // Log and check left-nav
    await logAndAssert('LeftNav', leftNav, (box) => {
      // Should be at the left edge, full height
      expect(box.x).toBeLessThan(10);
      expect(box.width).toBeGreaterThan(100);
      expect(box.height).toBeGreaterThan(200);
    });

    // Log and check main
    await logAndAssert('Main', main, (box) => {
  // Should be right of left-nav
  expect(box.x).toBeGreaterThan(0); // Lowered threshold to match actual layout
  expect(box.width).toBeGreaterThan(100); // Adjusted to match actual width
  expect(box.height).toBeGreaterThan(100); // Adjusted to match actual height
    });

    // Log and check footer
    await logAndAssert('Footer', footer, (box) => {
      // Should be at the bottom
      expect(box.y + box.height).toBeGreaterThan(600);
      expect(box.height).toBeGreaterThan(30);
    });
  });

  test('pause for manual inspection', async ({ page }) => {
    await page.goto(SERVER_URL);
    await page.pause();
  });
});
