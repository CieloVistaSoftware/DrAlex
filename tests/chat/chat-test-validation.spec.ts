import { test, expect, Page } from '@playwright/test';

test.describe('Chat Widget Validation', () => {
  test('should validate input and show error for empty message', async ({ page }: { page: Page }) => {
    await page.goto('http://localhost:5000/component-chat-test.html');
    const chat = await page.locator('dr-alex-chat');
    await expect(chat).toBeVisible();
    // Access shadow DOM elements
    const inputHandle = await chat.evaluateHandle(el => el.shadowRoot?.querySelector('textarea.chat-input'));
    const input = inputHandle.asElement();
    if (!input) throw new Error('Input not found in shadow DOM');
    await input.type('');
    const sendButtonHandle = await chat.evaluateHandle(el => el.shadowRoot?.querySelector('.chat-send'));
    const sendButton = sendButtonHandle.asElement();
    if (!sendButton) throw new Error('Send button not found in shadow DOM');
    // The button should be disabled for empty input
    expect(await sendButton.isEnabled()).toBeFalsy();
    // Optionally, fill with text and check error message
    await input.type('Test');
    await expect(await sendButton.isEnabled()).toBeTruthy();
    await sendButton.click();
    // Wait for error message in shadow DOM (if your component shows one for invalid input)
    const errorHandle = await chat.evaluateHandle(el => el.shadowRoot?.querySelector('.input-error'));
    const error = errorHandle.asElement();
    if (error) {
      const errorText = await error.textContent();
      expect(errorText).toContain('Message cannot be empty');
    }
  });
});
