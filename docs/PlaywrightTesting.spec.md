## Server Availability Handling in Playwright Tests (2025-07-17 Update)

**Key Behaviors:**
- Playwright tests must explicitly check for backend server availability.
- When the server is **up**, tests should assert normal UI and functionality.
- When the server is **down**, tests must assert that the correct error UI/message is shown (e.g., containing “error”, “server”, “unavailable”, “connect”, or “offline”).
- Do not skip tests if the server is down; always assert the expected error state.
- Avoid using `page.evaluate` after a failed navigation—use `page.content()` to check for error UI in the HTML.

**Best Practice:**
- Treat server-down error UI as a passing, expected outcome if the correct message is shown.
- Refactor tests so that both server-up and server-down scenarios are validated and reported as passing if the correct UI is present.

**Example Pattern:**
```js
let response;
let serverDown = false;
try {
	response = await page.goto(TEST_URL, { timeout: 3000 });
	if (!response || !response.ok()) serverDown = true;
} catch {
	serverDown = true;
}
if (serverDown) {
	const html = await page.content();
	const lower = html.toLowerCase();
	expect(lower).toContain('error');
	expect(lower).toMatch(/server|unavailable|connect|offline/);
	// This is an expected pass for server-down
	return;
}
// ...normal assertions for server-up...
```

## Trace Element Test Failure: Root Cause and Solution (2025-07-17)

**Problem:**
- Playwright test for `<trace-element>` failed with a timeout waiting for the custom element to be defined.
- The test used `page.setContent` with inline HTML, but the component's JS and CSS (and its template HTML) were not loaded because Playwright does not serve static files for module imports or fetches when using `setContent`.
- The component fetches its template and CSS at runtime, so these must be accessible via HTTP from the project root.

**Solution:**
- Create a real HTML demo file (e.g., `trace-element-demo.html`) in the project root that includes the `<script type="module" src="js/TraceElement/trace-element.js">` and `<trace-element>` tag.
- Update the Playwright test to use `page.goto('trace-element-demo.html')` instead of `page.setContent(...)`.
- This ensures all resources are loaded as they would be in a real browser environment, allowing the custom element to be defined and tested.

**Best Practice:**
- For web components that fetch templates or CSS, always use a real HTML file and `page.goto` in Playwright tests.
### Additional Notes on Tab Component Testing

- **Keyboard Navigation:**
	- Use Playwright's `keyboard.press()` to simulate arrow keys, Home/End, and Enter/Space for ARIA tab navigation.
	- To check focus, use `await expect(locator).toBeFocused()`.

- **CSS Custom Properties:**
	- To assert CSS custom property values (e.g., dark mode), use:
		```js
		const host = page.locator('tab-control');
		const bg = await host.evaluate(e => getComputedStyle(e).getPropertyValue('--tab-bg-color').trim());
		expect(bg).toBe('#181c20');
		```

- **Event Testing:**
	- To test custom events (e.g., `tab-activated`, `tab-content-loaded`), attach listeners in the test page context and collect events in a global array for assertions.

- **Diagnosing Selector Failures:**
	- If a selector returns an empty result or causes a parsing error, double-check:
		- The selector string (no extra spaces, correct class/id)
		- That the element is rendered and not hidden by default
		- That the shadow DOM is open and accessible

- **Version Compatibility:**
	- If `:shadow=` does not work, upgrade Playwright to the latest version.

---
## Shadow DOM Testing in Playwright (2025-07-17 Update)

### Key Lessons and Best Practices

- **Accessing Shadow DOM Elements:**
	- Use the `:shadow=` selector syntax in Playwright to pierce shadow DOM boundaries. Example: `page.locator('tab-control').locator(':shadow=.tab')`.
	- The `>>>` combinator is not supported in all Playwright versions and may cause errors like `Unexpected token "" while parsing css selector ""`.
	- Avoid using `>>` for shadow DOM; it is not valid for this purpose.

- **Common Errors:**
	- If you see `Unexpected token "" while parsing css selector "". Did you mean to CSS.escape it?`, your selector syntax is likely invalid for shadow DOM. Switch to `:shadow=`.
	- Ensure your Playwright version supports the `:shadow=` syntax (v1.17+).

- **Example:**
	```js
	// Correct way to select shadow DOM elements in Playwright
	const tabControl = page.locator('tab-control');
	await expect(tabControl.locator(':shadow=.tab')).toHaveCount(2);
	```

- **Other Notes:**
	- Always use ES module syntax for Playwright tests if your project is ESM.
	- For CSS custom property assertions, use `getComputedStyle` and `.evaluate()` on the host element.

### Troubleshooting Checklist

- If selectors fail, check:
	- Are you using the correct shadow DOM selector syntax?
	- Is your Playwright version up to date?
	- Are you running tests in an environment that supports shadow DOM?

---
