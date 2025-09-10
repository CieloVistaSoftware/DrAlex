// Simple Navigation System - Robust Error Handling
class NavigationManager {
    constructor() {
        this.currentSection = 'home';
        this.init();
    }

    init() {
        try {
            this.setupNavigation();
            this.setupMobileToggle();
            console.log('✅ Navigation initialized');
        } catch (error) {
            console.error('❌ Navigation initialization failed:', error);
        }
    }

    setupNavigation() {
        // Handle both navigation and footer links
        document.addEventListener('click', (e) => {
            // Handle both nav-link and footer-link classes
            const link = e.target.closest('.nav-link, .footer-link');
            if (link) {
                e.preventDefault();
                console.log(`Navigation link clicked: ${link.textContent.trim()}`);
                
                // Get section ID from data-section attribute
                const sectionId = link.getAttribute('data-section');
                if (sectionId) {
                    console.log(`📍 Navigating to section: ${sectionId}`);
                    
                    // Add debugging to ensure sections exist
                    const targetSection = document.getElementById(sectionId);
                    if (!targetSection) {
                        console.error(`🔴 Section not found: #${sectionId}`);
                        // Log all available sections for debugging
                        const sections = Array.from(document.querySelectorAll('.page-section')).map(s => s.id);
                        console.log('Available sections:', sections);
                    } else {
                        console.log(`✅ Section found: #${sectionId}`);
                    }
                    
                    // Provide visual feedback before closing menu on mobile
                    if (window.innerWidth <= 1024 && link.classList.contains('nav-link')) {
                        // Add visual feedback class
                        link.classList.add('nav-link-clicked');
                        
                        // Delay navigation slightly to show the feedback
                        setTimeout(() => {
                            this.showSection(sectionId);
                            this.updateActiveNav(link);
                            // Remove the feedback class
                            link.classList.remove('nav-link-clicked');
                            // Close menu with delay to show the feedback
                            setTimeout(() => this.closeMobileMenu(), 300);
                        }, 200);
                    } else {
                        // On desktop, navigate immediately
                        this.showSection(sectionId);
                        this.updateActiveNav(link);
                    }
                }
            }
        });
    }

    setupMobileToggle() {
        const mobileToggle = document.getElementById('mobile-toggle');
        const siteNav = document.getElementById('site-nav');

        if (!mobileToggle || !siteNav) {
            console.warn('Mobile toggle or site nav not found');
            return;
        }

        mobileToggle.addEventListener('click', (e) => {
            e.preventDefault();
            const isOpen = siteNav.classList.contains('open');
            
            if (isOpen) {
                this.closeMobileMenu();
            } else {
                this.openMobileMenu();
            }
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 1024 && 
                !siteNav.contains(e.target) && 
                !mobileToggle.contains(e.target) &&
                siteNav.classList.contains('open')) {
                this.closeMobileMenu();
            }
        });

