// Enhanced Theme Manager - Ensures Dark Mode Works Properly
(function() {
    'use strict';
    
    class ThemeManager {
        constructor() {
            this.init();
        }
        
        init() {
            // Force dark mode immediately
            this.enforceDarkMode();
            
            // Set up theme toggle when DOM is ready
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.setupThemeToggle());
            } else {
                this.setupThemeToggle();
            }
        }
        
        enforceDarkMode() {
            const html = document.documentElement;
            const body = document.body;
            
            // Set all dark mode attributes and classes
            html.setAttribute('data-theme', 'ocean');
            html.setAttribute('data-mode', 'dark');
            html.classList.add('dark-mode');
            
            if (body) {
                body.setAttribute('data-theme', 'ocean');
                body.setAttribute('data-mode', 'dark');
                body.setAttribute('data-layout', 'left-nav');
                body.classList.add('dark-mode');
                body.classList.remove('light-mode');
                
                // Force dark mode styles
                body.style.backgroundColor = '#1a1a1a';
                body.style.color = '#ffffff';
            }
            
            // Set default theme in localStorage if not set
            const savedTheme = localStorage.getItem('theme');
            if (!savedTheme) {
                localStorage.setItem('theme', 'dark');
            }
            
            console.log('✅ Dark mode enforced');
        }
        
        setupThemeToggle() {
            const themeToggle = document.getElementById('themeToggle');
            if (!themeToggle) {
                console.warn('Theme toggle button not found');
                return;
            }
            
            // Set initial toggle state
            const currentTheme = localStorage.getItem('theme') || 'dark';
            this.updateToggleButton(themeToggle, currentTheme);
            
            // Add click event listener
            themeToggle.addEventListener('click', (e) => this.toggleTheme(e));
            
            console.log('✅ Theme toggle initialized');
        }
        
        toggleTheme(event) {
            const button = event.currentTarget;
            const html = document.documentElement;
            const body = document.body;
            const currentMode = body.getAttribute('data-mode') || 'dark';
            
            if (currentMode === 'dark') {
                // Switch to light mode
                this.setLightMode(html, body);
                this.updateToggleButton(button, 'light');
                localStorage.setItem('theme', 'light');
                console.log('🌞 Switched to light mode');
            } else {
                // Switch to dark mode
                this.setDarkMode(html, body);
                this.updateToggleButton(button, 'dark');
                localStorage.setItem('theme', 'dark');
                console.log('🌙 Switched to dark mode');
            }
        }
        
        setDarkMode(html, body) {
            html.setAttribute('data-mode', 'dark');
            html.setAttribute('data-theme', 'ocean');
            html.classList.add('dark-mode');
            html.classList.remove('light-mode');
            
            body.setAttribute('data-mode', 'dark');
            body.setAttribute('data-theme', 'ocean');
            body.setAttribute('data-layout', 'left-nav');
            body.classList.add('dark-mode');
            body.classList.remove('light-mode');
            
            // Force dark mode styles
            body.style.backgroundColor = '#1a1a1a';
            body.style.color = '#ffffff';
        }
        
        setLightMode(html, body) {
            html.setAttribute('data-mode', 'light');
            html.setAttribute('data-theme', 'light');
            html.classList.add('light-mode');
            html.classList.remove('dark-mode');
            
            body.setAttribute('data-mode', 'light');
            body.setAttribute('data-theme', 'light');
            body.setAttribute('data-layout', 'left-nav');
            body.classList.add('light-mode');
            body.classList.remove('dark-mode');
            
            // Set light mode styles
            body.style.backgroundColor = '#f8fafc';
            body.style.color = '#0f172a';
        }
        
        updateToggleButton(button, theme) {
            if (theme === 'dark') {
                button.textContent = '🌙';
                button.setAttribute('aria-label', 'Switch to light mode');
                button.title = 'Switch to light mode';
            } else {
                button.textContent = '☀️';
                button.setAttribute('aria-label', 'Switch to dark mode');
                button.title = 'Switch to dark mode';
            }
        }
        
        // Public method to get current theme
        getCurrentTheme() {
            return localStorage.getItem('theme') || 'dark';
        }
        
        // Public method to force a specific theme
        setTheme(theme) {
            const html = document.documentElement;
            const body = document.body;
            const themeToggle = document.getElementById('themeToggle');
            
            if (theme === 'dark') {
                this.setDarkMode(html, body);
                if (themeToggle) this.updateToggleButton(themeToggle, 'dark');
            } else {
                this.setLightMode(html, body);
                if (themeToggle) this.updateToggleButton(themeToggle, 'light');
            }
            
            localStorage.setItem('theme', theme);
        }
    }
    
    // Initialize theme manager immediately
    window.themeManager = new ThemeManager();
    
    // Expose theme functions globally for backward compatibility
    window.setTheme = (theme) => window.themeManager.setTheme(theme);
    window.getCurrentTheme = () => window.themeManager.getCurrentTheme();
    
    // Additional safety check - run enforcement again after a short delay
    setTimeout(() => {
        if (document.body && !document.body.classList.contains('dark-mode')) {
            console.warn('⚠️ Dark mode not properly applied, enforcing again...');
            window.themeManager.enforceDarkMode();
        }
    }, 100);
    
})();

// CSS Variable Enforcement Helper
function enforceThemeVariables() {
    const root = document.documentElement;
    const isDark = document.body.classList.contains('dark-mode');
    
    if (isDark) {
        root.style.setProperty('--bg-primary', '#1a1a1a');
        root.style.setProperty('--bg-secondary', '#2d2d2d');
        root.style.setProperty('--text-primary', '#ffffff');
        root.style.setProperty('--text-secondary', '#cccccc');
        root.style.setProperty('--border-color', '#404040');
    } else {
        root.style.setProperty('--bg-primary', '#f8fafc');
        root.style.setProperty('--bg-secondary', '#ffffff');
        root.style.setProperty('--text-primary', '#0f172a');
        root.style.setProperty('--text-secondary', '#475569');
        root.style.setProperty('--border-color', '#e2e8f0');
    }
}

// Run variable enforcement
document.addEventListener('DOMContentLoaded', enforceThemeVariables);

// Export for module usage if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ThemeManager };
}