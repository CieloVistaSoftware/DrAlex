# Tab Web Component: Usage Examples

This document provides practical examples of the three configuration methods for the `<tab-control>` web component.

## Installation & Setup

### 1. Include Component Files

```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="js/Tab-Component/tab-control.css">
</head>
<body>
  <!-- Your content -->
  <script src="js/Tab-Component/tab-control.js"></script>
</body>
</html>
```

### 2. Component File Structure
```
js/
└── Tab-Component/
    ├── tab-control.js      # Web component implementation
    ├── tab-control.html    # Template (loaded by JS)
    ├── tab-control.css     # Component styles
    └── README.md          # Documentation
```

## Configuration Method 1: Inline JSON Configuration

### Basic Example

```html
<tab-control config='{
  "tabs": [
    {
      "id": "overview-tab",
      "label": "Overview", 
      "panel": "overview-panel"
    },
    {
      "id": "details-tab",
      "label": "Details",
      "panel": "details-panel"
    },
    {
      "id": "settings-tab", 
      "label": "Settings",
      "panel": "settings-panel"
    }
  ],
  "defaultTab": "overview-tab"
}'>
  <!-- Static content for panels (optional) -->
  <div slot="overview-panel">
    <h3>Overview Content</h3>
    <p>This is the overview section with static content.</p>
  </div>
  <div slot="details-panel">
    <h3>Details Content</h3>
    <p>Detailed information goes here.</p>
  </div>
  <div slot="settings-panel">
    <h3>Settings Content</h3>
    <p>Configuration options and settings.</p>
  </div>
</tab-control>
```

### Advanced Example with External Content

```html
<tab-control config='{
  "tabs": [
    {
      "id": "dashboard-tab",
      "label": "📊 Dashboard",
      "panel": "dashboard-panel",
      "content": "content/dashboard.html",
      "css": "content/dashboard.css"
    },
    {
      "id": "analytics-tab", 
      "label": "📈 Analytics",
      "panel": "analytics-panel",
      "content": "content/analytics.html",
      "css": "content/analytics.css"
    },
    {
      "id": "reports-tab",
      "label": "📋 Reports", 
      "panel": "reports-panel",
      "content": "content/reports.html"
    },
    {
      "id": "admin-tab",
      "label": "⚙️ Admin",
      "panel": "admin-panel", 
      "content": "content/admin.html",
      "disabled": true
    }
  ],
  "defaultTab": "dashboard-tab",
  "accessibility": {
    "tablistLabel": "Main Navigation",
    "navLabel": "Primary Tabs"
  },
  "loading": {
    "lazy": true,
    "cache": true,
    "timeout": 5000
  }
}'></tab-control>
```

### Complex Configuration with JSON Script

For larger configurations, use embedded JSON:

```html
<tab-control>
  <script type="application/json">
    {
      "tabs": [
        {
          "id": "products-tab",
          "label": "Products",
          "panel": "products-panel", 
          "content": "tabs/products.html",
          "css": "tabs/products.css",
          "icon": "🛍️"
        },
        {
          "id": "categories-tab",
          "label": "Categories", 
          "panel": "categories-panel",
          "content": "tabs/categories.html",
          "css": "tabs/categories.css",
          "icon": "📁"
        },
        {
          "id": "inventory-tab",
          "label": "Inventory",
          "panel": "inventory-panel",
          "content": "tabs/inventory.html", 
          "css": "tabs/inventory.css",
          "icon": "📦"
        },
        {
          "id": "orders-tab",
          "label": "Orders",
          "panel": "orders-panel",
          "content": "tabs/orders.html",
          "css": "tabs/orders.css", 
          "icon": "🛒"
        },
        {
          "id": "customers-tab",
          "label": "Customers",
          "panel": "customers-panel",
          "content": "tabs/customers.html",
          "css": "tabs/customers.css",
          "icon": "👥"
        }
      ],
      "defaultTab": "products-tab",
      "accessibility": {
        "tablistLabel": "E-commerce Management",
        "navLabel": "Admin Dashboard Sections"
      },
      "loading": {
        "lazy": true,
        "cache": true,
        "timeout": 8000
      }
    }
  </script>
</tab-control>
```

## Configuration Method 2: External JSON Configuration

### Example 1: Using `src` Attribute

```html
<!-- HTML -->
<tab-control src="config/main-tabs.json"></tab-control>
```

```json
// config/main-tabs.json
{
  "tabs": [
    {
      "id": "home-tab",
      "label": "🏠 Home",
      "panel": "home-panel",
      "content": "pages/home.html",
      "css": "styles/home.css"
    },
    {
      "id": "about-tab", 
      "label": "ℹ️ About",
      "panel": "about-panel",
      "content": "pages/about.html",
      "css": "styles/about.css"
    },
    {
      "id": "services-tab",
      "label": "🔧 Services", 
      "panel": "services-panel",
      "content": "pages/services.html",
      "css": "styles/services.css"
    },
    {
      "id": "contact-tab",
      "label": "📞 Contact",
      "panel": "contact-panel", 
      "content": "pages/contact.html",
      "css": "styles/contact.css"
    }
  ],
  "defaultTab": "home-tab",
  "accessibility": {
    "tablistLabel": "Website Navigation",
    "navLabel": "Main Menu"
  }
}
```

