// Theme Toggle System for Eye Care Website
// Handles dark/light mode switching with localStorage persistence

document.addEventListener('DOMContentLoaded', () => {
  const themeToggle = document.getElementById('themeToggle');
  const body = document.body;
  
  if (!themeToggle) {
    console.warn('Theme toggle button not found');
    return;
  }

  // Initialize theme from localStorage or default to dark
  const savedTheme = localStorage.getItem('theme') || 'dark';
  applyTheme(savedTheme);

  // Theme toggle click handler
  themeToggle.addEventListener('click', () => {
    const currentTheme = body.classList.contains('dark-mode') ? 'dark' : 'light';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    applyTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    
    console.log(`Theme switched to: ${newTheme}`);
  });

  /**
   * Apply theme to body and update toggle button
   * @param {string} theme - 'dark' or 'light'
   */
  function applyTheme(theme) {
    // Remove existing theme classes
    body.classList.remove('dark-mode', 'light-mode');
    
    // Add new theme class
    body.classList.add(`${theme}-mode`);
    
    // Set data attribute for CSS selectors
    body.setAttribute('data-mode', theme);
    
    // Update toggle button icon
    themeToggle.textContent = theme === 'dark' ? '🌙' : '☀️';
    
    // Update button title for accessibility
    themeToggle.title = `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`;
    themeToggle.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`);
  }

  // System theme detection (optional)
  if (window.matchMedia) {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Only use system preference if no saved theme
    if (!localStorage.getItem('theme')) {
      const systemTheme = mediaQuery.matches ? 'dark' : 'light';
      applyTheme(systemTheme);
    }
    
    // Listen for system theme changes
    mediaQuery.addEventListener('change', (e) => {
      // Only auto-switch if user hasn't manually set a preference
      if (!localStorage.getItem('theme')) {
        const systemTheme = e.matches ? 'dark' : 'light';
        applyTheme(systemTheme);
      }
    });
  }

  console.log('✅ Theme system initialized');
});