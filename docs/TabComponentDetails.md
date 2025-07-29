# Tab Web Component: Specification 

  This document serves as both a **specification** and an **example guide** for implementing an accessible, flexible Tab Web Component (`<tab-control>`). It covers recommended structure, ARIA/accessibility, dynamic/static approaches, and usage examples.

  ---

  ## Specification

  ### Tab Implementation Approaches

  There are two main ways to implement a tab navigation component:

  #### 1. JSON-driven (Dynamic)
  - Tabs and panels are generated dynamically from a JSON configuration.
  - Good for data-driven or highly dynamic UIs.
  - Supports loading external HTML/CSS per tab.

  #### 2. Static HTML Structure
  - Tabs and panels are defined directly in the HTML markup.
  - Good for simple, static, or content-heavy layouts.
  - Easier to read and maintain for small tab sets.

  Both approaches can be made accessible and support ARIA, keyboard navigation, and external content loading.

  ### Loading External HTML and CSS for Tabs

  You can specify the `content` property in the tab config as a URL or path to a `.html` file. The tab component can fetch and inject this HTML dynamically when the tab is activated.

  For CSS, you can:
  - Load a CSS file per tab by injecting a `<link>` or `<style>` tag when the tab is activated.
  - Use a global CSS file for all tabs.

### Examples
### 1. JSON-driven (Dynamic) Web Component

You can provide the tab configuration in several ways:

**A. Inline JSON via `config` attribute:**
```html
<tab-control config='{
  "tabs": [
    { "id": "tab-1", "label": "Overview", "panel": "panel-1", "content": "tabs/overview.html", "css": "tabs/overview.css" },
    { "id": "tab-2", "label": "Details", "panel": "panel-2", "content": "tabs/details.html", "css": "tabs/details.css" }
  ],
  "defaultTab": "tab-1"
}'></tab-control>
```

**B. Child `<script type="application/json">` for large configs:**
```html
<tab-control>
  <script type="application/json">
    {
      "tabs": [
        { "id": "tab-1", "label": "Overview", "panel": "panel-1", "content": "tabs/overview.html" },
        { "id": "tab-2", "label": "Details", "panel": "panel-2", "content": "tabs/details.html" }
      ],
      "defaultTab": "tab-1"
    }
  </script>
</tab-control>
```

**C. External .json file (two options):**

1. **Using JavaScript to fetch and assign config:**
   ```html
   <tab-control id="myTabs"></tab-control>
   <script>

  

  ### Security Note

  - Always sanitize or validate fetched HTML before injecting to prevent XSS (e.g., use DOMPurify).
  - Be aware of CORS and loading timing when fetching external files.

  ### Accessible Tab Navigation Component Spec

  #### Purpose
  A tab navigation component provides a way to switch between different views or panels in a single page application. This spec describes a semantic, accessible implementation using HTML, ARIA, and keyboard support.

  #### Structure
  ```
  <nav class="tab-nav" aria-label="Main Tabs">
    <div role="tablist" aria-label="Tab List">
      <button role="tab" aria-selected="true" aria-controls="panel-1" id="tab-1" tabindex="0">Tab 1</button>
      <button role="tab" aria-selected="false" aria-controls="panel-2" id="tab-2" tabindex="-1">Tab 2</button>
      <button role="tab" aria-selected="false" aria-controls="panel-3" id="tab-3" tabindex="-1">Tab 3</button>
    </div>
  </nav>
  <div id="panel-1" role="tabpanel" aria-labelledby="tab-1">Panel 1 content</div>
  <div id="panel-2" role="tabpanel" aria-labelledby="tab-2" hidden>Panel 2 content</div>
  <div id="panel-3" role="tabpanel" aria-labelledby="tab-3" hidden>Panel 3 content</div>
  ```

  #### Key Features
  - Each tab is a `<button>` with `role="tab"` inside a container with `role="tablist"`.
  - Each tab has `aria-controls` pointing to its panel, and each panel has `aria-labelledby` pointing to its tab.
  - Only the active tab has `aria-selected="true"` and `tabindex="0"`; others have `aria-selected="false"` and `tabindex="-1"`.
  - Only the active panel is visible; others use `hidden`.
  - The tablist is inside a `<nav>` for semantic navigation.

  #### Accessibility
  - Keyboard navigation:
    - Left/Right arrows move focus between tabs.
    - Home/End jump to first/last tab.
    - Enter/Space activate the focused tab.
  - All ARIA attributes are set for screen readers.
  - Panels are linked to tabs for context.

  #### Example JavaScript (activation logic)
  ```js
  const tabs = document.querySelectorAll('[role="tab"]');
  const tabList = document.querySelector('[role="tablist"]');