### Example 2: Dynamic Configuration Loading

```html
<!-- HTML -->
<tab-control id="dynamicTabs"></tab-control>

<script>
// JavaScript
async function loadTabConfiguration() {
  try {
    const response = await fetch('api/user-tabs.json');
    const config = await response.json();
    
    // Modify config based on user permissions
    if (!userHasAdminAccess()) {
      config.tabs = config.tabs.filter(tab => !tab.requiresAdmin);
    }
    
    // Apply configuration
    document.getElementById('dynamicTabs').config = config;
  } catch (error) {
    console.error('Failed to load tab configuration:', error);
    // Fallback configuration
    document.getElementById('dynamicTabs').config = {
      tabs: [
        { id: "fallback-tab", label: "Home", panel: "fallback-panel" }
      ]
    };
  }
}

// Load configuration when page is ready
document.addEventListener('DOMContentLoaded', loadTabConfiguration);
</script>
```

### Example 3: Multiple Tab Sets

```html
<!-- Different tab configurations for different sections -->
<section class="dashboard">
  <h2>User Dashboard</h2>
  <tab-control src="config/user-dashboard.json"></tab-control>
</section>

<section class="admin-panel">
  <h2>Admin Panel</h2>
  <tab-control src="config/admin-dashboard.json"></tab-control>
</section>

<section class="settings">
  <h2>Application Settings</h2>
  <tab-control src="config/settings-tabs.json"></tab-control>
</section>
```

## Configuration Method 3: Static HTML Structure

### Basic Static Example

```html
<tab-control>
  <nav class="tab-nav" aria-label="Project Sections">
    <div role="tablist" aria-label="Project Navigation">
      <button role="tab" aria-selected="true" aria-controls="overview-panel" id="overview-tab" tabindex="0">
        📋 Project Overview
      </button>
      <button role="tab" aria-selected="false" aria-controls="timeline-panel" id="timeline-tab" tabindex="-1">
        📅 Timeline
      </button>
      <button role="tab" aria-selected="false" aria-controls="team-panel" id="team-tab" tabindex="-1">
        👥 Team
      </button>
      <button role="tab" aria-selected="false" aria-controls="resources-panel" id="resources-tab" tabindex="-1">
        📁 Resources
      </button>
    </div>
  </nav>
  
  <div id="overview-panel" role="tabpanel" aria-labelledby="overview-tab">
    <h3>Project Overview</h3>
    <p>This project aims to create a comprehensive web application...</p>
    <ul>
      <li>Frontend: React with TypeScript</li>
      <li>Backend: Node.js with Express</li>
      <li>Database: PostgreSQL</li>
    </ul>
  </div>
  
  <div id="timeline-panel" role="tabpanel" aria-labelledby="timeline-tab" hidden>
    <h3>Project Timeline</h3>
    <div class="timeline">
      <div class="milestone">
        <h4>Phase 1: Planning (Week 1-2)</h4>
        <p>Requirements gathering and system design</p>
      </div>
      <div class="milestone">
        <h4>Phase 2: Development (Week 3-8)</h4>
        <p>Core feature implementation</p>
      </div>
      <div class="milestone">
        <h4>Phase 3: Testing (Week 9-10)</h4>
        <p>Quality assurance and bug fixes</p>
      </div>
    </div>
  </div>
  
  <div id="team-panel" role="tabpanel" aria-labelledby="team-tab" hidden>
    <h3>Team Members</h3>
    <div class="team-grid">
      <div class="member">
        <h4>Alex Johnson</h4>
        <p>Project Manager</p>
      </div>
      <div class="member">
        <h4>Sarah Chen</h4>
        <p>Frontend Developer</p>
      </div>
      <div class="member">
        <h4>Mike Rodriguez</h4>
        <p>Backend Developer</p>
      </div>
    </div>
  </div>
  
  <div id="resources-panel" role="tabpanel" aria-labelledby="resources-tab" hidden>
    <h3>Project Resources</h3>
    <ul>
      <li><a href="/docs/requirements.pdf">Requirements Document</a></li>
      <li><a href="/docs/design.pdf">System Design</a></li>
      <li><a href="/repo">Git Repository</a></li>
      <li><a href="/wiki">Project Wiki</a></li>
    </ul>
  </div>
</tab-control>
```

### Advanced Static with Custom Styling

