// Section Navigation for HTMX version
document.addEventListener('DOMContentLoaded', function() {
    // Function to show a specific section and hide others
    function showSection(sectionId) {
        // Hide all sections
        document.querySelectorAll('.page-section').forEach(section => {
            section.classList.add('hidden');
        });
        
        // Show the selected section
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.remove('hidden');
            console.log(`✓ Showing section: ${sectionId}`);
            
            // Update title based on active nav item
            updatePageTitle(sectionId);
        } else {
            console.error(`⚠️ Section not found: ${sectionId}`);
            // Show home as fallback
            const homeSection = document.getElementById('home');
            if (homeSection) {
                homeSection.classList.remove('hidden');
                console.log('✓ Showing home section as fallback');
            }
        }
    }
    
    // Update page title based on active section
    function updatePageTitle(sectionId) {
        const navItem = document.querySelector(`[data-section="${sectionId}"]`);
        if (navItem) {
            const navText = navItem.textContent.trim();
            document.title = `SEHT - ${navText}`;
        }
    }
    
    // Handle navigation clicks
    function setupNavigationHandlers() {
        // All nav links and footer links
        const allLinks = document.querySelectorAll('.nav-link, .footer-link');
        
        allLinks.forEach(link => {
            link.addEventListener('click', function(event) {
                event.preventDefault();
                
                // Get section ID from data-section attribute
                const sectionId = this.getAttribute('data-section');
                if (sectionId) {
                    // Update active class on nav items
                    if (this.classList.contains('nav-link')) {
                        document.querySelectorAll('.nav-link').forEach(item => {
                            item.classList.remove('active');
                        });
                        this.classList.add('active');
                    }
                    
                    // Show the section
                    showSection(sectionId);
                    
                    // Update URL without hash for cleaner URLs
                    history.pushState(null, null, window.location.pathname);
                    
                    // Close mobile menu if it's open
                    if (window.innerWidth < 1025) {
                        document.getElementById('site-nav').classList.remove('open');
                    }
                }
            });
        });
    }
    
    // Handle direct URL on load
    function handleInitialNavigation() {
        let targetSectionId = 'home'; // Always default to home section
        
        // Show the target section
        showSection(targetSectionId);
        
        // Set active class on corresponding nav item
        const navItem = document.querySelector(`a.nav-link[href="#${targetSectionId}"]`);
        if (navItem) {
            document.querySelectorAll('.nav-link').forEach(item => {
                item.classList.remove('active');
            });
            navItem.classList.add('active');
        }
    }
    
    // Handle popstate event (back/forward buttons)
    window.addEventListener('popstate', function() {
        handleInitialNavigation();
    });
    
    // Initialize navigation
    setupNavigationHandlers();
    handleInitialNavigation();
});