<nav class="tab-nav" aria-label="Main Tabs">
    const currentTab = document.activeElement;
    let newTab = null;
    if (e.key === 'ArrowRight') {
      newTab = currentTab.nextElementSibling || tabList.firstElementChild;
    } else if (e.key === 'ArrowLeft') {
      newTab = currentTab.previousElementSibling || tabList.lastElementChild;
    } else if (e.key === 'Home') {
      newTab = tabList.firstElementChild;
    } else if (e.key === 'End') {
      newTab = tabList.lastElementChild;
    }
    if (newTab) {
      newTab.focus();
      e.preventDefault();
    }
  });

  <div role="tablist" aria-label="Tab List">
    tab.addEventListener('click', () => activateTab(tab));
  });

  function activateTab(tab) {
    tabs.forEach(t => {
      t.setAttribute('aria-selected', 'false');
      t.setAttribute('tabindex', '-1');
      document.getElementById(t.getAttribute('aria-controls')).hidden = true;
    });
    tab.setAttribute('aria-selected', 'true');
    tab.setAttribute('tabindex', '0');
    document.getElementById(tab.getAttribute('aria-controls')).hidden = false;
    tab.focus();
  }
  ```

  #### Styling
  - Use CSS to visually indicate the active tab.
  - Ensure focus styles are visible for keyboard users.

  #### Extensibility
  - Can be extended for vertical tabs, icons, or dynamic tab content.
  - Panels can contain any HTML content.

  ---

  ## Usage Examples

  Below are HTML and JavaScript examples for using the tab navigation as a custom tab web component (`<tab-control>`) in both approaches:

  ### 1. JSON-driven (Dynamic) Web Component

  You can provide the tab configuration in several ways:

  **A. Inline JSON via `config` attribute:**
  ```html
  <tab-control config='{
    "tabs": [
      { "id": "tab-1", "label": "Overview", "panel": "panel-1", "content": "tabs/overview.html", "css": "tabs/overview.css" },
      { "id": "tab-2", "label": "Details", "panel": "panel-2", "content": "tabs/details.html", "css": "tabs/details.css" }
    ],
    "defaultTab": "tab-1"
  }'></tab-control>
  ```

  **B. Child `<script type="application/json">` for large configs:**
  ```html
  <tab-control>
    <script type="application/json">
      {
        "tabs": [
          { "id": "tab-1", "label": "Overview", "panel": "panel-1", "content": "tabs/overview.html" },
          { "id": "tab-2", "label": "Details", "panel": "panel-2", "content": "tabs/details.html" }
        ],
        "defaultTab": "tab-1"
      }
    </script>
  </tab-control>
  ```

  **C. External .json file (two options):**

  1. **Using JavaScript to fetch and assign config:**
     ```html
     <tab-control id="myTabs"></tab-control>
     <script>
     fetch('tabs/config.json')
       .then(r => r.json())
       .then(config => {
         document.getElementById('myTabs').config = config;
       });
     </script>
     ```

  2. **Using a `src` attribute (if supported by your component):**
     ```html
     <tab-control src="tabs/config.json"></tab-control>
     ```
     The component should fetch and load the JSON from the given URL. (You must implement this feature in your web component.)

  ### 2. Static HTML Web Component

  ```html
  <tab-control>
    <nav class="tab-nav" aria-label="Main Tabs">
      <div role="tablist" aria-label="Tab List">
        <button role="tab" aria-selected="true" aria-controls="panel-1" id="tab-1" tabindex="0">Overview</button>
        <button role="tab" aria-selected="false" aria-controls="panel-2" id="tab-2" tabindex="-1">Details</button>
        <button role="tab" aria-selected="false" aria-controls="panel-3" id="tab-3" tabindex="-1">Settings</button>
      </div>
    </nav>
    <div id="panel-1" role="tabpanel" aria-labelledby="tab-1">Overview content here.</div>
    <div id="panel-2" role="tabpanel" aria-labelledby="tab-2" hidden>Details content here.</div>
    <div id="panel-3" role="tabpanel" aria-labelledby="tab-3" hidden>Settings content here.</div>
  </tab-control>
  ```
    <button role="tab" aria-selected="true" aria-controls="panel-1" id="tab-1" tabindex="0">Overview</button>
    <button role="tab" aria-selected="false" aria-controls="panel-2" id="tab-2" tabindex="-1">Details</button>
    <button role="tab" aria-selected="false" aria-controls="panel-3" id="tab-3" tabindex="-1">Settings</button>
  </div>
</nav>
<div id="panel-1" role="tabpanel" aria-labelledby="tab-1">Overview content here.</div>
<div id="panel-2" role="tabpanel" aria-labelledby="tab-2" hidden>Details content here.</div>
<div id="panel-3" role="tabpanel" aria-labelledby="tab-3" hidden>Settings content here.</div>
```

