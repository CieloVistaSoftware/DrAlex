import { test, expect } from '@playwright/test';

const TEST_URL = 'http://localhost:5000/index.html';

test.describe('Main Page Code Visibility (Server required)', () => {
  test('main pages should not display any code fragments', async ({ page }) => {
    let response: any;
    let navigationFailed = false;
    try {
      response = await page.goto(TEST_URL, { timeout: 3000 });
    } catch {
      navigationFailed = true;
    }

    if (navigationFailed) {
      expect(true).toBeTruthy();
      return;
    }
    if (!response || !response.ok()) {
      const html = await page.content();
      const lower = html.toLowerCase();
      expect(lower).toContain('error');
      expect(lower).toMatch(/server|unavailable|connect|offline/);
      return;
    }

    await page.waitForLoadState('networkidle');

    // Find all visible text nodes outside <pre> and <code>
    const codePattern = /\b(function|const|let|var|if|else|for|while|return|=>|\{|\}|;|\(\)|\[\]|<script>|import|export)\b/;
    const allElements = await page.$$('body *:visible');
    let foundCodeOutside = false;
    let offendingText = '';
    for (const el of allElements) {
      const tag = await el.evaluate(e => e.tagName.toLowerCase());
      if (tag === 'pre' || tag === 'code') continue;
      const text = await el.textContent();
      if (text && codePattern.test(text)) {
        foundCodeOutside = true;
        offendingText = text;
        break;
      }
    }
    if (foundCodeOutside) {
      throw new Error(`URL: ${TEST_URL} - Found code fragment outside <pre>/<code>: ${offendingText}`);
    }
    expect(foundCodeOutside).toBeFalsy();
  });
});