```html
<tab-control class="custom-theme">
  <nav class="tab-nav" aria-label="Application Features">
    <div role="tablist" aria-label="Feature Navigation">
      <button role="tab" aria-selected="true" aria-controls="editor-panel" id="editor-tab" tabindex="0" class="tab-primary">
        ✏️ Editor
      </button>
      <button role="tab" aria-selected="false" aria-controls="preview-panel" id="preview-tab" tabindex="-1" class="tab-secondary">
        👁️ Preview
      </button>
      <button role="tab" aria-selected="false" aria-controls="settings-panel" id="settings-tab" tabindex="-1" class="tab-utility">
        ⚙️ Settings
      </button>
      <button role="tab" aria-selected="false" aria-controls="help-panel" id="help-tab" tabindex="-1" class="tab-help">
        ❓ Help
      </button>
    </div>
  </nav>
  
  <div id="editor-panel" role="tabpanel" aria-labelledby="editor-tab" class="panel-primary">
    <div class="editor-toolbar">
      <button>Bold</button>
      <button>Italic</button>
      <button>Link</button>
    </div>
    <textarea class="editor-content" placeholder="Start writing..."></textarea>
  </div>
  
  <div id="preview-panel" role="tabpanel" aria-labelledby="preview-tab" class="panel-secondary" hidden>
    <div class="preview-content">
      <p>Preview of your content will appear here...</p>
    </div>
  </div>
  
  <div id="settings-panel" role="tabpanel" aria-labelledby="settings-tab" class="panel-utility" hidden>
    <form class="settings-form">
      <div class="form-group">
        <label for="theme-select">Theme:</label>
        <select id="theme-select">
          <option value="light">Light</option>
          <option value="dark">Dark</option>
          <option value="auto">Auto</option>
        </select>
      </div>
      <div class="form-group">
        <label for="font-size">Font Size:</label>
        <input type="range" id="font-size" min="12" max="24" value="16">
      </div>
    </form>
  </div>
  
  <div id="help-panel" role="tabpanel" aria-labelledby="help-tab" class="panel-help" hidden>
    <h3>Quick Help</h3>
    <dl>
      <dt>Ctrl+B</dt>
      <dd>Bold text</dd>
      <dt>Ctrl+I</dt>
      <dd>Italic text</dd>
      <dt>Ctrl+S</dt>
      <dd>Save document</dd>
    </dl>
  </div>
</tab-control>

<style>
.custom-theme {
  --tab-bg-color: #2c3e50;
  --tab-active-color: #3498db;
  --tab-text-color: #ecf0f1;
}

.tab-primary { background-color: var(--tab-active-color); }
.tab-secondary { background-color: #95a5a6; }
.tab-utility { background-color: #f39c12; }
.tab-help { background-color: #e74c3c; }

.editor-content {
  width: 100%;
  height: 300px;
  border: 1px solid #ddd;
  padding: 1rem;
  font-family: 'Courier New', monospace;
}
</style>
```

## JavaScript API Usage Examples

### Programmatic Control

```javascript
// Get reference to tab component
const tabControl = document.querySelector('tab-control');

// Listen for tab activation events
tabControl.addEventListener('tab-activated', (event) => {
  console.log(`Tab activated: ${event.detail.tabId}`);
  
  // Analytics tracking
  gtag('event', 'tab_view', {
    'tab_name': event.detail.tabId
  });
});

// Listen for content loading events
tabControl.addEventListener('tab-content-loaded', (event) => {
  if (event.detail.success) {
    console.log(`Content loaded for tab: ${event.detail.tabId}`);
  } else {
    console.error(`Failed to load content for tab: ${event.detail.tabId}`);
  }
});

// Programmatically activate a tab
tabControl.activateTab('settings-tab');

// Add a new tab dynamically
tabControl.addTab({
  id: 'new-tab',
  label: '🆕 New Feature',
  panel: 'new-panel',
  content: 'content/new-feature.html'
});

// Remove a tab
tabControl.removeTab('old-tab');

// Get currently active tab
const activeTab = tabControl.getActiveTab();
console.log('Currently active tab:', activeTab);
```

### Error Handling

```javascript
const tabControl = document.querySelector('tab-control');

// Handle tab errors
tabControl.addEventListener('tab-error', (event) => {
  const { tabId, error } = event.detail;
  
  console.error(`Error in tab ${tabId}:`, error);
  
  // Show user-friendly error message
  const errorPanel = document.getElementById(tabId.replace('-tab', '-panel'));
  if (errorPanel) {
    errorPanel.innerHTML = `
      <div class="error-message">
        <h3>Unable to load content</h3>
        <p>There was an error loading this section. Please try again later.</p>
        <button onclick="location.reload()">Refresh Page</button>
      </div>
    `;
  }
});

// Validate configuration before setting
function setTabConfiguration(config) {
  try {
    // Basic validation
    if (!config.tabs || !Array.isArray(config.tabs)) {
      throw new Error('Invalid tabs configuration');
    }
    
    config.tabs.forEach((tab, index) => {
      if (!tab.id || !tab.label || !tab.panel) {
        throw new Error(`Tab at index ${index} is missing required properties`);
      }
    });
    
    // Set configuration
    tabControl.config = config;
  } catch (error) {
    console.error('Configuration error:', error);
    // Set fallback configuration
    tabControl.config = {
      tabs: [
        { id: 'error-tab', label: 'Error', panel: 'error-panel' }
      ]
    };
  }
}
```

These examples demonstrate the flexibility and power of the `<tab-control>` web component across all three configuration methods, from simple static content to complex dynamic applications.