Both approaches can be made accessible and support ARIA, keyboard navigation, and external content loading.

## Loading External HTML and CSS for Tabs


You can specify the `content` property in the tab config as a URL or path to a `.html` file. The tab component can fetch and inject this HTML dynamically when the tab is activated.

**Example: Tab config with external HTML content**
```json
{
  "tabs": [
    { "id": "tab-1", "label": "Overview", "panel": "panel-1", "content": "tabs/overview.html" },
    { "id": "tab-2", "label": "Details", "panel": "panel-2", "content": "tabs/details.html" }
  ]
}
```

**Example: JavaScript to fetch and inject HTML**
```js
async function loadTabContent(tabConfig, panelEl) {
  if (tabConfig.content) {
    const html = await fetch(tabConfig.content).then(r => r.text());
    // Sanitize html if needed
    panelEl.innerHTML = html;
  }
}
// Usage: loadTabContent(tabConfig, document.getElementById(tabConfig.panel));
```

For CSS, you can:

- **Load a CSS file per tab by injecting a `<link>` or `<style>` tag when the tab is activated.**

  **Example: Per-tab CSS injection**
  ```json
  {
    "tabs": [
      { "id": "tab-1", "label": "Overview", "panel": "panel-1", "content": "tabs/overview.html", "css": "tabs/overview.css" },
      { "id": "tab-2", "label": "Details", "panel": "panel-2", "content": "tabs/details.html", "css": "tabs/details.css" }
    ]
  }
  ```
  ```js
  async function loadTabCSS(tabConfig) {
    if (tabConfig.css) {
      let style = document.getElementById('tab-css');
      if (style) style.remove();
      style = document.createElement('link');
      style.rel = 'stylesheet';
      style.href = tabConfig.css;
      style.id = 'tab-css';
      document.head.appendChild(style);
    }
  }
  // Usage: loadTabCSS(tabConfig);
  ```

- **Use a global CSS file for all tabs.**

  **Example: Global CSS**
  ```html
  <link rel="stylesheet" href="tabs/global-tabs.css">
  ```
  Place this in your main HTML file to apply styles to all tabs.


**Security Note:**

- Always sanitize or validate fetched HTML before injecting to prevent XSS.
  
  Example:
  ```js
  async function safeFetchAndInject(url, panelEl) {
    try {
      const response = await fetch(url, { mode: 'cors' });
      if (!response.ok) throw new Error('Network error: ' + response.status);
      let html = await response.text();
      // Basic sanitization: remove <script> tags (for demo only, use DOMPurify or similar in production)
      html = html.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '');
      panelEl.innerHTML = html;
    } catch (err) {
      panelEl.innerHTML = `<div class="error">Failed to load content: ${err.message}</div>`;
    }
  }
  // Usage: safeFetchAndInject('tabs/overview.html', document.getElementById('panel-1'));
  ```
  For production, use a library like DOMPurify for robust sanitization.

- Be aware of CORS and loading timing when fetching external files.

**Example tab config with external HTML and CSS:**
```json
{
  "tabs": [
    { "id": "tab-1", "label": "Overview", "panel": "panel-1", "content": "tabs/overview.html", "css": "tabs/overview.css" },
    { "id": "tab-2", "label": "Details", "panel": "panel-2", "content": "tabs/details.html" }
  ]
}
```

