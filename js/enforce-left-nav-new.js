// Enforce Left Navigation Layout
document.addEventListener('DOMContentLoaded', function() {
    // Set data-layout attribute on document body
    if (document.body) {
        document.body.setAttribute('data-layout', 'left-nav');
        console.log('✅ Left navigation layout enforced');
    }
    
    // Hide .site-container if it exists
    const siteContainer = document.querySelector('.site-container');
    if (siteContainer && siteContainer.className === 'site-container') {
        // Try to convert it to two-column-layout
        siteContainer.className = 'two-column-layout';
        console.log('✅ Converted site-container to two-column-layout');
    }
    
    // Make sure .two-column-layout exists and is visible
    let twoColumnLayout = document.querySelector('.two-column-layout');
    if (!twoColumnLayout) {
        // Create .two-column-layout if it doesn't exist
        twoColumnLayout = document.createElement('div');
        twoColumnLayout.className = 'two-column-layout';
        
        // Find the site-nav element
        const siteNav = document.querySelector('nav.site-nav, aside.site-nav, [role="navigation"]');
        
        // Find the main-column element or create it
        let mainColumn = document.querySelector('.main-column');
        if (!mainColumn) {
            mainColumn = document.createElement('div');
            mainColumn.className = 'main-column';
        }
        
        // Move all content except site-nav into main-column
        const children = Array.from(document.body.children);
        for (const child of children) {
            if (child !== siteNav && child !== twoColumnLayout && 
                !child.classList.contains('loading-overlay') && 
                !child.classList.contains('mobile-toggle') && 
                !child.classList.contains('sr-only')) {
                mainColumn.appendChild(child);
            }
        }
        
        // Add site-nav and main-column to two-column-layout
        if (siteNav) {
            siteNav.className = 'site-nav';
            siteNav.id = 'site-nav';
            twoColumnLayout.appendChild(siteNav);
        }
        
        twoColumnLayout.appendChild(mainColumn);
        
        // Append the new layout to the body
        document.body.appendChild(twoColumnLayout);
        console.log('✅ Two-column layout created and organized');
    }
});

// Also run on load to ensure all resources are loaded
window.addEventListener('load', function() {
    // Same logic as above, but run after all resources are loaded
    if (document.body) {
        document.body.setAttribute('data-layout', 'left-nav');
    }
});