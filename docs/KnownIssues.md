# Dr. Alex Kisitu Website - Open Issues

This document lists current open issues and known bugs that need to be addressed in the website.

## Frontend Issues
now I want to send images to claude chat to ask about it's thoughts which are seen by the user
### High Priority
- Fix API connection failing in chat widget (server is not running on port 3000)

### Completed
- ~~Fix chat widget trace showing in first tab instead of second tab in component-chat-test.html~~ (2025-07-15)
- ~~Make trace log display messages in reverse order (newest at the top)~~ (2025-07-15)
- ~~Prevent automatic switching to trace tab when API events occur~~ (2025-07-15)
- ~~Add star favicon to component-chat-test.html~~ (2025-07-15)

### Medium Priority
This code in component-chat-test.html doesn't follow our rule of one time one place.
    window.drAlexConfig = {
      apiPort: 3000,          // Backend API port
      frontendPort: 5000,     // Frontend server port
      testPort: 5500          // Test server port
    };
### Low Priority
- Improve mobile navigation animation smoothness
- Add page transitions for better user experience
- Implement lazy loading for images to improve page load speed

## Backend Issues

### Medium Priority
- Add better error handling for API rate limiting
- Implement request logging for diagnostics

### Completed
- ~~Login functionality removed due to system instability (2025-07-14)~~
- ~~Fixed chat widget dark mode and debug checkbox issues (2025-07-14)~~
- ~~Fixed chat widget initialization and dark mode in test pages (2025-07-15)~~
- ~~Implemented tabbed interface for chat widget and trace in improved-chat-test.html (2025-07-16)~~
- ~~Created web component implementation for chat widget (2025-07-18)~~
- ~~Implemented Claude API integration with enhanced trace logging (2025-07-18)~~
- ~~Added robust fallback mode for API connectivity issues (2025-07-18)~~
- ~~Fixed port configuration for API connection in chat widget (2025-07-18)~~

## Testing
do not write any standalone tests that are not playwright.

### Completed
- Enhanced HTML validator to detect unclosed template literals and JavaScript syntax errors (see tests/html-validator.spec.js)

## Documentation

### Completed
- Created documentation for running a backend service with GitHub Pages (see docs/github-pages-backend.md)
- Created comprehensive Playwright testing rules and best practices (see docs/playwright-testing-rules.md)

### Low Priority
- Create developer onboarding guide
- Document theme customization process
