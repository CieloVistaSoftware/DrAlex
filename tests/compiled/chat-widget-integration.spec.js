import { test, expect } from '@playwright/test';
test.describe('Chat Widget Integration', () => {
    test('should send and receive messages', async ({ page }) => {
        await page.goto('http://localhost:5000/component-chat-test.html');
        const chat = await page.locator('dr-alex-chat');
        await expect(chat).toBeVisible();
        const inputHandle = await chat.evaluateHandle(el => el.shadowRoot?.querySelector('textarea.chat-input'));
        const input = inputHandle.asElement();
        if (!input)
            throw new Error('Input not found in shadow DOM');
        await input.type('Hello!');
        const sendButtonHandle = await chat.evaluateHandle(el => el.shadowRoot?.querySelector('.chat-send'));
        const sendButton = sendButtonHandle.asElement();
        if (!sendButton)
            throw new Error('Send button not found in shadow DOM');
        await expect(await sendButton.isEnabled()).toBeTruthy();
        await sendButton.click();
        // Wait for user message
        const userMsgHandle = await chat.evaluateHandle(el => el.shadowRoot?.querySelector('.chat-message.user-message'));
        const userMsg = userMsgHandle.asElement();
        if (!userMsg)
            throw new Error('User message not found in shadow DOM');
        const userMsgText = await userMsg.textContent();
        expect(userMsgText).toContain('Hello!');
        // Wait for bot message
        const botMsgHandle = await chat.evaluateHandle(el => el.shadowRoot?.querySelector('.chat-message.assistant-message'));
        const botMsg = botMsgHandle.asElement();
        if (!botMsg)
            throw new Error('Bot message not found in shadow DOM');
        const botMsgText = await botMsg.textContent();
        expect(botMsgText).not.toBe('');
    });
});
