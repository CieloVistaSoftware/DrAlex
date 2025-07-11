// Theme settings object
const themeSettings = {
  "theme": "ocean",
  "mode": "dark",
  "layout": "left-nav",
  "colors": {
    "primary": "#6366f1",
    "secondary": "#9333ea",
    "accent": "#10b981",
    "primaryLight": "#8f91f3",
    "primaryDark": "#4244b8",
    "hoverColor": "#6366f1"
  },
  "websiteTitle": "Dr. Alex Kisitu"
};

// Function to apply theme settings and layout
function applyThemeAndLayout() {
  // Set attributes on HTML and BODY elements
  document.documentElement.setAttribute('data-theme', themeSettings.theme);
  document.documentElement.setAttribute('data-mode', themeSettings.mode);
  document.body.setAttribute('data-theme', themeSettings.theme);
  document.body.setAttribute('data-mode', themeSettings.mode);
  document.body.setAttribute('data-layout', themeSettings.layout || 'left-nav');
  
  // Set proper class names
  let classNames = ['theme-' + themeSettings.theme];
  if (themeSettings.mode === 'dark') {
    classNames.push('dark-mode');
    document.body.classList.remove('light-mode');
  } else {
    classNames.push('light-mode');
    document.body.classList.remove('dark-mode');
  }
  
  // Apply all classes
  document.body.className = document.body.className
    .split(' ')
    .filter(cls => !cls.startsWith('theme-') && cls !== 'dark-mode' && cls !== 'light-mode')
    .concat(classNames)
    .join(' ');
  
  // Apply all color variables to :root
  const root = document.documentElement;
  
  // Apply theme color variables
  root.style.setProperty('--primary', themeSettings.colors.primary || '#6366f1');
  root.style.setProperty('--secondary', themeSettings.colors.secondary || '#9333ea');
  root.style.setProperty('--accent', themeSettings.colors.accent || '#10b981');
  root.style.setProperty('--primary-light', themeSettings.colors.primaryLight || '#8f91f3');
  root.style.setProperty('--primary-dark', themeSettings.colors.primaryDark || '#4244b8');
  root.style.setProperty('--hover-color', themeSettings.colors.hoverColor || themeSettings.colors.primary || '#6366f1');
  
  console.log('✓ Theme and layout settings applied successfully');
}

// Set active navigation link based on current page
function setActiveNavLink() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.nav-link');
  
  navLinks.forEach(link => {
    // Get the href value and extract just the filename
    const href = link.getAttribute('href');
    const hrefPage = href.split('#')[0] || 'index.html';
    
    // Check if this link corresponds to current page
    if (hrefPage === currentPage || 
        (currentPage === 'index.html' && href.includes('#') && !hrefPage)) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

// Back to top button functionality
function initBackToTop() {
  const backToTopButton = document.querySelector('.back-to-top');
  
  if (backToTopButton) {
    // Show/hide button based on scroll position
    window.addEventListener('scroll', () => {
      if (window.pageYOffset > 300) {
        backToTopButton.style.display = 'flex';
      } else {
        backToTopButton.style.display = 'none';
      }
    });
    
    // Scroll to top when clicked
    backToTopButton.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    
    // Initially hide the button
    backToTopButton.style.display = 'none';
  }
}

// Initialize everything when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Apply theme settings
  applyThemeAndLayout();
  
  // Set active navigation link
  setActiveNavLink();
  
  // Initialize back to top functionality
  initBackToTop();
});

// Apply settings immediately to avoid FOUC (Flash of Unstyled Content)
applyThemeAndLayout();
