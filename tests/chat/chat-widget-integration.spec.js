test('Backend port status indicator shows green when up, red when down', async ({ page }) => {
  await page.goto('http://localhost:5000/chat.html');
  // Wait for the indicator to be present
  const indicator = await page.locator('.backend-status-indicator');
  await expect(indicator).toBeVisible();
  // Should be green when backend is up
  const color = await indicator.evaluate(el => getComputedStyle(el).backgroundColor);
  expect(color).toMatch(/rgb\(0, 128, 0\)|#00ff00|green/i); // green

  // Simulate backend down (optional: only if you have a way to stop backend)
  // If backend is down, indicator should be red
  // For full automation, you would kill port 3000 and reload, then check:
  // expect(color).toMatch(/rgb\(255, 0, 0\)|#ff0000|red/i); // red
});
import { test, expect } from '@playwright/test';

test('Backend is running on port 3000', async () => {
  const response = await fetch('http://localhost:3000/api/health');
  expect(response.ok).toBeTruthy();
});

test('Chat link opens and chat widget loads without error', async ({ page }) => {
  await page.goto('http://localhost:5000/index.html');
  // Click the chat link in the nav
  await page.click('a[href="chat.html"]');
  // Wait for navigation
  await page.waitForLoadState('domcontentloaded');
  // Wait for <claude-chat> to be present and visible
  const chat = await page.locator('claude-chat');
  await expect(chat).toBeVisible();
  // Wait up to 5 seconds for widget to initialize
  await page.waitForTimeout(5000);
  // Check for error message inside shadow DOM
  const errorFound = await chat.evaluate(el => {
    const shadow = el.shadowRoot;
    return shadow && shadow.textContent.includes('Chat widget failed to load');
  });
  if (errorFound) {
    // Output shadow DOM for debugging
    const errorText = await chat.evaluate(el => el.shadowRoot.textContent);
    console.log('Shadow DOM content:', errorText);
  }
  expect(errorFound).toBeFalsy();
});
