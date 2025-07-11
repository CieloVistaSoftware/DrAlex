# Using HTML Partials with JavaScript

This document explains how to implement reusable HTML partials in your website using pure JavaScript, no PHP required.

## What Are Partials?

Partials are reusable HTML components that can be included in multiple pages. This helps maintain consistency across your website and makes updates easier, as you only need to change the code in one place.

## File Structure

```
/
├── index.html              # Main homepage
├── partials/               # Folder containing all partial HTML files
│   ├── header.html         # Site header with navigation
│   ├── footer.html         # Site footer with copyright and social links
│   └── sidebar.html        # Optional sidebar components
├── css/                    # CSS stylesheets
├── js/                     # JavaScript files
└── partials-example.html   # Example showing how to use partials
```

## How to Use HTML Partials

There are two main ways to implement HTML partials without server-side languages:

### 1. JavaScript Fetch API (Recommended)

This method uses the Fetch API to load HTML partials at runtime:

```html
<!-- In your main HTML file -->
<div id="header-placeholder"></div>
<div id="main-content">
  <!-- Your page content here -->
</div>
<div id="footer-placeholder"></div>

<script>
  // Function to load partials
  function loadPartial(url, elementId) {
    fetch(url)
      .then(response => response.text())
      .then(data => {
        document.getElementById(elementId).innerHTML = data;
      })
      .catch(error => {
        console.error('Error loading partial:', error);
      });
  }

  // Load header and footer when the DOM is fully loaded
  document.addEventListener('DOMContentLoaded', function() {
    loadPartial('partials/header.html', 'header-placeholder');
    loadPartial('partials/footer.html', 'footer-placeholder');
  });
</script>
```

### 2. HTML Imports with JavaScript Templates

Another approach is to use HTML templates:

```html
<!-- In your main HTML file -->
<template id="header-template"></template>
<template id="footer-template"></template>

<div id="header-container"></div>
<div id="main-content">
  <!-- Your page content here -->
</div>
<div id="footer-container"></div>

<script>
  async function loadTemplate(templateId, url, containerId) {
    const template = document.getElementById(templateId);
    const container = document.getElementById(containerId);
    
    try {
      const response = await fetch(url);
      const html = await response.text();
      template.innerHTML = html;
      container.appendChild(template.content.cloneNode(true));
    } catch (error) {
      console.error(`Failed to load template: ${url}`, error);
    }
  }
  
  document.addEventListener('DOMContentLoaded', function() {
    loadTemplate('header-template', 'partials/header.html', 'header-container');
    loadTemplate('footer-template', 'partials/footer.html', 'footer-container');
  });
</script>
```

## Example Implementation

See the working example in `partials-example.html` which demonstrates how to:

1. Load the header and footer partials
2. Structure your main page content
3. Handle theme preferences and layout settings

## Best Practices

1. **Keep partials focused** - Each partial should serve a single purpose
2. **Minimize dependencies** - Partials should work with minimal external dependencies
3. **Test on local server** - Always test with a local server (like Live Server in VS Code)
4. **Handle loading states** - Consider showing loading indicators while partials load
5. **Error handling** - Implement proper error handling if partials fail to load

## Important Notes

- This approach requires viewing the files through a web server (like VS Code's Live Server)
- Direct file opening may not work due to browser security restrictions (CORS policy)
- For production, consider bundling the HTML partials during your build process for better performance