**Example JavaScript for loading external HTML and CSS:**
```js
async function loadTabContent(tabConfig, panelEl) {
  // Load HTML
  if (tabConfig.content) {
    const html = await fetch(tabConfig.content).then(r => r.text());
    // Sanitize html if needed
    panelEl.innerHTML = html;
  }
  // Load CSS
  if (tabConfig.css) {
    let style = document.getElementById('tab-css');
    if (style) style.remove();
    style = document.createElement('link');
    style.rel = 'stylesheet';
    style.href = tabConfig.css;
    style.id = 'tab-css';
    document.head.appendChild(style);
  }
}
// Usage: loadTabContent(tabConfig, document.getElementById(tabConfig.panel));
```

When a tab is activated, call this function to fetch and inject the HTML, and (optionally) load the CSS for that tab.


# Accessible Tab Navigation Component Spec

## Purpose
A tab navigation component provides a way to switch between different views or panels in a single page application. This spec describes a semantic, accessible implementation using HTML, ARIA, and keyboard support.

## Structure
```
<nav class="tab-nav" aria-label="Main Tabs">
  <div role="tablist" aria-label="Tab List">
    <button role="tab" aria-selected="true" aria-controls="panel-1" id="tab-1" tabindex="0">Tab 1</button>
    <button role="tab" aria-selected="false" aria-controls="panel-2" id="tab-2" tabindex="-1">Tab 2</button>
    <button role="tab" aria-selected="false" aria-controls="panel-3" id="tab-3" tabindex="-1">Tab 3</button>
  </div>
</nav>
<div id="panel-1" role="tabpanel" aria-labelledby="tab-1">Panel 1 content</div>
<div id="panel-2" role="tabpanel" aria-labelledby="tab-2" hidden>Panel 2 content</div>
<div id="panel-3" role="tabpanel" aria-labelledby="tab-3" hidden>Panel 3 content</div>
```

## Key Features
- Each tab is a `<button>` with `role="tab"` inside a container with `role="tablist"`.
- Each tab has `aria-controls` pointing to its panel, and each panel has `aria-labelledby` pointing to its tab.
- Only the active tab has `aria-selected="true"` and `tabindex="0"`; others have `aria-selected="false"` and `tabindex="-1"`.
- Only the active panel is visible; others use `hidden`.
- The tablist is inside a `<nav>` for semantic navigation.

## Accessibility
- Keyboard navigation:
  - Left/Right arrows move focus between tabs.
  - Home/End jump to first/last tab.
  - Enter/Space activate the focused tab.
- All ARIA attributes are set for screen readers.
- Panels are linked to tabs for context.

## Example JavaScript (activation logic)
```js
const tabs = document.querySelectorAll('[role="tab"]');
const tabList = document.querySelector('[role="tablist"]');

tabList.addEventListener('keydown', e => {
  const currentTab = document.activeElement;
  let newTab = null;
  if (e.key === 'ArrowRight') {
    newTab = currentTab.nextElementSibling || tabList.firstElementChild;
  } else if (e.key === 'ArrowLeft') {
    newTab = currentTab.previousElementSibling || tabList.lastElementChild;
  } else if (e.key === 'Home') {
    newTab = tabList.firstElementChild;
  } else if (e.key === 'End') {
    newTab = tabList.lastElementChild;
  }
  if (newTab) {
    newTab.focus();
    e.preventDefault();
  }
});

tabs.forEach(tab => {
  tab.addEventListener('click', () => activateTab(tab));
});

function activateTab(tab) {
  tabs.forEach(t => {
    t.setAttribute('aria-selected', 'false');
    t.setAttribute('tabindex', '-1');
    document.getElementById(t.getAttribute('aria-controls')).hidden = true;
  });
  tab.setAttribute('aria-selected', 'true');
  tab.setAttribute('tabindex', '0');
  document.getElementById(tab.getAttribute('aria-controls')).hidden = false;
  tab.focus();
}
```

## Styling
- Use CSS to visually indicate the active tab.
- Ensure focus styles are visible for keyboard users.

## Extensibility
- Can be extended for vertical tabs, icons, or dynamic tab content.
- Panels can contain any HTML content.

---
This spec ensures a semantic, accessible, and user-friendly tab navigation component for modern web applications.
