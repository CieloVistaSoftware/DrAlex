/**
 * Dr. Alex Kisitu Website
 * Partials Loader and Theme Management
 */

// Helper function to load HTML partials
function loadPartial(url, elementId) {
  return fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Failed to load partial: ${url}`);
      }
      return response.text();
    })
    .then(data => {
      const element = document.getElementById(elementId);
      if (element) {
        element.innerHTML = data;
        return element;
      } else {
        console.error(`Element with ID '${elementId}' not found`);
        return null;
      }
    })
    .catch(error => {
      console.error('Error loading partial:', error);
      return null;
    });
}

// Load all partials in sequence
function loadAllPartials() {
  // First load the header
  loadPartial('partials/header.html', 'header-placeholder')
    .then(() => {
      // After header is loaded, load the navigation
      return loadPartial('partials/navigation.html', 'navigation-placeholder');
    })
    .then(() => {
      // Finally load the footer
      return loadPartial('partials/footer.html', 'footer-placeholder');
    })
    .then(() => {
      // Initialize theme and layout after all partials are loaded
      initializeTheme();
    })
    .catch(error => {
      console.error('Error in loading sequence:', error);
    });
}

// Initialize theme based on data attributes
function initializeTheme() {
  const body = document.body;
  const theme = body.getAttribute('data-theme') || 'ocean';
  const mode = body.getAttribute('data-mode') || 'dark';
  const layout = body.getAttribute('data-layout') || 'left-nav';
  
  body.className = `theme-${theme} ${mode}-mode layout-${layout}`;
  
  // Set up theme selector events if they exist
  const themeSelector = document.querySelector('.theme-selector');
  const modeToggle = document.querySelector('.mode-toggle');
  
  if (themeSelector) {
    themeSelector.addEventListener('change', function() {
      const newTheme = this.value;
      body.setAttribute('data-theme', newTheme);
      body.className = body.className.replace(/theme-\w+/, `theme-${newTheme}`);
    });
  }
  
  if (modeToggle) {
    modeToggle.addEventListener('click', function() {
      const currentMode = body.getAttribute('data-mode');
      const newMode = currentMode === 'dark' ? 'light' : 'dark';
      body.setAttribute('data-mode', newMode);
      body.className = body.className.replace(/\b(dark|light)-mode\b/, `${newMode}-mode`);
    });
  }
}

// Initialize when DOM is fully loaded
document.addEventListener('DOMContentLoaded', loadAllPartials);
