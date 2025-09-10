// Footer Navigation Fix
// This script adds a dedicated event listener to footer links to ensure they work properly
// It also fixes the tab-control.css loading issue

document.addEventListener('DOMContentLoaded', () => {
  console.log('🔧 Footer Navigation Fix: Initializing');
  
  // This is a redundant alternative approach to ensure the tab-control.css is loaded
  // The web component already has the correct path in its template, but this provides a fallback
  // in case Shadow DOM encapsulation causes issues with loading the CSS
  const cssFixElement = document.createElement('link');
  cssFixElement.rel = 'stylesheet';
  cssFixElement.href = '/js/wc-tab-control/tab-control.css';
  cssFixElement.id = 'tab-control-css-fix';
  document.head.appendChild(cssFixElement);
  console.log('🎨 Added tab-control CSS as global fallback (may be redundant)');
  
  // DISABLED: This function has been disabled to avoid conflict with navigation.js
  // Navigation is now handled by the NavigationManager in navigation.js
  // Keeping this code for reference only
  /*
  function navigateToSection(sectionId) {
    // Find the target section
    const targetSection = document.getElementById(sectionId);
    if (!targetSection) {
      console.error(`❌ Section not found: #${sectionId}`);
      console.log('Available sections:',
        Array.from(document.querySelectorAll('.page-section')).map(s => s.id)
      );
      return false;
    }
    
    console.log('✅ Found target section:', targetSection.id);

    // 1. Make all sections inactive
    document.querySelectorAll('.page-section').forEach(section => {
      section.classList.remove('active');
    });

    // 2. Make target section active
    targetSection.classList.add('active');

    // 3. Update URL hash
    history.pushState(null, null, `#${sectionId}`);

    // 4. Ensure the section is visible before scrolling
    // This is critical for accurate measurements
    setTimeout(() => {
      // 5. Scroll to the top of the section with small offset for better visibility
      const headerElement = document.querySelector('header');
      const headerHeight = headerElement ? headerElement.offsetHeight : 60;
      const yOffset = -(headerHeight + 20); // Header height plus padding
      const y = targetSection.getBoundingClientRect().top + window.pageYOffset + yOffset;

      // 6. Perform smooth scroll
      window.scrollTo({
        top: y,
        behavior: 'smooth'
      });
      
      console.log(`🔄 Scrolled to section ${sectionId} with offset ${yOffset}px`);
    }, 50); // Small delay to ensure DOM update
    
    return true;
  }
  */
  
  // Integration with EyeCareApp for footer navigation
  console.log('🔗 Setting up footer links to work with EyeCareApp');
  
  // Add click handler for footer links
  document.addEventListener('click', (event) => {
    // Check if the clicked element is a footer link or a child of a footer link
    const linkEl = event.target.closest('.footer-link');
    if (!linkEl) return;
      
    console.log('🔗 Footer link clicked:', linkEl.textContent);
    
    // Get the target section ID from the href attribute
    const href = linkEl.getAttribute('href');
    if (!href || !href.startsWith('#')) return;
    
    const sectionId = href.substring(1);
    console.log(`📍 Target section: #${sectionId}`);
    
    // Use the EyeCareApp instance if available - it has dedicated methods for policies
    if (window.eyeCareAppInstance) {
      console.log('✅ Using EyeCareApp instance for navigation');
      event.preventDefault(); // Prevent default only if we'll handle it
      
      // Use the app's loadPage method which has generatePrivacyPage and generateTermsPage
      window.eyeCareAppInstance.loadPage(sectionId);
      window.eyeCareAppInstance.updateURL(sectionId);
      
      // Update active navigation if applicable
      const navLink = document.querySelector(`[data-section="${sectionId}"]`);
      if (navLink) {
        window.eyeCareAppInstance.updateActiveNavLink(navLink);
      }
    } else {
      // If eyeCareAppInstance isn't available, let browser handle it
      console.log('ℹ️ EyeCareApp not found, using default browser navigation');
    }
  });
  
  // DISABLED: This hash handling has been disabled to avoid conflict with navigation.js
  // URL hash is now handled by the NavigationManager in navigation.js
  // Keeping this code for reference only
  /*
  if (window.location.hash) {
    const sectionId = window.location.hash.substring(1);
    console.log(`🔍 Found hash in URL: #${sectionId}`);
    
    // Wait a bit longer for initial load to ensure all content is ready
    setTimeout(() => {
      navigateToSection(sectionId);
    }, 300);
  }
  */

  // NOTE: The tab component already uses the correct absolute path in its template:
  // template.innerHTML = `<style>@import url('/js/wc-tab-control/tab-control.css');</style>...
  // This redundant fix code has been removed since it's no longer needed
  // The original component correctly specifies the path

  console.log('✅ Footer Navigation Fix: Initialized');
});