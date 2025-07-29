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
  try {
    // Check if document is fully loaded and elements exist
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', applyThemeAndLayout);
      return;
    }
    
    // Check if document.documentElement exists before using it
    if (document.documentElement) {
      document.documentElement.setAttribute('data-theme', themeSettings.theme);
      document.documentElement.setAttribute('data-mode', themeSettings.mode);
    }
    
    // Check if document.body exists before using it
    if (document.body) {
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
    }
    
    // Apply all color variables to :root if document.documentElement exists
    if (document.documentElement) {
      const root = document.documentElement;
      
      // Apply theme color variables
      root.style.setProperty('--primary', themeSettings.colors.primary || '#6366f1');
      root.style.setProperty('--secondary', themeSettings.colors.secondary || '#9333ea');
      root.style.setProperty('--accent', themeSettings.colors.accent || '#10b981');
      root.style.setProperty('--primary-light', themeSettings.colors.primaryLight || '#8f91f3');
      root.style.setProperty('--primary-dark', themeSettings.colors.primaryDark || '#4244b8');
      root.style.setProperty('--hover-color', themeSettings.colors.hoverColor || themeSettings.colors.primary || '#6366f1');
    }
    
    console.log('✓ Theme and layout settings applied successfully');
  } catch (error) {
    console.error('Error applying theme settings:', error);
  }
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

/**
 * Loads HTML sections via fetch API
 */
function loadSections() {
  // Check for section placeholders and load if present
  if (document.getElementById('header-placeholder')) {
  loadSection('sections/header.html', 'header-placeholder');
  }
  
  if (document.getElementById('navigation-placeholder')) {
  loadSection('sections/navigation.html', 'navigation-placeholder');
  }
  
  if (document.getElementById('footer-placeholder')) {
  loadSection('sections/footer.html', 'footer-placeholder');
  }
}

/**
 * Loads a section HTML file into a specified element
 * @param {string} url - Path to the section HTML file
 * @param {string} elementId - Target element ID to inject the section
 */
function loadSection(url, elementId) {
  fetch(url)
    .then(response => {
      if (!response.ok) {
  throw new Error(`Failed to load section: ${response.status}`);
      }
      return response.text();
    })
    .then(data => {
      document.getElementById(elementId).innerHTML = data;
      
  // Run initialization after section is loaded if needed
      if (url.includes('header.html')) {
        setActiveNavLink();
      }
    })
    .catch(error => {
  console.error('Error loading section:', error);
      document.getElementById(elementId).innerHTML = `<p>Error loading content. Please refresh or try again later.</p>`;
    });
}

// Initialize everything when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Apply theme settings
  applyThemeAndLayout();
  
  // Load sections if present on the page
  loadSections();
  
  // Set active navigation link
  setActiveNavLink();
  
  // Initialize back to top functionality
  initBackToTop();
  
  // Initialize mobile menu
  initMobileMenu();
});

// Initialize mobile menu functionality
function initMobileMenu() {
  const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
  const navList = document.getElementById('nav-list');
  
  if (mobileMenuToggle && navList) {
    mobileMenuToggle.addEventListener('click', function() {
      navList.classList.toggle('show');
      mobileMenuToggle.textContent = navList.classList.contains('show') ? '✕ Close' : '☰ Menu';
    });
    
    // Close mobile menu when a link is clicked
    const navLinks = navList.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', function() {
        if (window.innerWidth < 768) {
          navList.classList.remove('show');
          mobileMenuToggle.textContent = '☰ Menu';
        }
      });
    });
    
    // Close mobile menu when clicking outside of it
    document.addEventListener('click', function(event) {
      const isClickInside = navList.contains(event.target) || mobileMenuToggle.contains(event.target);
      if (!isClickInside && navList.classList.contains('show') && window.innerWidth < 768) {
        navList.classList.remove('show');
        mobileMenuToggle.textContent = '☰ Menu';
      }
    });
    
    // Hide menu on scroll (after scrolling a bit)
    let lastScrollTop = 0;
    window.addEventListener('scroll', function() {
      const st = window.pageYOffset || document.documentElement.scrollTop;
      if (st > lastScrollTop && st > 100) {
        // Scrolling down and past 100px
        if (navList.classList.contains('show') && window.innerWidth < 768) {
          navList.classList.remove('show');
          mobileMenuToggle.textContent = '☰ Menu';
        }
      }
      lastScrollTop = st <= 0 ? 0 : st;
    }, { passive: true });
  }
}

// Apply settings when script loads, but safely wait for DOM if needed
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() {
    setTimeout(applyThemeAndLayout, 0);
  });
} else {
  // Document already loaded, run now but in the next tick
  setTimeout(applyThemeAndLayout, 0);
}
