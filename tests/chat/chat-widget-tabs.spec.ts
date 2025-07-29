import { test, expect, Page } from '@playwright/test';

test.describe('Chat Widget Tabs', () => {
  test('should display tabs and switch between them', async ({ page }: { page: Page }) => {
    await page.goto('http://localhost:5000/component-chat-test.html');
    const tabButtons = await page.$$('.tab-button');
    expect(tabButtons.length).toBeGreaterThan(1);
    await tabButtons[1].click();
    const activeTab = await page.$('.tab-content.active');
    expect(await activeTab?.isVisible()).toBeTruthy();
  });
});
