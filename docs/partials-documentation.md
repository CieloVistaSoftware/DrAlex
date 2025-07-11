# HTML Partials System

## Overview

The HTML Partials system allows for modular web development by breaking the website into reusable components. This approach improves maintainability, consistency, and development efficiency.

## Available Partials

### 1. Header Partial (`header.html`)

Contains the site header with logo and theme controls:

```html
<!-- Header Partial -->
<header id="site-header" class="site-header">
  <div class="header-content">
    <div class="logo">
      <a href="index.html">
        <img src="images/DrAlex.jpeg" alt="Dr. Alex Kisitu Logo" width="60" height="60">
        <span>Dr. Alex Kisitu</span>
      </a>
    </div>
    
    <div class="theme-controls">
      <select class="theme-selector" aria-label="Select theme">
        <option value="ocean">Ocean</option>
        <option value="forest">Forest</option>
        <option value="sunset">Sunset</option>
        <option value="cyberpunk">Cyberpunk</option>
        <option value="default">Default</option>
      </select>
      
      <button class="mode-toggle" aria-label="Toggle dark/light mode">
        <span class="light-icon">☀️</span>
        <span class="dark-icon">🌙</span>
      </button>
    </div>
  </div>
</header>
```

### 2. Navigation Partial (`navigation.html`)

Contains the main site navigation menu:

```html
<!-- Navigation (Sticky) -->
<nav id="site-nav" class="site-nav">
  <ul id="nav-list" class="nav-list">
    <li><a href="index.html" class="nav-link">Home</a></li>
    <li><a href="about.html" class="nav-link">About</a></li>
    <li><a href="services.html" class="nav-link">Services</a></li>
    <li><a href="portfolio.html" class="nav-link">Portfolio</a></li>
    <li><a href="contact.html" class="nav-link">Contact</a></li>
  </ul>
</nav>
```

### 3. Footer Partial (`footer.html`)

Contains the site footer with copyright information and social links:

```html
<!-- Footer Partial -->
<footer id="site-footer" class="site-footer">
  <div class="footer-content">
    <p>&copy; 2025 Dr. Alex Kisitu. All rights reserved.</p>
    <div class="social-links">
      <a href="#" class="social-link">Facebook</a>
      <a href="#" class="social-link">Twitter</a>
      <a href="#" class="social-link">LinkedIn</a>
      <a href="#" class="social-link">Instagram</a>
    </div>
  </div>
</footer>
```

## Using Partials in Your Pages

### Basic Page Template

```html
<!DOCTYPE html>
<html lang="en" data-theme="ocean" data-mode="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Page Title - Dr. Alex Kisitu</title>
  <meta name="description" content="Page description here">
  <meta name="keywords" content="relevant, keywords, here">
  <link rel="stylesheet" href="css/styles.css">
  <script src="js/scripts.js"></script>
</head>
<body data-theme="ocean" data-layout="left-nav" data-mode="dark" class="theme-ocean dark-mode">
  <div id="site-container" class="site-container">
    <!-- Header placeholder -->
    <div id="header-placeholder"></div>
    
    <!-- Navigation placeholder -->
    <div id="navigation-placeholder"></div>
    
    <!-- Main Content -->
    <main id="main-content" class="main-content">
      <!-- Your page content here -->
    </main>
    
    <!-- Footer placeholder -->
    <div id="footer-placeholder"></div>
  </div>
</body>
</html>
```

### JavaScript Integration

The partials are loaded automatically by the `scripts.js` file, which includes the following function:

```javascript
/**
 * Loads HTML partials via fetch API
 */
function loadPartials() {
  // Check for partials placeholders and load if present
  if (document.getElementById('header-placeholder')) {
    loadPartial('partials/header.html', 'header-placeholder');
  }
  
  if (document.getElementById('navigation-placeholder')) {
    loadPartial('partials/navigation.html', 'navigation-placeholder');
  }
  
  if (document.getElementById('footer-placeholder')) {
    loadPartial('partials/footer.html', 'footer-placeholder');
  }
}

/**
 * Loads a partial HTML file into a specified element
 * @param {string} url - Path to the partial HTML file
 * @param {string} elementId - Target element ID to inject the partial
 */
function loadPartial(url, elementId) {
  fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Failed to load partial: ${response.status}`);
      }
      return response.text();
    })
    .then(data => {
      document.getElementById(elementId).innerHTML = data;
      
      // Run initialization after partial is loaded if needed
      if (url.includes('header.html')) {
        setActiveNavLink();
      }
    })
    .catch(error => {
      console.error('Error loading partial:', error);
      document.getElementById(elementId).innerHTML = `<p>Error loading content. Please refresh or try again later.</p>`;
    });
}
```

## Example Pages

1. **partials-example.html** - Demonstrates the basic usage of partials with explanations
2. **example-js.html** - Shows a complete page using the partials system
3. **new-page-template.html** - A starter template for creating new pages

## Best Practices

1. **Keep partials focused** - Each partial should have a single responsibility
2. **Test with Live Server** - Always preview with a local server due to CORS restrictions
3. **Maintain consistent IDs** - Use the standard placeholder IDs (`header-placeholder`, `navigation-placeholder`, `footer-placeholder`)
4. **Modify partials carefully** - Changes to partials affect all pages using them

## Creating New Pages

1. Copy `new-page-template.html` to start a new page
2. Update the page title, meta description, and keywords
3. Add your page-specific content in the `main-content` section
4. The partials will be automatically loaded by `scripts.js`

## Adding New Partials

To add a new partial:

1. Create a new HTML file in the `partials` directory
2. Add a placeholder div in your pages where needed:
   ```html
   <div id="your-partial-placeholder"></div>
   ```
3. Update the `loadPartials()` function in `scripts.js`:
   ```javascript
   if (document.getElementById('your-partial-placeholder')) {
     loadPartial('partials/your-partial.html', 'your-partial-placeholder');
   }
   ```

## Troubleshooting

- If partials aren't loading, check the browser console for errors
- Ensure you're using a local server (like Live Server) to preview files
- Verify that all placeholders have the correct IDs
- Check that the paths to partial files are correct
