# Fixed Layout Structure

| **LEFT NAVIGATION** | **RIGHT CONTENT AREA** | **Notes** |
|---------------------|-------------------------|-----------|
| 🏠 Home | **SITE HEADER** | ← Proper header from each page |
| 👤 About | (Title & Subtitle change per page loaded) | Dynamic content |
| 🔬 Services | | |
| 📁 Portfolio | **MAIN CONTENT** | ← Content from other HTML files |
| 📞 Contact | (Loaded dynamically from actual HTML files) | (about.html, contact.html, etc.) |
| 💬 Chat | - Patient stories | |
| | - Contact forms | |
| | - Service descriptions | |
| | - Team member cards | |
| | **SITE FOOTER** | |
| | (Consistent across all pages) | Static content |

## Layout Breakdown:

### **Left Navigation (Fixed)**
- Always visible navigation menu
- Icons + text for each section
- Active state highlighting
- Mobile: Slides out from left

### **Right Content Area (Dynamic)**
- **Header**: Updates title/subtitle per page
- **Main**: Loads content from HTML files
- **Footer**: Stays consistent

### **Content Loading Process:**
1. Click navigation link (e.g., "About")
2. Fetch `about.html` file
3. Extract `<site-header>` attributes → Update header
4. Extract `<main>` content → Load into main area
5. Footer remains unchanged