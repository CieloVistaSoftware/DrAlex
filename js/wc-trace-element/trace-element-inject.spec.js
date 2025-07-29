import { test, expect } from '@playwright/test';

test('trace-element renders and displays injected test data', async ({ page }) => {
  await page.setContent(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Trace Element Test</title>
      <script type="module" src="js/TraceElement/trace-element.js"></script>
      <link rel="stylesheet" href="js/TraceElement/trace-element.css">
    </head>
    <body>
      <trace-element id="trace"></trace-element>
    </body>
    </html>
  `);

  // Wait for the custom element to be defined and available
  await page.waitForFunction(() => {
    const el = document.getElementById('trace');
    return el && typeof el.addEntry === 'function';
  }, { timeout: 10000 });

  // Inject test data using addEntry
  const testData = [
    { level: 'info', direction: 'user', message: 'Start', timestamp: '2025-07-17T10:00:00Z' },
    { level: 'warning', direction: 'ui', message: 'Middle', timestamp: '2025-07-17T10:01:00Z' },
    { level: 'error', direction: 'incoming', message: 'End', timestamp: '2025-07-17T10:02:00Z' }
  ];
  for (const entry of testData) {
    await page.evaluate((e) => {
      document.getElementById('trace').addEntry(e);
    }, entry);
  }

  // Wait for the data to render in the shadow DOM
  await page.waitForFunction(() => {
    const el = document.getElementById('trace');
    return el && el.shadowRoot && el.shadowRoot.textContent.includes('Start');
  }, { timeout: 5000 });

  // Assert that all test messages are present
  const content = await page.evaluate(() => {
    const el = document.getElementById('trace');
    return el && el.shadowRoot ? el.shadowRoot.textContent : '';
  });
  expect(content).toContain('Start');
  expect(content).toContain('Middle');
  expect(content).toContain('End');
});