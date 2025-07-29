

# Refactoring Plan: Web Component Layout Alignment for All Pages

<span style="color: red; font-weight: bold;">Fix:</span> The following section has been updated to clarify that all layout must be handled by web components using proper slots, and that the web component itself must implement the grid layout. All legacy container classes and extra divs should be removed, and the HTML must use the correct slot attributes for each region.

This document outlines the steps to refactor all HTML pages in the DrAlex website to match the updated layout specifications using custom web components and proper slotting for layout.

## 1. Identify Layout Web Component for Each Page
- Review each HTML file and determine if it should use:
  - `<left-nav>` (left navigation)
  - `<right-nav>` (right navigation)
  - `<top-nav>` (top navigation)
  - `.mobile-device` (mobile-only layout, as a class on `<body>` or main container)

## 2. Remove All Legacy Container Classes
- Remove any `.site-container`, `.left-nav`, `.right-nav`, `.top-nav`, or other legacy container classes from all HTML and CSS files.
- Do not wrap web components in extra `<div>` containers for layout.

## 3. Use Only Web Components for Layout
- Use your custom web components for all navigation and layout regions:
  - `<left-nav>` for left navigation
  - `<right-nav>` for right navigation
  - `<top-nav>` for top navigation
  - `<site-header>` for the header
  - `<main-component>` or `<main>` for the main content area
  - `<site-footer>` for the footer

## 4. Slot Content Correctly in Web Components
- The main layout web component (e.g., `<left-nav>`) must define a CSS grid and expose named slots for navigation, header, main content, and footer.
- In each HTML page, assign content to the correct slot using the `slot` attribute:
  ```html
  <left-nav>
    <site-header slot="header"></site-header>
    <main slot="main"> ... </main>
    <site-footer slot="footer"></site-footer>
  </left-nav>
  ```
- If your web component expects different slot names, use those names consistently.


## 5. Ensure All Layout and Styling Is in CSS (No Inline Styles)
- All layout and styling must be defined in external CSS files or in the shadow DOM of web components—never as inline `style` attributes.
- Move any inline styles to the appropriate CSS file or the web component's style block.
- The web component (e.g., `<left-nav>`) must define a CSS grid or flex layout in its shadow DOM and distribute slotted content into the correct grid areas.
- Example (inside the web component):
  ```css
  :host {
    display: grid;
    grid-template-areas:
      "header header"
      "nav main"
      "footer footer";
    grid-template-columns: 250px 1fr;
    grid-template-rows: auto 1fr auto;
    height: 100vh;
  }
  ::slotted([slot="header"]) { grid-area: header; }
  ::slotted([slot="main"]) { grid-area: main; }
  ::slotted([slot="footer"]) { grid-area: footer; }
  /* Add nav slot if needed */
  ```

## 6. Responsive Design
- Use `.mobile-device` for mobile layouts as needed.
- Update media queries and mobile-specific styles to target `.mobile-device` as needed.


## 7. Test All Pages (Automated and Visual)
- Open each page and verify the layout matches the new documentation and fills the viewport as intended.
- Check responsiveness and navigation placement on all device sizes.
- Implement automated Playwright tests to:
  - Verify that all layout regions (header, main, footer, nav) are present and correctly slotted in the web component.
  - Check that each region is visible and contains the expected content.
  - Assert that the width and height of each region (sidebar, header, main, footer) match the grid layout spec (e.g., sidebar is 220px wide, header/footer have correct height, main fills remaining space).
  - Confirm that all regions are positioned correctly within the grid (not overlapping, not collapsed, and aligned as designed).
  - Optionally, include visual regression or screenshot tests to catch layout shifts.

## 8. Update Documentation
- Ensure all code samples and documentation reference the new web component slotting and layout patterns.

---

**Next Steps:**
- Apply these changes to each HTML and CSS file in the project.
- Test thoroughly after each refactor.
- Keep this document updated with any additional refactoring notes or decisions.
