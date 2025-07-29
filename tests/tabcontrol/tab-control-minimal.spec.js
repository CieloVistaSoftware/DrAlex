// Minimal Playwright test to verify <tab-control> renders
import { test, expect } from '@playwright/test';

test('minimal tab-control renders in browser', async ({ page }) => {
  await page.setContent(`
    <!DOCTYPE html>
    <html>
    <head>
      <script type="module" src="js/Tab-Component/tab-control.js"></script>
      <link rel="stylesheet" href="js/Tab-Component/tab-control.css">
    </head>
    <body>
      <tab-control config='{"tabs":[{"id":"tab-1","label":"Tab 1","panel":"panel-1","content":"data:text/html,<p>Tab1</p>"},{"id":"tab-2","label":"Tab 2","panel":"panel-2","content":"data:text/html,<p>Tab2</p>"}],"defaultTab":"tab-1"}'></tab-control>
    </body>
    </html>
  `);

  // Wait for the custom element to be defined and shadow DOM to appear
  await page.waitForFunction(() => {
    const el = document.querySelector('tab-control');
    return el && el.shadowRoot && el.shadowRoot.querySelector('.tab');
  }, { timeout: 10000 });

  // Check that the tab control rendered at least one tab
  const tabCount = await page.evaluate(() => {
    const el = document.querySelector('tab-control');
    return el && el.shadowRoot ? el.shadowRoot.querySelectorAll('.tab').length : 0;
  });
  expect(tabCount).toBeGreaterThan(0);
});
