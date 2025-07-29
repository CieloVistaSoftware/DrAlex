import { test, expect } from '@playwright/test';

test('main pages should not display any code fragments', async ({ page }) => {
  try {
    // Try to navigate to main page - handle both server running and not running cases
    await page.goto('http://localhost:5500/index.html', { timeout: 5000 });
  } catch (error) {
    // If the server isn't running, use file:// protocol as fallback
    console.log('Server not running, using file:// protocol');
    await page.goto(`file://${process.cwd()}/index.html`);
  }
  
  // Wait for page to load completely
  await page.waitForLoadState('networkidle');
  
  // Get all visible text content
  const visibleText = await page.evaluate(() => {
    // Get all text nodes in the document
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );

    let node;
    let text = '';
    while (node = walker.nextNode()) {
      // Only include text from visible elements
      if (node.parentElement && window.getComputedStyle(node.parentElement).display !== 'none') {
        text += node.textContent + '\n';
      }
    }
    return text;
  });

  // Define patterns that might indicate visible code
  const codePatterns = [
    /\{.*\}/, // Object literals
    /function.*\(.*\)/, // Function declarations
    /\bconst\b|\blet\b|\bvar\b/, // Variable declarations
    /console\.\w+/, // Console statements
    /document\./, // DOM manipulation
    /\=>/, // Arrow functions
    /\.addEventListener/, // Event listeners
    /new \w+\(/, // Constructor calls
    /\[\w+\]/, // Array access
    /\b(if|else|for|while|do|switch|case|try|catch)\b/, // Keywords
    /\bend\b|\breturn\b|\bawait\b|\basync\b/, // More keywords
    /\$\(.*\)/, // jQuery
    /\b\w+\.\w+\(.*\)/, // Method calls
    /\b(null|undefined|true|false)\b/, // Common literals
    /[\\}\\)];/, // Trailing code fragments
    /\bend\b|\breturn\b/, // Common code endings
    /<script>/, // Script tags
    /import\s+.*\s+from/, // Import statements
    /export\s+(default)?/, // Export statements
  ];

  // Check for each pattern
  for (const pattern of codePatterns) {
    const matches = visibleText.match(pattern);
    if (matches) {
      console.log(`Found code pattern: ${pattern}`);
      console.log(`Matching text: ${matches[0]}`);
      test.fail(true, `Found visible code matching pattern ${pattern}: ${matches[0]}`);
    }
  }

  // Also check specifically for common syntax fragments that shouldn't be visible
  const forbiddenFragments = [
    '});',
    '});});',
    '",',
    ');',
    '})',
    '};',
    'script>',
    '</script>',
    'function(',
    '=>',
    '.then(',
    'await',
    'async',
    'const',
    'let',
    'var'
  ];

  for (const fragment of forbiddenFragments) {
    const includes = visibleText.includes(fragment);
    if (includes) {
      console.log(`Found forbidden code fragment: ${fragment}`);
      test.fail(true, `Found visible code fragment: ${fragment}`);
    }
  }

  // Check for any elements that might contain code
  const codeElements = await page.$$('pre, code, .code, [class*="code"], [class*="Code"]');
  for (const element of codeElements) {
    const isVisible = await element.isVisible();
    if (isVisible) {
      const content = await element.textContent();
      console.log(`Found visible code element with content: ${content}`);
      test.fail(true, `Found visible code element containing: ${content}`);
    }
  }

  // If we got here, no code was found
  expect(true).toBeTruthy();
});
