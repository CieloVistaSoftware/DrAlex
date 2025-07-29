import { test, expect } from '@playwright/test';

test.describe('Chat Widget Login Command Tests', () => {
  test('should handle /login 4486 command correctly', async ({ page }) => {
    // Go to test page
    await page.goto('http://localhost:5000/chat-test.html');
    
    // Wait for chat widget to load
    await page.waitForSelector('.chat-widget');
    
    // Open chat widget
    await page.click('.chat-toggle');
    
    // Type and send login command
    await page.fill('.chat-input', '/login 4486');
    await page.click('.chat-send');
    
    // Wait for success message
    const successMessage = await page.waitForSelector('.system-message .message-content');
    const messageText = await successMessage.textContent();
    
    // Verify success message
    expect(messageText).toContain('✅ Admin access granted');
    
    // Enable debug mode to verify no API calls were made
    await page.evaluate(() => {
      localStorage.setItem('chatDebugMode', 'true');
    });
    
    // Check debug log
    const debugLog = await page.waitForSelector('.debug-log');
    const logText = await debugLog.textContent();
    
    // Verify command was not sent to API
    expect(logText).not.toContain('TO CLAUDE');
    expect(logText).toContain('TO ADMIN');
    
    // Try an admin command to verify login worked
    await page.fill('.chat-input', '/admin theme dark');
    await page.click('.chat-send');
    
    // Verify admin command response
    const adminResponse = await page.waitForSelector('.system-message:last-child .message-content');
    const adminText = await adminResponse.textContent();
    expect(adminText).toContain('Change applied successfully');
  });

  test('should show error for invalid login', async ({ page }) => {
    await page.goto('http://localhost:5000/chat-test.html');
    await page.waitForSelector('.chat-widget');
    await page.click('.chat-toggle');
    
    // Try invalid login
    await page.fill('.chat-input', '/login wrongkey');
    await page.click('.chat-send');
    
    // Verify error message
    const errorMessage = await page.waitForSelector('.system-message .message-content');
    const messageText = await errorMessage.textContent();
    expect(messageText).toContain('❌ Invalid admin key');
  });
});