        // Close menu on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && siteNav.classList.contains('open')) {
                this.closeMobileMenu();
            }
        });
    }

    openMobileMenu() {
        const siteNav = document.getElementById('site-nav');
        const mobileToggle = document.getElementById('mobile-toggle');
        
        if (siteNav) {
            siteNav.classList.add('open');
        }
        
        if (mobileToggle) {
            mobileToggle.setAttribute('aria-expanded', 'true');
            mobileToggle.textContent = '✕';
        }
    }

    closeMobileMenu() {
        const siteNav = document.getElementById('site-nav');
        const mobileToggle = document.getElementById('mobile-toggle');
        
        if (siteNav) {
            siteNav.classList.remove('open');
        }
        
        if (mobileToggle) {
            mobileToggle.setAttribute('aria-expanded', 'false');
            mobileToggle.textContent = 'Menu';
        }
    }

    showSection(sectionId) {
        try {
            console.log(`🔍 Attempting to show section: ${sectionId}`);
            
            // Clean sectionId if it starts with #
            if (sectionId.startsWith('#')) {
                sectionId = sectionId.substring(1);
            }
            
            // Additional debug
            console.log(`Navigation to section ID: ${sectionId}`);
            
            // Log all available sections
            const allSections = document.querySelectorAll('.page-section');
            console.log('Available sections:', Array.from(allSections).map(s => s.id));
            
            // Hide all sections
            console.log(`Found ${allSections.length} page sections`);
            
            allSections.forEach(section => {
                if (section) {
                    section.classList.remove('active');
                    section.style.display = 'none'; // Ensure sections are hidden
                    console.log(`Hidden section: ${section.id}`);
                }
            });

            // Show target section
            const targetSection = document.getElementById(sectionId);
            if (targetSection) {
                // Make section active
                targetSection.classList.add('active');
                targetSection.style.display = 'block'; // Explicitly show the section
                this.currentSection = sectionId;
                
                console.log(`✅ Section ${sectionId} activated - Display: ${targetSection.style.display}, Classes: ${targetSection.className}`);
                
                // Update page title
                this.updatePageTitle(sectionId);
                
                // Update URL without hash for cleaner URLs
                if (history.pushState) {
                    history.pushState(null, null, window.location.pathname);
                }
                
                // No scrolling or movement of the page
                // This ensures the navigation sidebar stays in place
                console.log(`📜 Section ${sectionId} activated without scrolling`);
            } else {
                console.warn(`⚠️ Section not found: ${sectionId}`);
                console.log('Looking for any element with that ID');
                const anyElement = document.getElementById(sectionId);
                if (anyElement) {
                    console.log(`Found element with ID ${sectionId}, but it's not a page-section:`, anyElement.tagName);
                } else {
                    console.error(`No element found with ID: ${sectionId}`);
                }
                const availableSections = Array.from(document.querySelectorAll('.page-section')).map(s => s.id);
                console.log('Available sections:', availableSections);
                
                // If the target section doesn't exist, show home as fallback
                const homeSection = document.getElementById('home');
                if (homeSection) {
                    homeSection.classList.add('active');
                    homeSection.style.display = 'block';
                    this.currentSection = 'home';
                    console.log('Showing home section as fallback');
                }
            }
        } catch (error) {
            console.error('Error showing section:', error);
        }
    }

    updateActiveNav(clickedLink) {
        try {
            // Remove active class from all nav links
            const navLinks = document.querySelectorAll('.nav-link, .footer-link');
            navLinks.forEach(link => {
                if (link) {
                    link.classList.remove('active');
                    link.setAttribute('tabindex', '-1');
                }
            });

            // Add active class to clicked link
            if (clickedLink) {
                if (clickedLink.classList.contains('nav-link') || clickedLink.classList.contains('footer-link')) {
                    clickedLink.classList.add('active');
                    clickedLink.setAttribute('tabindex', '0');
                    console.log(`👆 Active navigation updated to: ${clickedLink.textContent.trim()}`);
                }
            } else if (this.currentSection) {
                // Try to find by current section ID
                const navLink = document.querySelector(`.nav-link[data-section="${this.currentSection}"]`);
                if (navLink) {
                    navLink.classList.add('active');
                    navLink.setAttribute('tabindex', '0');
                    console.log(`👆 Active navigation set to: ${navLink.textContent.trim()} (by section ID)`);
                }
            }
        } catch (error) {
            console.error('Error updating navigation:', error);
        }
    }

    updatePageTitle(sectionId) {
        try {
            // Update browser title based on section
            const sectionTitles = {
                'home': 'Dr. Alex Kisitu - Eye Care Specialist',
                'about': 'About - Dr. Alex Kisitu',
                'services': 'Services - Dr. Alex Kisitu',
                'portfolio': 'Portfolio - Dr. Alex Kisitu',
                'contact': 'Contact - Dr. Alex Kisitu',
                'chat': 'Chat - Dr. Alex Kisitu',
                'privacy': 'Privacy Policy - Dr. Alex Kisitu',
                'terms': 'Terms of Service - Dr. Alex Kisitu'
            };

            const title = sectionTitles[sectionId] || 'Dr. Alex Kisitu - Eye Care Specialist';
            document.title = title;
        } catch (error) {
            console.error('Error updating page title:', error);
        }
    }

    // Public method to get current section
    getCurrentSection() {
        return this.currentSection;
    }

    // Public method to navigate to section
    navigateToSection(sectionId) {
        if (!sectionId) return;
        
        this.showSection(sectionId);
        
        // Update nav link active state
        const navLink = document.querySelector(`[data-section="${sectionId}"]`);
        if (navLink) {
            this.updateActiveNav(navLink);
        }
    }

    // Handle initial page load (no hash needed)
    handleInitialHash() {
        // Default to home section
        const defaultSection = 'home';
        
        console.log(`🔄 Initial page load, showing default section: '${defaultSection}'`);
        
        // Make all sections inactive and hidden
        document.querySelectorAll('.page-section').forEach(s => {
            s.classList.remove('active');
            s.style.display = 'none';
        });
        
        // Make home section active
        const homeSection = document.getElementById(defaultSection);
        if (homeSection) {
            homeSection.classList.add('active');
            homeSection.style.display = 'block';
            this.currentSection = defaultSection;
            
            // Update page title
            this.updatePageTitle(defaultSection);
            
            // Scroll to top for home section
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
            
            console.log(`📜 Initial scroll to top for home section`);
        } else {
            console.warn(`⚠️ Home section not found`);
            console.log('Available sections:', Array.from(document.querySelectorAll('.page-section')).map(s => s.id));
        }
    }
    
    // Special method to handle footer links to policy sections
    navigateToPolicySection(sectionId) {
        console.log(`🔖 Direct navigation to policy section: ${sectionId}`);
        
        // Make sure sectionId is clean
        if (sectionId.startsWith('#')) {
            sectionId = sectionId.substring(1);
        }
        
        // First activate the section
        const sections = document.querySelectorAll('.page-section');
        sections.forEach(section => section.classList.remove('active'));
        
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
            this.currentSection = sectionId;
            
            // Update page title
            this.updatePageTitle(sectionId);
            
            // Update URL without hash
            if (history.pushState) {
                history.pushState(null, null, window.location.pathname);
            }
            
            // Force display without scrolling
            targetSection.style.display = 'block';
            
            console.log(`📜 Policy section ${sectionId} displayed without scrolling`);
            
            return true;
        } else {
            console.warn(`❌ Policy section not found: ${sectionId}`);
            return false;
        }
    }
}

// Initialize navigation when DOM is ready
let navigationManager;

function initNavigation() {
    try {
        navigationManager = new NavigationManager();
        
        // Handle initial hash
        navigationManager.handleInitialHash();
        
        // Make globally available
        window.navigationManager = navigationManager;
        
    } catch (error) {
        console.error('Failed to initialize navigation:', error);
    }
}

// Multiple initialization methods for reliability
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNavigation);
} else {
    // DOM already loaded
    initNavigation();
}

// Handle browser back/forward buttons
window.addEventListener('popstate', (e) => {
    if (window.navigationManager) {
        // Always show home section on back/forward navigation
        window.navigationManager.navigateToSection('home');
    }
});

// Since we're no longer using hash for navigation, we don't need this handler
// But keeping it for backwards compatibility with old URLs
window.addEventListener('hashchange', (e) => {
    if (window.navigationManager) {
        // Default to home when URL changes
        window.navigationManager.navigateToSection('home');
        // Clear hash from URL
        if (history.pushState) {
            history.pushState(null, null, window.location.pathname);
        }
    }
});

// Export for module usage if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NavigationManager;
}