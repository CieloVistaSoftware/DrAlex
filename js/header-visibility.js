// Header Visibility Manager - Show header only when Home section is active
(function() {
    // Wait for DOM to be ready
    function init() {
        // Get references to elements
        const header = document.getElementById('mainHeader');
        
        if (!header) {
            console.error('Header element not found');
            return;
        }
        
        // Initialize header visibility based on current section
        updateHeaderVisibility();
        
        // Set up hover effect for touch devices
        initializeHoverEffect();
        
        // Create a MutationObserver to watch for changes to the active section
        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                if (mutation.attributeName === 'class') {
                    // Check if a section was activated
                    if (mutation.target.classList.contains('active')) {
                        updateHeaderVisibility();
                    }
                }
            });
        });
        
        // Observe all page sections for class changes
        const pageSections = document.querySelectorAll('.page-section');
        pageSections.forEach(section => {
            observer.observe(section, { attributes: true });
        });
        
        // Function to update header visibility
        function updateHeaderVisibility() {
            const homeSection = document.getElementById('home');
            
            // Check if home section is active
            if (homeSection && homeSection.classList.contains('active')) {
                // Show header when home is active
                header.style.display = 'flex';
                
                // Re-initialize hover effect when header becomes visible
                initializeHoverEffect();
            } else {
                // Hide header for all other sections
                header.style.display = 'none';
            }
        }
        
        // Function to initialize hover effect for touch devices
        function initializeHoverEffect() {
            const logoContainer = document.querySelector('.logo-hover-container');
            const contentOverlay = document.querySelector('.header-content-overlay');
            
            if (!logoContainer || !contentOverlay) {
                return;
            }
            
            // For touch devices, toggle overlay on tap
            logoContainer.addEventListener('click', function(e) {
                // Only handle click for touch devices, not mouse clicks
                if (window.matchMedia('(hover: none)').matches) {
                    e.preventDefault();
                    contentOverlay.style.opacity = contentOverlay.style.opacity === '1' ? '0' : '1';
                }
            });
        }
        
        // Listen for navigation events
        if (window.navigationManager) {
            // Monitor current section changes
            const originalShowSection = window.navigationManager.showSection;
            window.navigationManager.showSection = function(sectionId) {
                // Call original method
                originalShowSection.call(window.navigationManager, sectionId);
                
                // Update header visibility
                updateHeaderVisibility();
            };
        } else {
            console.warn('Navigation manager not found, header visibility may not update correctly');
        }
    }

    // Initialize either when DOM is ready or immediately if already loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();