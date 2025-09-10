/**
 * HTMX API Server for DrAlex website
 * 
 * This server handles API requests from the HTMX frontend,
 * primarily serving dynamic content from content.json
 */

const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const app = express();
const PORT = process.env.PORT || 5000;

// Serve static files from the root directory
app.use(express.static(path.join(__dirname, '..')));

// Load content.json
let siteContent = null;

async function loadContent() {
  try {
    const data = await fs.readFile(path.join(__dirname, '../data/content.json'), 'utf8');
    siteContent = JSON.parse(data);
    console.log('✓ Content loaded successfully');
  } catch (error) {
    console.error('Error loading content.json:', error);
    process.exit(1); // Exit if we can't load the content
  }
}

// Helper function to generate HTML for different page types
function generatePageHTML(pageData) {
  if (!pageData) {
    return `<div class="error-message">
      <h2>Error</h2>
      <p>Page content not found</p>
    </div>`;
  }

  // Different pages have different layouts
  switch (pageData.pageType) {
    case 'home':
      return generateHomeHTML(pageData);
    default:
      return generateGenericPageHTML(pageData);
  }
}

// Generate HTML for the home page
function generateHomeHTML(pageData) {
  const hero = pageData.hero || {};
  
  // Include the hero image if it exists in the content.json
  const heroImageHTML = hero.image ? 
    `<div class="hero-image">
      <img src="${hero.image}" alt="${hero.imageAlt || 'Hero image'}" class="hero-img">
    </div>` : '';

  return `
    <section class="page-section">
      <div class="hero-section ${heroImageHTML ? 'hero-with-image' : ''}">
        <div class="hero-content">
          <h2 class="hero-title">${hero.title || 'Welcome'}</h2>
          <p class="hero-subtitle">${hero.subtitle || ''}</p>
          <p class="hero-description">${hero.description || ''}</p>
          <div class="hero-actions">
            <a href="javascript:void(0)" 
               class="cta-button primary"
               data-section="${hero.cta?.id || 'contact'}"
               hx-get="/api/content/contact" 
               hx-target="#main-content" 
               hx-push-url="true"
               hx-indicator="#loading-indicator">
              ${hero.cta?.text || 'Contact Us'}
            </a>
            <a href="#services" 
               class="cta-button secondary"
               hx-get="/api/content/services" 
               hx-target="#main-content" 
               hx-push-url="true"
               hx-indicator="#loading-indicator">
              Our Services
            </a>
          </div>
        </div>
        ${heroImageHTML}
      </div>
      
      <!-- Quick Services Preview -->
      <div class="content-grid">
        <div class="content-card" 
             hx-get="/api/service-preview/eye-exams" 
             hx-trigger="revealed"
             hx-target="this"
             hx-swap="innerHTML">
          <div class="htmx-indicator">Loading...</div>
        </div>
        
        <div class="content-card" 
             hx-get="/api/service-preview/contact-lenses" 
             hx-trigger="revealed"
             hx-target="this"
             hx-swap="innerHTML">
          <div class="htmx-indicator">Loading...</div>
        </div>
        
        <div class="content-card" 
             hx-get="/api/service-preview/glasses" 
             hx-trigger="revealed"
             hx-target="this"
             hx-swap="innerHTML">
          <div class="htmx-indicator">Loading...</div>
        </div>
      </div>

      <!-- Latest News Section -->
      <section class="news-section">
        <h3>Latest Updates</h3>
        <div id="news-container" 
             hx-get="/api/news/latest" 
             hx-trigger="load delay:500ms"
             hx-indicator="#loading-indicator">
          <p>Loading latest news...</p>
        </div>
      </section>
    </section>
  `;
}

// Generate HTML for generic pages (about, services, contact, etc)
function generateGenericPageHTML(pageData) {
  return `
    <section class="page-section">
      <h2 class="section-title">${pageData.title || 'Page Title'}</h2>
      ${pageData.subtitle ? `<p class="section-subtitle">${pageData.subtitle}</p>` : ''}
      ${pageData.description ? `<p class="section-description">${pageData.description}</p>` : ''}
      
      ${generateContentSections(pageData)}
    </section>
  `;
}

// Generate content sections based on page data
function generateContentSections(pageData) {
  let html = '';
  
  if (pageData.sections) {
    html += pageData.sections.map(section => `
      <div class="content-section">
        <h3 class="content-title">${section.title || ''}</h3>
        <div class="content-body">${section.content || ''}</div>
      </div>
    `).join('');
  }
  
  return html;
}

// API routes
app.get('/api/content/:page', (req, res) => {
  if (!siteContent) {
    return res.status(500).send('Content not loaded');
  }

  const pageName = req.params.page;
  const pageData = siteContent.pages[pageName];
  
  if (!pageData) {
    return res.status(404).send(`Page ${pageName} not found`);
  }
  
  // Add pageType to the data for layout selection
  const enhancedPageData = { 
    ...pageData, 
    pageType: pageName 
  };
  
  const html = generatePageHTML(enhancedPageData);
  res.send(html);
});

// Service preview API
app.get('/api/service-preview/:serviceId', (req, res) => {
  if (!siteContent) {
    return res.status(500).send('Content not loaded');
  }

  const serviceId = req.params.serviceId;
  let service = null;
  
  // Find the service by ID or slug
  if (serviceId === 'eye-exams') {
    service = siteContent.services.find(s => s.id === 'comprehensive-exams');
  } else if (serviceId === 'contact-lenses') {
    service = siteContent.services.find(s => s.id === 'contact-lenses');
  } else if (serviceId === 'glasses') {
    service = siteContent.services.find(s => s.id === 'prescription-glasses');
  } else {
    service = siteContent.services.find(s => s.id === serviceId);
  }
  
  if (!service) {
    return res.status(404).send(`Service ${serviceId} not found`);
  }
  
  const html = `
    <div class="service-card">
      <div class="card-icon">${service.icon || '👁️'}</div>
      <h3 class="card-title">${service.title || 'Service'}</h3>
      <p class="card-description">${service.description || ''}</p>
      <a href="#services" 
         class="card-link"
         hx-get="/api/content/services" 
         hx-target="#main-content" 
         hx-push-url="true"
         hx-indicator="#loading-indicator">
        Learn More
      </a>
    </div>
  `;
  
  res.send(html);
});

// News API
app.get('/api/news/latest', (req, res) => {
  // Simulated news content
  const html = `
    <div class="news-grid">
      <div class="news-item">
        <h4>New Optical Equipment</h4>
        <p>We've invested in the latest optical equipment to provide even better care.</p>
        <span class="news-date">August 25, 2025</span>
      </div>
      <div class="news-item">
        <h4>Extended Hours</h4>
        <p>We now offer appointments on Saturday afternoons.</p>
        <span class="news-date">August 10, 2025</span>
      </div>
    </div>
  `;
  
  res.send(html);
});

// Start the server
async function startServer() {
  await loadContent();
  
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`- View the HTMX site at http://localhost:${PORT}/index.htmx.html`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});