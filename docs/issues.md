**Issues and Solutions:**

1. **Issue:** Make header gradient use the reverse direction
   **Solution:** Updated the header background to use the existing `--gradient-primary-reversed` variable with fallback: `var(--gradient-primary-reversed, linear-gradient(315deg, #0061A4 0%, #1AB9D2 100%)) !important;`
   **Status:** Fixed

2. **Issue:** The main content window gradient needs to be reversed so the light color is on the opposite side
   **Solution:** Created a new CSS variable `--gradient-primary-reversed` and updated the main-content background to use this new reversed gradient (315deg instead of 135deg)
   **Status:** Fixed
   
3. **Issue:** Move emergency contact section to footer
   **Solution:** Relocated the emergency contact section from the navigation to the footer-left area and updated its styling to fit the footer layout
   **Status:** Fixed
   
4. **Issue:** Make navigation menu follow the scrolling of the page (Sticky)
   **Solution:** Changed the navigation menu position from `relative` to `sticky` so it follows page scrolling
   **Status:** Fixed
   
5. **Issue:** Update menu background to use --dark-bg-primary
   **Solution:** Changed the menu background color from `--dark-bg-secondary` to `--dark-bg-primary` for better visual consistency
   **Status:** Fixed
   
6. **Issue:** Remove icons from all card titles
   **Solution:** Removed icons from card titles by updating the HTML template strings in content-loader.js
   **Status:** Fixed

7. **Issue:** Improve mobile responsiveness for the services section
   **Solution:** Pending
   **Status:** Not fixed

8. **Issue:** Update scrollbar color to match site branding
   **Solution:** Changed scrollbar thumb color to #0061A4 with hover color #1AB9D2, added Firefox support
   **Status:** Fixed

9. **Issue:** Remove light vertical line on the right side of navigation
   **Solution:** Removed the `border-right` property from the .site-nav CSS selector
   **Status:** Fixed

10. **Issue:** Add a 1rem gap between navigation and main content
    **Solution:** Added grid-gap: 1rem !important; to .two-column-layout class and updated both desktop and mobile media queries to maintain this spacing
    **Status:** Fixed

11. **Issue:** Update background color of navigation and main content to black
    **Solution:** Changed background colors from var(--dark-bg-primary, #1a1a1a) to pure black (#000000) for site-nav, main-content, main-column, body, and two-column-layout. Content cards updated to use a slightly lighter black (#111111)
    **Status:** Fixed

12. **Issue:** Move the logo image to be positioned right above the main content
    **Solution:** Removed the logo from the header and created a new logo container element that sits between the header and main content. Updated CSS to style the header with centered text and the new logo container.
    **Status:** Fixed

13. **Issue:** Update logo image dimensions
    **Solution:** Removed inline styles from the logo image and updated the logo-container CSS to set the logo width to 23rem. Updated the mobile styles to use 20rem width. Adjusted the logo container to fit the wider logo and updated the logo fallback to maintain consistency.
    **Status:** Fixed

**Date Fixed:** September 10, 2025