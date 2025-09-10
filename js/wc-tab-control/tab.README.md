
# <tab-control> Web Component

See the main specification in `../../docs/tab-component-spec.md` for full details, configuration, and usage examples.

## Quick Start

1. **Include the component JS and CSS:**
   ```html
   <script type="module" src="js/Tab-Component/tab-control.js"></script>
   <link rel="stylesheet" href="js/Tab-Component/tab-control.css">
   ```

2. **Use in your HTML:**
   ```html
   <tab-control config='{"tabs":[{"id":"tab-1","label":"Tab 1","panel":"panel-1","content":"data:text/html,<p>Tab1</p>"},{"id":"tab-2","label":"Tab 2","panel":"panel-2","content":"data:text/html,<p>Tab2</p>"}],"defaultTab":"tab-1"}'></tab-control>
   ```

3. **Minimal working demo HTML:**
   ```html
   <!DOCTYPE html>
   <html lang="en">
   <head>
     <meta charset="UTF-8">
     <title>Tab Control Demo</title>
     <script type="module" src="js/Tab-Component/tab-control.js"></script>
     <link rel="stylesheet" href="js/Tab-Component/tab-control.css">
   </head>
   <body>
     <tab-control config='{"tabs":[{"id":"tab-1","label":"Tab 1","panel":"panel-1","content":"data:text/html,<p>Tab1</p>"},{"id":"tab-2","label":"Tab 2","panel":"panel-2","content":"data:text/html,<p>Tab2</p>"}],"defaultTab":"tab-1"}'></tab-control>
   </body>
   </html>
   ```

**Note:**
- `tab-control.html` in this folder is a template fragment for the component's shadow DOM, not a standalone demo. Use the example above for testing in a browser.

See the spec for advanced configuration, accessibility, and dynamic content loading.
