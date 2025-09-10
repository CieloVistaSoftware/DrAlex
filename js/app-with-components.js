// app-with-components.js - Complete Web Component System
// Combines component system, team member cards, service cards, testimonials, contact info, chat widget, and content-driven components

// ============================================================================
// CORE COMPONENT SYSTEM - Safe component loading system
// ============================================================================
class ComponentSystem {
  constructor() {
    this.components = new Map();
    this.loadingPromises = new Map();
    this.errorComponents = new Set();
    this.dependencies = new Map();
    this.loaded = new Set();
    
    console.log('🔧 ComponentSystem initialized');
  }

  // Register a component with its dependencies
  register(tagName, componentClass, options = {}) {
    this.components.set(tagName, {
      class: componentClass,
      dependencies: options.dependencies || [],
      hasExternalResources: options.hasExternalResources || false,
      priority: options.priority || 0,
      fallbackContent: options.fallbackContent || `<div style="padding:1rem;border:2px dashed #ccc;text-align:center;">Component "${tagName}" loading...</div>`
    });
    
    console.log(`📝 Registered component: ${tagName}`);
  }

  // Safe component loading with comprehensive error handling
  async loadComponent(tagName) {
    // Return existing promise if already loading
    if (this.loadingPromises.has(tagName)) {
      return this.loadingPromises.get(tagName);
    }

    const loadPromise = this._loadComponentSafely(tagName);
    this.loadingPromises.set(tagName, loadPromise);
    return loadPromise;
  }

  async _loadComponentSafely(tagName) {
    try {
      // Check if already loaded
      if (this.loaded.has(tagName)) {
        console.log(`✅ Component ${tagName} already loaded`);
        return true;
      }

      // Check if already defined in DOM
      if (customElements.get(tagName)) {
        console.log(`✅ Component ${tagName} already defined`);
        this.loaded.add(tagName);
        return true;
      }

      const config = this.components.get(tagName);
      if (!config) {
        throw new Error(`Component ${tagName} not registered`);
      }

      // Load dependencies first
      if (config.dependencies.length > 0) {
        console.log(`📦 Loading dependencies for ${tagName}:`, config.dependencies);
        const dependencyResults = await Promise.allSettled(
          config.dependencies.map(dep => this.loadComponent(dep))
        );
        
        // Check if any critical dependencies failed
        dependencyResults.forEach((result, index) => {
          if (result.status === 'rejected') {
            console.warn(`⚠️ Dependency ${config.dependencies[index]} failed for ${tagName}:`, result.reason);
          }
        });
      }

      // Define the component
      customElements.define(tagName, config.class);
      this.loaded.add(tagName);
      
      console.log(`✅ Component ${tagName} loaded successfully`);
      
      // Dispatch success event
      document.dispatchEvent(new CustomEvent('component-loaded', {
        detail: { tagName, success: true }
      }));
      
      return true;

    } catch (error) {
      console.error(`❌ Failed to load component ${tagName}:`, error);
      this.errorComponents.add(tagName);
      
      // Create safe fallback component
      this._createFallbackComponent(tagName, error);
      
      // Dispatch error event
      document.dispatchEvent(new CustomEvent('component-error', {
        detail: { tagName, error: error.message }
      }));
      
      return false;
    }
  }

  _createFallbackComponent(tagName, error) {
    if (customElements.get(tagName)) return;

    const config = this.components.get(tagName) || {};
    
    class FallbackComponent extends HTMLElement {
      connectedCallback() {
        this.innerHTML = config.fallbackContent || `
          <div style="
            border: 2px dashed #ff6b6b;
            padding: 1rem;
            border-radius: 8px;
            background: rgba(255, 107, 107, 0.1);
            color: #ff6b6b;
            text-align: center;
            margin: 1rem 0;
            font-family: monospace;
          ">
            <strong>⚠️ Component Error: ${tagName}</strong><br>
            <small>${error.message}</small>
            <br><br>
            <button onclick="window.componentSystem.retryComponent('${tagName}')" 
                    style="background:#ff6b6b;color:white;border:none;padding:0.5rem 1rem;border-radius:4px;cursor:pointer;">
              🔄 Retry
            </button>
          </div>
        `;
      }
    }

    try {
      customElements.define(tagName, FallbackComponent);
      console.log(`🔄 Fallback component created for ${tagName}`);
    } catch (defineError) {
      console.error(`❌ Could not create fallback for ${tagName}:`, defineError);
    }
  }

  // Retry loading a failed component
  async retryComponent(tagName) {
    console.log(`🔄 Retrying component: ${tagName}`);
    this.errorComponents.delete(tagName);
    this.loaded.delete(tagName);
    this.loadingPromises.delete(tagName);
    
    // Remove existing fallback instances
    const existingElements = document.querySelectorAll(tagName);
    existingElements.forEach(el => {
      const parent = el.parentNode;
      if (parent) {
        const placeholder = document.createElement('div');
        placeholder.textContent = 'Reloading component...';
        parent.replaceChild(placeholder, el);
        
        // Try to reload after a short delay
        setTimeout(async () => {
          const success = await this.loadComponent(tagName);
          if (success) {
            const newElement = document.createElement(tagName);
            // Copy attributes from original element
            Array.from(el.attributes).forEach(attr => {
              newElement.setAttribute(attr.name, attr.value);
            });
            parent.replaceChild(newElement, placeholder);
          }
        }, 100);
      }
    });
  }

  // Auto-discover and load components in the DOM
  async autoLoadComponents() {
    const foundComponents = new Set();
    
    // Find all registered components in the DOM
    this.components.forEach((config, tagName) => {
      if (document.querySelector(tagName)) {
        foundComponents.add(tagName);
      }
    });

    if (foundComponents.size > 0) {
      console.log('🔍 Auto-loading components:', Array.from(foundComponents));
      
      // Sort by priority
      const sortedComponents = Array.from(foundComponents).sort((a, b) => {
        const aPriority = this.components.get(a).priority;
        const bPriority = this.components.get(b).priority;
        return bPriority - aPriority; // Higher priority first
      });
      
      // Load components in batches to avoid overwhelming the browser
      const batchSize = 3;
      for (let i = 0; i < sortedComponents.length; i += batchSize) {
        const batch = sortedComponents.slice(i, i + batchSize);
        await Promise.allSettled(batch.map(tagName => this.loadComponent(tagName)));
        
        // Small delay between batches
        if (i + batchSize < sortedComponents.length) {
          await new Promise(resolve => setTimeout(resolve, 50));
        }
      }
    }
  }

  // Initialize the system
  async init() {
    try {
      console.log('🚀 Initializing ComponentSystem...');
      
      // Wait for DOM to be ready
      if (document.readyState === 'loading') {
        await new Promise(resolve => {
          document.addEventListener('DOMContentLoaded', resolve);
        });
      }

      // Auto-load components found in initial DOM
      await this.autoLoadComponents();

      // Set up mutation observer for dynamically added components
      this._setupMutationObserver();

      console.log('✅ ComponentSystem initialization complete');

    } catch (error) {
      console.error('❌ ComponentSystem initialization failed:', error);
    }
  }

  _setupMutationObserver() {
    const observer = new MutationObserver(mutations => {
      const newComponents = new Set();
      
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            // Check if the node itself is a registered component
            const tagName = node.tagName.toLowerCase();
            if (this.components.has(tagName) && !this.loaded.has(tagName)) {
              newComponents.add(tagName);
            }
            
            // Check for registered components in children
            if (node.querySelectorAll) {
              this.components.forEach((config, componentTagName) => {
                if (node.querySelector(componentTagName)) {
                  newComponents.add(componentTagName);
                }
              });
            }
          }
        });
      });

      // Load any new components found
      if (newComponents.size > 0) {
        console.log('🔍 New components detected:', Array.from(newComponents));
        newComponents.forEach(tagName => this.loadComponent(tagName));
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    console.log('👀 MutationObserver active for dynamic component loading');
  }

  // Get system status
  getStatus() {
    return {
      registered: this.components.size,
      loaded: this.loaded.size,
      errors: this.errorComponents.size,
      components: {
        registered: Array.from(this.components.keys()),
        loaded: Array.from(this.loaded),
        errors: Array.from(this.errorComponents)
      }
    };
  }
}

// ============================================================================
// TEAM MEMBER CARD COMPONENT
// ============================================================================
class SafeTeamMemberCard extends HTMLElement {
  static get observedAttributes() {
    return ['name', 'role', 'description', 'image-src', 'image-alt', 'image-size'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    if (this.isConnected) {
      this.render();
    }
  }

  render() {
    try {
      const name = this.getAttribute('name') || 'Team Member';
      const role = this.getAttribute('role') || '';
      const description = this.getAttribute('description') || '';
      const imageSrc = this.getAttribute('image-src') || '';
      const imageAlt = this.getAttribute('image-alt') || `Photo of ${name}`;
      const imageSize = this.getAttribute('image-size') || '400x400';
      
      const [width, height] = imageSize.split('x').map(s => parseInt(s.trim()) || 400);
      
      this.shadowRoot.innerHTML = `
        <style>
          :host {
            display: block;
            margin: 1rem 0;
          }
          
          .content-card {
            background: var(--bg-secondary, #333333);
            border-radius: 12px;
            padding: 1.5rem;
            border-left: 3px solid var(--primary, #6366f1);
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
            transition: all 0.3s ease;
            text-align: center;
          }
          
          .content-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            border-left-color: var(--accent, #10b981);
          }
          
          .profile-image {
            width: ${Math.min(width, 400)}px;
            max-width: 100%;
            height: ${Math.min(height, 400)}px;
            margin: 0 auto 1rem auto;
            border-radius: 8px;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #222c36;
          }
          
          .profile-image img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
          
          .profile-placeholder {
            border: 2px dashed #4a6a8a;
            color: #e0e6ed;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            padding: 1rem;
            width: 100%;
            height: 100%;
          }
          
          .card-title {
            font-size: 1.4rem;
            margin-bottom: 0.5rem;
            color: var(--primary, #6366f1);
            font-weight: 600;
          }
          
          .card-role {
            font-weight: bold;
            color: var(--accent, #10b981);
            margin-bottom: 0.5rem;
          }
          
          .card-description {
            color: var(--text-secondary, #cccccc);
            line-height: 1.6;
            margin: 0;
          }
          
          @media (max-width: 768px) {
            .profile-image {
              width: 100%;
              max-width: 300px;
              height: 300px;
            }
          }
        </style>
        
        <div class="content-card">
          <div class="profile-image">
            ${imageSrc ? 
              `<img src="${imageSrc}" alt="${imageAlt}" loading="lazy" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
               <div class="profile-placeholder" style="display: none;">
                 <span>Image Failed to Load</span>
               </div>` :
              `<div class="profile-placeholder">
                 <span>Image Needed</span>
                 <small>Optimal size: ${imageSize}px</small>
               </div>`
            }
          </div>
          <h3 class="card-title">${name}</h3>
          ${role ? `<p class="card-role">${role}</p>` : ''}
          ${description ? `<p class="card-description">${description}</p>` : ''}
        </div>
      `;
    } catch (error) {
      console.error('TeamMemberCard render error:', error);
      this.shadowRoot.innerHTML = `
        <div style="padding:1rem;border:2px dashed #ff6b6b;color:#ff6b6b;text-align:center;">
          <strong>Render Error</strong><br><small>${error.message}</small>
        </div>
      `;
    }
  }
}

// ============================================================================
// SERVICE CARD COMPONENT
// ============================================================================
class ServiceCard extends HTMLElement {
  static get observedAttributes() {
    return ['service-id', 'title', 'icon', 'description', 'details', 'duration', 'price'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    if (this.isConnected) this.render();
  }

  render() {
    const title = this.getAttribute('title') || 'Service';
    const icon = this.getAttribute('icon') || '🔬';
    const description = this.getAttribute('description') || '';
    const details = this.getAttribute('details') || '';
    const duration = this.getAttribute('duration') || '';
    const price = this.getAttribute('price') || '';

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          margin: 1rem 0;
        }
        
        .service-card {
          background: var(--bg-secondary, #333333);
          border-radius: 12px;
          padding: 1.5rem;
          border-left: 3px solid var(--primary, #6366f1);
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
          text-align: center;
        }
        
        .service-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
          border-left-color: var(--accent, #10b981);
        }
        
        .service-icon {
          font-size: 2.5rem;
          display: block;
          margin-bottom: 1rem;
        }
        
        .service-title {
          font-size: 1.5rem;
          margin-bottom: 1rem;
          color: var(--primary, #6366f1);
          font-weight: 600;
        }
        
        .service-description {
          color: var(--text-secondary, #cccccc);
          line-height: 1.6;
          margin-bottom: 1rem;
        }
        
        .service-details {
          background: rgba(255, 255, 255, 0.05);
          padding: 1rem;
          border-radius: 8px;
          margin-top: 1rem;
          text-align: left;
        }
        
        .service-meta {
          display: flex;
          gap: 1rem;
          margin-top: 0.5rem;
          font-size: 0.9em;
          color: var(--text-secondary, #cccccc);
          flex-wrap: wrap;
          justify-content: center;
        }
        
        .service-meta span {
          background: rgba(255, 255, 255, 0.1);
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.8rem;
        }
      </style>
      
      <div class="service-card">
        <span class="service-icon">${icon}</span>
        <h3 class="service-title">${title}</h3>
        <p class="service-description">${description}</p>
        ${details ? `
          <div class="service-details">
            <p>${details}</p>
            <div class="service-meta">
              ${duration ? `<span>⏱️ ${duration}</span>` : ''}
              ${price ? `<span>💰 ${price}</span>` : ''}
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }
}

// ============================================================================
// TESTIMONIAL CARD COMPONENT
// ============================================================================
class TestimonialCard extends HTMLElement {
  static get observedAttributes() {
    return ['name', 'relationship', 'rating', 'text', 'service'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    if (this.isConnected) this.render();
  }

  render() {
    const name = this.getAttribute('name') || 'Anonymous';
    const relationship = this.getAttribute('relationship') || '';
    const rating = parseInt(this.getAttribute('rating')) || 5;
    const text = this.getAttribute('text') || '';
    const service = this.getAttribute('service') || '';

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          margin: 1rem 0;
        }
        
        .testimonial-card {
          background: var(--bg-secondary, #333333);
          padding: 2rem;
          border-radius: 12px;
          border-left: 3px solid var(--primary, #6366f1);
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
          position: relative;
        }
        
        .testimonial-text {
          font-style: italic;
          margin-bottom: 1.5rem;
          color: var(--text-secondary, #cccccc);
          line-height: 1.6;
          position: relative;
          padding-left: 2rem;
        }
        
        .testimonial-text::before {
          content: '"';
          font-size: 3rem;
          color: var(--secondary, #9333ea);
          position: absolute;
          left: 0;
          top: -1rem;
          opacity: 0.5;
        }
        
        .rating-stars {
          color: #ffd700;
          margin: 0.5rem 0;
          font-size: 1.2rem;
        }
        
        .testimonial-author {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        
        .author-name {
          font-weight: bold;
          color: var(--primary, #6366f1);
          margin-bottom: 0.25rem;
        }
        
        .author-info {
          font-size: 0.9rem;
          color: var(--text-secondary, #cccccc);
          margin: 0.25rem 0;
        }
      </style>
      
      <article class="testimonial-card">
        <blockquote class="testimonial-text">${text}</blockquote>
        <div class="rating-stars">
          ${'★'.repeat(rating)}${'☆'.repeat(5 - rating)}
        </div>
        <footer class="testimonial-author">
          <div>
            <cite class="author-name">${name}</cite>
            ${relationship ? `<p class="author-info">${relationship}</p>` : ''}
            ${service ? `<p class="author-info">Service: ${service}</p>` : ''}
          </div>
        </footer>
      </article>
    `;
  }
}

// ============================================================================
// CONTACT INFO COMPONENT
// ============================================================================
class ContactInfo extends HTMLElement {
  static get observedAttributes() {
    return ['type', 'value', 'label', 'primary'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    if (this.isConnected) this.render();
  }

  render() {
    const type = this.getAttribute('type') || 'info'; // phone, email, address
    const value = this.getAttribute('value') || '';
    const label = this.getAttribute('label') || '';
    const isPrimary = this.hasAttribute('primary');

    let icon = '📞';
    let linkPrefix = '';
    let ariaLabel = '';

    switch (type) {
      case 'phone':
        icon = '📞';
        linkPrefix = 'tel:';
        ariaLabel = `Call ${label}`;
        break;
      case 'email':
        icon = '✉️';
        linkPrefix = 'mailto:';
        ariaLabel = `Send email to ${label}`;
        break;
      case 'address':
        icon = '📍';
        linkPrefix = '';
        ariaLabel = 'Our location';
        break;
    }

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          margin: 0.5rem 0;
        }
        
        .contact-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.5rem;
          border-radius: 6px;
          transition: background-color 0.2s ease;
        }
        
        .contact-item:hover {
          background: rgba(255, 255, 255, 0.05);
        }
        
        .contact-icon {
          font-size: 1.2rem;
          flex-shrink: 0;
        }
        
        .contact-link {
          color: var(--link-color, #38bdf8);
          text-decoration: none;
          font-weight: ${isPrimary ? '600' : '400'};
          transition: color 0.3s ease;
        }
        
        .contact-link:hover {
          color: var(--accent, #10b981);
          text-decoration: underline;
        }
        
        .contact-label {
          font-size: 0.9em;
          color: var(--text-secondary, #cccccc);
          margin-left: 0.5rem;
        }
        
        .contact-text {
          color: var(--text-primary, #ffffff);
          margin: 0;
        }
        
        .primary-indicator {
          background: var(--primary, #6366f1);
          color: white;
          font-size: 0.7rem;
          padding: 0.2rem 0.4rem;
          border-radius: 3px;
          margin-left: 0.5rem;
        }
      </style>
      
      <div class="contact-item">
        <span class="contact-icon">${icon}</span>
        ${linkPrefix ? 
          `<a href="${linkPrefix}${value}" class="contact-link" aria-label="${ariaLabel}">
             ${value}
           </a>` :
          `<span class="contact-text">${value}</span>`
        }
        ${label ? `<span class="contact-label">(${label})</span>` : ''}
        ${isPrimary ? `<span class="primary-indicator">Primary</span>` : ''}
      </div>
    `;
  }
}

// ============================================================================
// HERO SECTION COMPONENT
// ============================================================================
class HeroSection extends HTMLElement {
  static get observedAttributes() {
    return ['title', 'subtitle', 'background-image', 'background-color', 'cta-text', 'cta-link', 'height', 'overlay-opacity'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    if (this.isConnected) this.render();
  }

  render() {
    const title = this.getAttribute('title') || 'Welcome';
    const subtitle = this.getAttribute('subtitle') || '';
    const backgroundImage = this.getAttribute('background-image') || '';
    const backgroundColor = this.getAttribute('background-color') || '#1a1a2e';
    const ctaText = this.getAttribute('cta-text') || '';
    const ctaLink = this.getAttribute('cta-link') || '#';
    const height = this.getAttribute('height') || '60vh';
    const overlayOpacity = this.getAttribute('overlay-opacity') || '0.6';

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          width: 100%;
        }
        
        .hero-container {
          height: ${height};
          background: ${backgroundImage ? `linear-gradient(rgba(0,0,0,${overlayOpacity}), rgba(0,0,0,${overlayOpacity})), url(${backgroundImage})` : backgroundColor};
          background-size: cover;
          background-position: center;
          background-attachment: fixed;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          color: white;
          position: relative;
          overflow: hidden;
        }
        
        .hero-content {
          max-width: 800px;
          padding: 2rem;
          z-index: 2;
          animation: fadeInUp 1s ease-out;
        }
        
        .hero-title {
          font-size: clamp(2.5rem, 5vw, 4rem);
          font-weight: 700;
          margin-bottom: 1rem;
          line-height: 1.2;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        
        .hero-subtitle {
          font-size: clamp(1.2rem, 2.5vw, 1.8rem);
          margin-bottom: 2rem;
          opacity: 0.9;
          line-height: 1.4;
        }
        
        .hero-cta {
          display: inline-block;
          background: var(--primary, #6366f1);
          color: white;
          padding: 1rem 2rem;
          text-decoration: none;
          border-radius: 50px;
          font-weight: 600;
          font-size: 1.1rem;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
        }
        
        .hero-cta:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
          background: var(--primary-dark, #4338ca);
        }
        
        .hero-particles {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
          z-index: 1;
        }
        
        .particle {
          position: absolute;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 50%;
          animation: float 20s infinite linear;
        }
        
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(50px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes float {
          from { transform: translateY(100vh) rotate(0deg); }
          to { transform: translateY(-100px) rotate(360deg); }
        }
        
        @media (max-width: 768px) {
          .hero-container {
            height: 50vh;
            background-attachment: scroll;
          }
          
          .hero-content {
            padding: 1rem;
          }
        }
      </style>
      
      <div class="hero-container">
        <div class="hero-particles"></div>
        <div class="hero-content">
          <h1 class="hero-title">${title}</h1>
          ${subtitle ? `<p class="hero-subtitle">${subtitle}</p>` : ''}
          ${ctaText ? `<a href="${ctaLink}" class="hero-cta">${ctaText}</a>` : ''}
        </div>
      </div>
    `;

    // Add floating particles
    this.addParticles();
  }

  addParticles() {
    const particlesContainer = this.shadowRoot.querySelector('.hero-particles');
    const particleCount = 15;
    
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.left = Math.random() * 100 + '%';
      particle.style.width = particle.style.height = (Math.random() * 4 + 2) + 'px';
      particle.style.animationDelay = Math.random() * 20 + 's';
      particle.style.animationDuration = (Math.random() * 10 + 15) + 's';
      particlesContainer.appendChild(particle);
    }
  }
}

// ============================================================================
// FEATURE GRID COMPONENT
// ============================================================================
class FeatureGrid extends HTMLElement {
  static get observedAttributes() {
    return ['columns', 'gap', 'animation'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    if (this.isConnected) this.render();
  }

  render() {
    const columns = this.getAttribute('columns') || '3';
    const gap = this.getAttribute('gap') || '2rem';
    const animation = this.getAttribute('animation') || 'fade';

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          margin: 2rem 0;
        }
        
        .feature-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: ${gap};
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1rem;
        }
        
        ::slotted(feature-card) {
          animation: ${animation === 'slide' ? 'slideInUp' : 'fadeIn'} 0.6s ease-out;
          animation-fill-mode: both;
        }
        
        ::slotted(feature-card:nth-child(1)) { animation-delay: 0.1s; }
        ::slotted(feature-card:nth-child(2)) { animation-delay: 0.2s; }
        ::slotted(feature-card:nth-child(3)) { animation-delay: 0.3s; }
        ::slotted(feature-card:nth-child(4)) { animation-delay: 0.4s; }
        ::slotted(feature-card:nth-child(5)) { animation-delay: 0.5s; }
        ::slotted(feature-card:nth-child(6)) { animation-delay: 0.6s; }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        
        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @media (max-width: 768px) {
          .feature-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }
        }
      </style>
      
      <div class="feature-grid">
        <slot></slot>
      </div>
    `;
  }
}

// ============================================================================
// FEATURE CARD COMPONENT
// ============================================================================
class FeatureCard extends HTMLElement {
  static get observedAttributes() {
    return ['icon', 'title', 'description', 'link', 'color'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    if (this.isConnected) this.render();
  }

  render() {
    const icon = this.getAttribute('icon') || '⭐';
    const title = this.getAttribute('title') || 'Feature';
    const description = this.getAttribute('description') || '';
    const link = this.getAttribute('link') || '';
    const color = this.getAttribute('color') || 'var(--primary, #6366f1)';

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
        }
        
        .feature-card {
          background: var(--bg-secondary, #333333);
          border-radius: 16px;
          padding: 2rem;
          text-align: center;
          border: 1px solid var(--border-color, #555555);
          transition: all 0.3s ease;
          height: 100%;
          display: flex;
          flex-direction: column;
          position: relative;
          overflow: hidden;
        }
        
        .feature-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: ${color};
          transform: scaleX(0);
          transition: transform 0.3s ease;
        }
        
        .feature-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
          border-color: ${color};
        }
        
        .feature-card:hover::before {
          transform: scaleX(1);
        }
        
        .feature-icon {
          font-size: 3rem;
          margin-bottom: 1.5rem;
          filter: drop-shadow(0 4px 8px rgba(0,0,0,0.2));
        }
        
        .feature-title {
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 1rem;
          color: ${color};
        }
        
        .feature-description {
          color: var(--text-secondary, #cccccc);
          line-height: 1.6;
          flex-grow: 1;
          margin-bottom: 1.5rem;
        }
        
        .feature-link {
          color: ${color};
          text-decoration: none;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.3s ease;
          margin-top: auto;
        }
        
        .feature-link:hover {
          transform: translateX(5px);
          text-decoration: underline;
        }
        
        .feature-link::after {
          content: '→';
          transition: transform 0.3s ease;
        }
        
        .feature-link:hover::after {
          transform: translateX(3px);
        }
      </style>
      
      <div class="feature-card">
        <div class="feature-icon">${icon}</div>
        <h3 class="feature-title">${title}</h3>
        <p class="feature-description">${description}</p>
        ${link ? `<a href="${link}" class="feature-link">Learn More</a>` : ''}
      </div>
    `;
  }
}

// ============================================================================
// STATISTICS COUNTER COMPONENT
// ============================================================================
class StatsCounter extends HTMLElement {
  static get observedAttributes() {
    return ['value', 'label', 'suffix', 'duration', 'color'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.observer = null;
    this.hasAnimated = false;
  }

  connectedCallback() {
    this.render();
    this.setupIntersectionObserver();
  }

  disconnectedCallback() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  attributeChangedCallback() {
    if (this.isConnected) this.render();
  }

  render() {
    const value = parseInt(this.getAttribute('value')) || 0;
    const label = this.getAttribute('label') || 'Statistic';
    const suffix = this.getAttribute('suffix') || '';
    const duration = parseInt(this.getAttribute('duration')) || 2000;
    const color = this.getAttribute('color') || 'var(--primary, #6366f1)';

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
        }
        
        .stats-card {
          background: var(--bg-secondary, #333333);
          border-radius: 12px;
          padding: 2rem;
          text-align: center;
          border: 1px solid var(--border-color, #555555);
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        
        .stats-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: ${color};
          transform: scaleX(0);
          transition: transform 0.3s ease;
        }
        
        .stats-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 25px rgba(0, 0, 0, 0.2);
        }
        
        .stats-card:hover::before {
          transform: scaleX(1);
        }
        
        .stats-value {
          font-size: 3rem;
          font-weight: 700;
          color: ${color};
          margin-bottom: 0.5rem;
          line-height: 1;
        }
        
        .stats-label {
          font-size: 1.1rem;
          color: var(--text-secondary, #cccccc);
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        
        @media (max-width: 768px) {
          .stats-value {
            font-size: 2.5rem;
          }
          
          .stats-card {
            padding: 1.5rem;
          }
        }
      </style>
      
      <div class="stats-card">
        <div class="stats-value" id="counter">0${suffix}</div>
        <div class="stats-label">${label}</div>
      </div>
    `;
  }

  setupIntersectionObserver() {
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.hasAnimated) {
          this.animateCounter();
          this.hasAnimated = true;
        }
      });
    }, { threshold: 0.5 });

    this.observer.observe(this);
  }

  animateCounter() {
    const counter = this.shadowRoot.getElementById('counter');
    const targetValue = parseInt(this.getAttribute('value')) || 0;
    const suffix = this.getAttribute('suffix') || '';
    const duration = parseInt(this.getAttribute('duration')) || 2000;
    
    let currentValue = 0;
    const increment = targetValue / (duration / 16); // 60fps
    
    const timer = setInterval(() => {
      currentValue += increment;
      if (currentValue >= targetValue) {
        currentValue = targetValue;
        clearInterval(timer);
      }
      counter.textContent = Math.floor(currentValue) + suffix;
    }, 16);
  }
}

// ============================================================================
// IMAGE GALLERY COMPONENT
// ============================================================================
class ImageGallery extends HTMLElement {
  static get observedAttributes() {
    return ['layout', 'gap', 'hover-effect'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
    this.setupImageHandlers();
  }

  attributeChangedCallback() {
    if (this.isConnected) this.render();
  }

  render() {
    const layout = this.getAttribute('layout') || 'grid'; // grid, masonry, carousel
    const gap = this.getAttribute('gap') || '1rem';
    const hoverEffect = this.getAttribute('hover-effect') || 'zoom';

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          margin: 2rem 0;
        }
        
        .gallery-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1rem;
        }
        
        .gallery-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: ${gap};
        }
        
        .gallery-masonry {
          columns: 3;
          column-gap: ${gap};
        }
        
        .gallery-carousel {
          display: flex;
          gap: ${gap};
          overflow-x: auto;
          scroll-snap-type: x mandatory;
          padding-bottom: 1rem;
        }
        
        ::slotted(gallery-image) {
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .gallery-masonry ::slotted(gallery-image) {
          break-inside: avoid;
          margin-bottom: ${gap};
        }
        
        .gallery-carousel ::slotted(gallery-image) {
          flex: 0 0 300px;
          scroll-snap-align: start;
        }
        
        @media (max-width: 768px) {
          .gallery-masonry {
            columns: 2;
          }
          
          .gallery-carousel ::slotted(gallery-image) {
            flex: 0 0 250px;
          }
        }
        
        @media (max-width: 480px) {
          .gallery-masonry {
            columns: 1;
          }
          
          .gallery-carousel ::slotted(gallery-image) {
            flex: 0 0 200px;
          }
        }
      </style>
      
      <div class="gallery-container">
        <div class="gallery-${layout}">
          <slot></slot>
        </div>
      </div>
    `;
  }

  setupImageHandlers() {
    this.addEventListener('click', (e) => {
      const galleryImage = e.target.closest('gallery-image');
      if (galleryImage) {
        this.openLightbox(galleryImage);
      }
    });
  }

  openLightbox(imageElement) {
    const imageSrc = imageElement.getAttribute('src');
    const imageAlt = imageElement.getAttribute('alt') || '';
    
    const lightbox = document.createElement('div');
    lightbox.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.9);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      cursor: pointer;
    `;
    
    lightbox.innerHTML = `
      <img src="${imageSrc}" alt="${imageAlt}" style="
        max-width: 90%;
        max-height: 90%;
        object-fit: contain;
        border-radius: 8px;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
      ">
      <button style="
        position: absolute;
        top: 20px;
        right: 20px;
        background: rgba(255, 255, 255, 0.2);
        border: none;
        color: white;
        font-size: 2rem;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
      ">×</button>
    `;
    
    lightbox.addEventListener('click', () => {
      lightbox.remove();
    });
    
    document.body.appendChild(lightbox);
  }
}

// ============================================================================
// GALLERY IMAGE COMPONENT
// ============================================================================
class GalleryImage extends HTMLElement {
  static get observedAttributes() {
    return ['src', 'alt', 'caption', 'hover-effect'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    if (this.isConnected) this.render();
  }

  render() {
    const src = this.getAttribute('src') || '';
    const alt = this.getAttribute('alt') || '';
    const caption = this.getAttribute('caption') || '';
    const hoverEffect = this.getAttribute('hover-effect') || 'zoom';

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          position: relative;
          overflow: hidden;
          border-radius: 12px;
          transition: all 0.3s ease;
        }
        
        :host(:hover) {
          transform: translateY(-4px);
          box-shadow: 0 15px 30px rgba(0, 0, 0, 0.3);
        }
        
        .image-container {
          position: relative;
          overflow: hidden;
          border-radius: 12px;
        }
        
        .gallery-img {
          width: 100%;
          height: auto;
          display: block;
          transition: transform 0.3s ease;
        }
        
        .hover-zoom .gallery-img:hover {
          transform: scale(1.1);
        }
        
        .hover-fade .gallery-img:hover {
          opacity: 0.8;
        }
        
        .image-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
          color: white;
          padding: 1.5rem 1rem 1rem;
          transform: translateY(100%);
          transition: transform 0.3s ease;
        }
        
        :host(:hover) .image-overlay {
          transform: translateY(0);
        }
        
        .image-caption {
          font-size: 0.9rem;
          line-height: 1.4;
          margin: 0;
        }
      </style>
      
      <div class="image-container hover-${hoverEffect}">
        <img src="${src}" alt="${alt}" class="gallery-img" loading="lazy">
        ${caption ? `
          <div class="image-overlay">
            <p class="image-caption">${caption}</p>
          </div>
        ` : ''}
      </div>
    `;
  }
}

// ============================================================================
// TIMELINE COMPONENT
// ============================================================================
class ContentTimeline extends HTMLElement {
  static get observedAttributes() {
    return ['orientation', 'color'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    if (this.isConnected) this.render();
  }

  render() {
    const orientation = this.getAttribute('orientation') || 'vertical'; // vertical, horizontal
    const color = this.getAttribute('color') || 'var(--primary, #6366f1)';

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          margin: 3rem 0;
        }
        
        .timeline-container {
          max-width: 1000px;
          margin: 0 auto;
          padding: 0 1rem;
          position: relative;
        }
        
        .timeline-vertical {
          position: relative;
        }
        
        .timeline-vertical::before {
          content: '';
          position: absolute;
          left: 50%;
          top: 0;
          bottom: 0;
          width: 3px;
          background: ${color};
          transform: translateX(-50%);
        }
        
        .timeline-horizontal {
          display: flex;
          overflow-x: auto;
          gap: 2rem;
          padding-bottom: 1rem;
        }
        
        ::slotted(timeline-item) {
          animation: fadeInScale 0.6s ease-out;
          animation-fill-mode: both;
        }
        
        ::slotted(timeline-item:nth-child(1)) { animation-delay: 0.1s; }
        ::slotted(timeline-item:nth-child(2)) { animation-delay: 0.2s; }
        ::slotted(timeline-item:nth-child(3)) { animation-delay: 0.3s; }
        ::slotted(timeline-item:nth-child(4)) { animation-delay: 0.4s; }
        ::slotted(timeline-item:nth-child(5)) { animation-delay: 0.5s; }
        
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }
        
        @media (max-width: 768px) {
          .timeline-vertical::before {
            left: 30px;
          }
        }
      </style>
      
      <div class="timeline-container">
        <div class="timeline-${orientation}">
          <slot></slot>
        </div>
      </div>
    `;
  }
}

// ============================================================================
// TIMELINE ITEM COMPONENT
// ============================================================================
class TimelineItem extends HTMLElement {
  static get observedAttributes() {
    return ['date', 'title', 'description', 'side', 'icon'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    if (this.isConnected) this.render();
  }

  render() {
    const date = this.getAttribute('date') || '';
    const title = this.getAttribute('title') || 'Event';
    const description = this.getAttribute('description') || '';
    const side = this.getAttribute('side') || 'auto'; // left, right, auto
    const icon = this.getAttribute('icon') || '📅';

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          margin: 2rem 0;
          position: relative;
        }
        
        .timeline-item {
          display: flex;
          align-items: flex-start;
          gap: 2rem;
          position: relative;
        }
        
        .timeline-marker {
          position: absolute;
          left: 50%;
          top: 1rem;
          transform: translateX(-50%);
          width: 40px;
          height: 40px;
          background: var(--primary, #6366f1);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
          color: white;
          z-index: 2;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
        }
        
        .timeline-content {
          background: var(--bg-secondary, #333333);
          border-radius: 12px;
          padding: 1.5rem;
          border: 1px solid var(--border-color, #555555);
          max-width: 45%;
          position: relative;
          transition: all 0.3s ease;
        }
        
        .timeline-content:hover {
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
          transform: translateY(-2px);
        }
        
        .timeline-content.left {
          margin-right: auto;
          margin-left: 0;
        }
        
        .timeline-content.right {
          margin-left: auto;
          margin-right: 0;
        }
        
        .timeline-date {
          color: var(--primary, #6366f1);
          font-weight: 600;
          font-size: 0.9rem;
          margin-bottom: 0.5rem;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        
        .timeline-title {
          font-size: 1.3rem;
          font-weight: 600;
          margin-bottom: 0.75rem;
          color: var(--text-primary, #ffffff);
        }
        
        .timeline-description {
          color: var(--text-secondary, #cccccc);
          line-height: 1.6;
          margin: 0;
        }
        
        .timeline-arrow {
          position: absolute;
          top: 1.5rem;
          width: 0;
          height: 0;
          border: 10px solid transparent;
        }
        
        .timeline-content.left .timeline-arrow {
          right: -20px;
          border-left-color: var(--bg-secondary, #333333);
        }
        
        .timeline-content.right .timeline-arrow {
          left: -20px;
          border-right-color: var(--bg-secondary, #333333);
        }
        
        @media (max-width: 768px) {
          .timeline-marker {
            left: 30px;
            transform: none;
          }
          
          .timeline-content {
            max-width: calc(100% - 80px);
            margin-left: 80px !important;
            margin-right: 0 !important;
          }
          
          .timeline-arrow {
            display: none;
          }
        }
      </style>
      
      <div class="timeline-item">
        <div class="timeline-marker">${icon}</div>
        <div class="timeline-content ${side}">
          <div class="timeline-arrow"></div>
          ${date ? `<div class="timeline-date">${date}</div>` : ''}
          <h3 class="timeline-title">${title}</h3>
          ${description ? `<p class="timeline-description">${description}</p>` : ''}
        </div>
      </div>
    `;
  }
}

// ============================================================================
// CHAT WIDGET COMPONENT (Redesigned with Header/Main/Footer Layout)
// ============================================================================
if (!window.ChatWidget) {
  class ChatWidget {
    constructor(options = {}) {
      const protocol = window.location.protocol;
      const hostname = window.location.hostname;
      const port = options.apiPort || '3000';
      this.apiUrl = options.apiUrl || `${protocol}//${hostname}:${port}/api/chat`;

      this.conversationId = null;
      this.sessionHistory = [];
      this.isLoading = false;
      this.isDebugMode = localStorage.getItem('chatDebugMode') === 'true';
      
      this.maxRetries = 3;
      this.retryCount = 0;
      this.retryDelay = 1000;
      
      this.connectionStatus = 'unknown';
      this.lastHealthCheck = null;
      this.healthCheckInterval = null;

      this.debug = this.createDebugSystem();
      this.performanceMetrics = {
        messagesSent: 0,
        messagesReceived: 0,
        averageResponseTime: 0,
        errors: 0,
        retries: 0
      };

      this.loadWidgetAssets(options);
    }

    createDebugSystem() {
      return {
        log: (message, type = 'info', data = null) => {
          if (!this.isDebugMode) return;
          const timestamp = new Date().toLocaleTimeString();
          console.log(`[${timestamp}] ${type.toUpperCase()}: ${message}`, data || '');
        }
      };
    }

    sanitizeHTML(str) {
      const div = document.createElement('div');
      div.textContent = str;
      return div.innerHTML;
    }

    validateMessage(message) {
      if (!message || typeof message !== 'string') {
        return { valid: false, error: 'Message must be a non-empty string' };
      }
      if (message.length > 500) {
        return { valid: false, error: 'Message too long (max 500 characters)' };
      }
      if (/<script|javascript:|on\w+=/i.test(message)) {
        return { valid: false, error: 'Invalid characters detected' };
      }
      return { valid: true };
    }
    
    async loadWidgetAssets(options = {}) {
      try {
        this.debug.log('Initializing redesigned chat widget', 'info');
        
        const html = this.createRedesignedHTML();
        this.container = document.createElement('div');
        this.container.className = 'redesigned-chat-widget';
        this.container.innerHTML = html;
        
        if (options.mount && options.mount.appendChild) {
          options.mount.appendChild(this.container);
        } else {
          document.body.appendChild(this.container);
        }

        this.addRedesignedStyles();
        this.cacheElements();
        this.addEventListeners();
        this.setupConnectionMonitoring();
        this.addWelcomeMessage();

        this.debug.log('Redesigned chat widget initialized successfully', 'success');
        
      } catch (error) {
        this.debug.log('Failed to initialize chat widget', 'error', error);
        this.showError('Failed to initialize chat widget');
      }
    }

    createRedesignedHTML() {
      return `
        <header class="chat-header-section">
          <h2 class="section-title">Chat With Us</h2>
          <div class="chat-status-bar">
            <span class="status-indicator connecting" id="connection-status"></span>
            <span class="status-text">Connecting...</span>
          </div>
        </header>

        <main class="chat-main-section">
          <div class="chat-messages" id="chat-messages" role="log" aria-live="polite"></div>
        </main>

        <footer class="chat-footer-section">
          <div class="chat-input-wrapper">
            <textarea 
              class="chat-input" 
              placeholder="Ask me about eye care..." 
              rows="2"
              maxlength="500"
              aria-label="Type your message"
            ></textarea>
            <button class="chat-send" disabled aria-label="Send message">
              <span class="send-icon">📤</span>
              <span class="send-text">Send</span>
            </button>
          </div>
          <div class="chat-input-footer">
            <span class="chat-counter" aria-live="polite">0/500</span>
            <div class="quick-actions">
              <button class="quick-action" data-message="What services do you offer?">Services</button>
              <button class="quick-action" data-message="How can I book an appointment?">Book</button>
              <button class="quick-action" data-message="What are your hours?">Hours</button>
            </div>
          </div>
        </footer>
      `;
    }

    addRedesignedStyles() {
      if (document.getElementById('redesigned-chat-styles')) return;

      const style = document.createElement('style');
      style.id = 'redesigned-chat-styles';
      style.textContent = `
        .redesigned-chat-widget {
          width: 100%;
          height: 600px;
          background: var(--bg-secondary, #333333);
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          border: 1px solid var(--border-color, #555555);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        }

        .chat-header-section {
          background: var(--bg-primary, #222222);
          padding: 1.5rem 2rem 0.5rem 2rem;
          border-bottom: 1px solid var(--border-color, #555555);
        }

        .chat-header-section .section-title {
          font-size: 2rem;
          margin-bottom: 1rem;
          color: var(--primary, #6366f1) !important;
          padding-bottom: 0;
          border-bottom: none;
        }

        .chat-status-bar {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
          color: var(--text-secondary, #cccccc);
          margin-bottom: 1rem;
        }

        .status-indicator {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #6b7280;
          transition: all 0.3s ease;
          box-shadow: 0 0 4px rgba(0, 0, 0, 0.3);
        }

        .status-indicator.online {
          background: #10b981;
          box-shadow: 0 0 8px rgba(16, 185, 129, 0.4);
        }

        .status-indicator.offline {
          background: #ef4444;
          box-shadow: 0 0 8px rgba(239, 68, 68, 0.4);
        }

        .status-indicator.connecting {
          background: #f59e0b;
          box-shadow: 0 0 8px rgba(245, 158, 11, 0.4);
          animation: pulse 2s infinite;
        }

        .chat-main-section {
          flex: 1;
          overflow: hidden;
          background: var(--bg-primary, #222222);
        }

        .chat-messages {
          height: 100%;
          padding: 1.5rem;
          overflow-y: auto;
          overflow-x: hidden;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          scrollbar-width: auto;
          scrollbar-color: var(--primary, #6366f1) var(--bg-secondary, #333333);
        }

        .chat-messages::-webkit-scrollbar {
          width: 12px;
        }

        .chat-messages::-webkit-scrollbar-track {
          background: var(--bg-secondary, #333333);
          border-radius: 6px;
        }

        .chat-messages::-webkit-scrollbar-thumb {
          background: var(--primary, #6366f1);
          border-radius: 6px;
          border: 2px solid var(--bg-secondary, #333333);
        }

        .chat-messages::-webkit-scrollbar-thumb:hover {
          background: var(--primary-dark, #4244b8);
        }

        .chat-message {
          animation: fadeInMessage 0.3s ease;
        }

        .message-inline {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          max-width: 85%;
        }

        .user-message .message-inline {
          align-self: flex-end;
          flex-direction: row-reverse;
        }

        .assistant-message .message-inline {
          align-self: flex-start;
        }

        .system-message {
          align-self: center;
          max-width: 90%;
        }

        .message-arrow {
          font-size: 1.2rem;
          font-weight: bold;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          margin-top: 0.1rem;
        }

        .user-arrow {
          background: #ef4444;
          color: white;
          border: 2px solid #dc2626;
        }

        .assistant-message .message-arrow {
          background: #10b981;
          color: white;
          border: 2px solid #059669;
        }

        .message-content {
          padding: 0.75rem 1rem;
          border-radius: 12px;
          line-height: 1.5;
          word-wrap: break-word;
          background: var(--bg-secondary, #333333);
          border: 1px solid var(--border-color, #555555);
          color: var(--text-primary, #ffffff);
          flex: 1;
        }

        .user-message .message-content {
          background: var(--primary, #6366f1);
          color: white;
          border-color: var(--primary, #6366f1);
        }

        .system-content {
          background: rgba(255, 193, 7, 0.1);
          border: 1px solid rgba(255, 193, 7, 0.3);
          color: var(--text-secondary, #cccccc);
          font-style: italic;
          text-align: center;
        }

        .loading-dots {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 4px;
          margin-bottom: 0.5rem;
        }

        .loading-dots span {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--primary, #6366f1);
          animation: dotPulse 1.4s infinite ease-in-out;
        }

        .loading-dots span:nth-child(2) { animation-delay: 0.2s; }
        .loading-dots span:nth-child(3) { animation-delay: 0.4s; }

        .loading-text {
          text-align: center;
          font-size: 0.85rem;
          color: var(--text-secondary, #cccccc);
        }

        .chat-footer-section {
          background: var(--bg-secondary, #333333);
          border-top: 1px solid var(--border-color, #555555);
          padding: 1rem 1.5rem;
          position: sticky;
          bottom: 0;
          z-index: 100;
        }

        .chat-input-wrapper {
          display: flex;
          gap: 0.75rem;
          margin-bottom: 0.75rem;
        }

        .chat-input {
          flex: 1;
          padding: 0.75rem;
          border: 1px solid var(--border-color, #555555);
          border-radius: 8px;
          background: var(--bg-primary, #222222);
          color: var(--text-primary, #ffffff);
          resize: none;
          outline: none;
          font-family: inherit;
          font-size: 0.9rem;
          min-height: 44px;
          max-height: 120px;
          transition: border-color 0.2s ease;
        }

        .chat-input:focus {
          border-color: var(--primary, #6366f1);
          box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.1);
        }

        .chat-send {
          background: var(--primary, #6366f1);
          color: white;
          border: none;
          border-radius: 8px;
          padding: 0.75rem 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          min-width: 80px;
        }

        .chat-send:hover:not(:disabled) {
          background: var(--primary-dark, #4244b8);
          transform: translateY(-1px);
        }

        .chat-send:disabled {
          background: #666;
          cursor: not-allowed;
          transform: none;
        }

        .chat-input-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .chat-counter {
          font-size: 0.8rem;
          color: var(--text-secondary, #cccccc);
        }

        .chat-counter.near-limit {
          color: #ef4444;
          font-weight: 600;
        }

        .quick-actions {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .quick-action {
          background: rgba(255, 255, 255, 0.1);
          color: var(--text-secondary, #cccccc);
          border: 1px solid var(--border-color, #555555);
          border-radius: 16px;
          padding: 0.25rem 0.75rem;
          font-size: 0.8rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .quick-action:hover:not(:disabled) {
          background: var(--primary, #6366f1);
          color: white;
          border-color: var(--primary, #6366f1);
        }

        .quick-action:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.8; }
        }

        @keyframes dotPulse {
          0%, 100% { transform: scale(0.7); opacity: 0.5; }
          50% { transform: scale(1); opacity: 1; }
        }

        @keyframes fadeInMessage {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 768px) {
          .redesigned-chat-widget {
            height: 500px;
          }
          
          .chat-header-section {
            padding: 1rem 1.5rem 0.5rem 1.5rem;
          }
          
          .chat-header-section .section-title {
            font-size: 1.7rem;
          }
          
          .chat-messages {
            padding: 1rem;
            gap: 0.75rem;
          }
          
          .chat-footer-section {
            padding: 0.75rem 1rem;
          }
          
          .chat-input-footer {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }
          
          .quick-actions {
            width: 100%;
            justify-content: center;
          }
        }
      `;
      document.head.appendChild(style);
    }

    cacheElements() {
      this.messagesContainer = this.container.querySelector('#chat-messages');
      this.inputField = this.container.querySelector('.chat-input');
      this.sendButton = this.container.querySelector('.chat-send');
      this.charCounter = this.container.querySelector('.chat-counter');
      this.connectionStatus = this.container.querySelector('#connection-status');
      this.statusText = this.container.querySelector('.status-text');
      this.quickActions = this.container.querySelectorAll('.quick-action');
    }

    addEventListeners() {
      let inputTimeout;
      this.inputField.addEventListener('input', () => {
        clearTimeout(inputTimeout);
        inputTimeout = setTimeout(() => this.handleInput(), 100);
      });
      
      this.inputField.addEventListener('keydown', (e) => this.handleKeyDown(e));
      this.sendButton.addEventListener('click', () => this.sendMessage());
      
      this.quickActions.forEach(action => {
        action.addEventListener('click', () => {
          const message = action.dataset.message;
          if (message) {
            this.inputField.value = message;
            this.handleInput();
            this.sendMessage();
          }
        });
      });

      this.inputField.addEventListener('input', () => {
        this.inputField.style.height = 'auto';
        this.inputField.style.height = Math.min(this.inputField.scrollHeight, 120) + 'px';
      });
    }

    handleInput() {
      const messageLength = this.inputField.value.trim().length;
      this.sendButton.disabled = messageLength === 0 || this.isLoading;
      this.charCounter.textContent = `${messageLength}/500`;
      this.charCounter.classList.toggle('near-limit', messageLength > 450);
    }

    handleKeyDown(e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (!this.sendButton.disabled) {
          this.sendMessage();
        }
      }
    }

    setupConnectionMonitoring() {
      this.testConnection();
      this.healthCheckInterval = setInterval(() => {
        if (!this.isLoading) {
          this.testConnection(true);
        }
      }, 30000);
    }

    async testConnection(silent = false) {
      try {
        if (!silent) {
          this.debug.log('Testing connection...', 'network');
        }
        
        const startTime = performance.now();
        const healthUrl = this.apiUrl.replace('/chat', '/health');
        
        const response = await fetch(healthUrl, {
          method: 'GET',
          signal: AbortSignal.timeout(5000)
        });
        
        const responseTime = performance.now() - startTime;
        
        if (response.ok) {
          const data = await response.json();
          this.updateConnectionStatus('online', 'Online - Ready to help');
          this.lastHealthCheck = new Date();
          
          if (!silent) {
            this.debug.log(`Connection test successful (${responseTime.toFixed(0)}ms)`, 'success', data);
          }
          return { success: true, responseTime, data };
        } else {
          throw new Error(`Health check failed: ${response.status}`);
        }
      } catch (error) {
        this.updateConnectionStatus('offline', 'Offline - Connection issues');
        if (!silent) {
          this.debug.log('Connection test failed', 'error', error);
        }
        return { success: false, error: error.message };
      }
    }

    updateConnectionStatus(status, text) {
      this.connectionStatus.className = `status-indicator ${status}`;
      this.statusText.textContent = text;
      this.connectionStatus = status;
    }

    addWelcomeMessage() {
      this.addMessage({
        role: 'assistant',
        content: `Hello! I'm your AI assistant for eye care questions. Feel free to ask me anything or use the quick action buttons below!`
      });
    }

    async sendMessage() {
      const message = this.inputField.value.trim();
      if (!message || this.isLoading) return;

      const validation = this.validateMessage(message);
      if (!validation.valid) {
        this.showError(validation.error);
        return;
      }

      this.debug.log(`User message: ${message}`, 'input');
      const startTime = performance.now();
      const messageToSend = message;
      
      this.inputField.value = '';
      this.sendButton.disabled = true;
      this.charCounter.textContent = '0/500';
      this.inputField.style.height = 'auto';
      this.charCounter.classList.remove('near-limit');

      try {
        this.addMessage({ role: 'user', content: messageToSend });
        
        this.setLoading(true);
        this.addLoadingIndicator();

        this.sessionHistory.push({ role: 'user', content: messageToSend });

        const requestBody = {
          message: this.sanitizeHTML(messageToSend),
          conversationId: this.conversationId,
          sessionHistory: this.sessionHistory
        };
        
        this.debug.log('Sending request to API', 'network', requestBody);

        const response = await this.fetchWithRetry(this.apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
          let errorDetails = '';
          try {
            const errorData = await response.json();
            errorDetails = errorData.error || errorData.message || '';
          } catch (parseError) {
            try {
              errorDetails = await response.text();
            } catch (textError) {
              // ignore
            }
          }
          throw new Error(`API error: ${response.status} ${response.statusText}${errorDetails ? ` - ${errorDetails}` : ''}`);
        }

        const data = await response.json();
        const responseTime = performance.now() - startTime;
        
        this.debug.log(`Response received (${responseTime.toFixed(0)}ms)`, 'output', data);

        if (!data.response) {
          throw new Error('Invalid response: Missing response field');
        }

        this.conversationId = data.conversationId;
        this.removeLoadingIndicator();
        
        const assistantMessage = { role: 'assistant', content: data.response };
        this.addMessage(assistantMessage);
        this.sessionHistory.push(assistantMessage);

        this.performanceMetrics.messagesSent++;
        this.performanceMetrics.messagesReceived++;
        this.performanceMetrics.averageResponseTime = 
          (this.performanceMetrics.averageResponseTime + responseTime) / 2;

        this.retryCount = 0;
        this.retryDelay = 1000;

      } catch (error) {
        this.debug.log('Error sending message', 'error', error);
        this.performanceMetrics.errors++;
        this.handleError(error);
      } finally {
        this.setLoading(false);
        this.inputField.disabled = false;
        this.inputField.focus();
      }
    }

    async fetchWithRetry(url, options, maxRetries = this.maxRetries) {
      for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 30000);
          
          const response = await fetch(url, {
            ...options,
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);
          return response;
          
        } catch (error) {
          this.debug.log(`Fetch attempt ${attempt + 1}/${maxRetries} failed`, 'warning', error);
          
          if (attempt === maxRetries - 1) {
            throw error;
          }
          
          const delay = this.retryDelay * Math.pow(2, attempt) + Math.random() * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
          this.performanceMetrics.retries++;
        }
      }
    }

    handleError(error) {
      this.removeLoadingIndicator();
      this.retryCount++;
      
      let errorMessage = 'An unexpected error occurred.';
      let canRetry = false;
      
      if (error.message.includes('timeout') || error.name === 'AbortError') {
        errorMessage = '⏱️ Request Timeout';
        canRetry = true;
      } else if (error.message.includes('Failed to fetch') || error.message.includes('Network error')) {
        errorMessage = '🌐 Connection Failed';
        canRetry = true;
      } else if (error.message.includes('500')) {
        errorMessage = '🚨 Server Error';
        canRetry = true;
      } else if (error.message.includes('429')) {
        errorMessage = '🚫 Rate Limited';
        canRetry = true;
      }
      
      this.addMessage({
        role: 'system',
        content: errorMessage
      });
    }

    setLoading(loading) {
      this.isLoading = loading;
      this.sendButton.disabled = loading || this.inputField.value.trim().length === 0;
      this.inputField.disabled = false;
      
      if (loading) {
        this.inputField.placeholder = '';
      } else {
        this.inputField.placeholder = 'Ask me about eye care...';
      }
      
      this.quickActions.forEach(action => action.disabled = loading);
      
      const sendText = this.sendButton.querySelector('.send-text');
      if (sendText) {
        sendText.textContent = loading ? 'Sending...' : 'Send';
      }
    }

    addLoadingIndicator() {
      this.removeLoadingIndicator();
      const loadingEl = document.createElement('div');
      loadingEl.className = 'chat-message assistant-message loading-indicator';
      loadingEl.innerHTML = `
        <div class="message-inline">
          <span class="message-arrow">←</span>
          <div class="message-content">
            <div class="loading-dots">
              <span></span><span></span><span></span>
            </div>
            <div class="loading-text">Thinking...</div>
          </div>
        </div>
      `;
      this.messagesContainer.insertBefore(loadingEl, this.messagesContainer.firstChild);
    }

    removeLoadingIndicator() {
      const loadingEl = this.messagesContainer.querySelector('.loading-indicator');
      if (loadingEl) loadingEl.remove();
    }

    addMessage({ role, content }) {
      this.debug.log(`Adding ${role} message to UI`, 'ui');
      
      const messageEl = document.createElement('div');
      messageEl.className = `chat-message ${role}-message`;
      messageEl.setAttribute('role', role === 'system' ? 'status' : 'log');
      
      const formattedContent = this.formatMessage(content);
      
      if (role === 'system') {
        messageEl.innerHTML = `<div class="message-content system-content">${formattedContent}</div>`;
      } else {
        let arrow = '';
        if (role === 'user') {
          arrow = '→';
        } else if (role === 'assistant') {
          arrow = '←';
        }
        
        messageEl.innerHTML = `
          <div class="message-inline">
            <span class="message-arrow ${role}-arrow">${arrow}</span>
            <div class="message-content">${formattedContent}</div>
          </div>
        `;
      }
      
      this.messagesContainer.insertBefore(messageEl, this.messagesContainer.firstChild);
      
      messageEl.style.opacity = '0';
      messageEl.style.transform = 'translateY(-20px)';
      setTimeout(() => {
        messageEl.style.transition = 'all 0.3s ease';
        messageEl.style.opacity = '1';
        messageEl.style.transform = 'translateY(0)';
      }, 50);
    }

    formatMessage(content) {
      let formatted = this.sanitizeHTML(content);
      return formatted
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
        .replace(/`(.*?)`/g, '<code>$1</code>')
        .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>')
        .replace(/\n/g, '<br>');
    }

    showNotification(message, type = 'info') {
      const notification = document.createElement('div');
      notification.textContent = message;
      notification.style.cssText = `
        position: fixed; top: 20px; right: 20px; padding: 0.75rem 1rem;
        border-radius: 8px; color: white; z-index: 10000;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        animation: slideIn 0.3s ease;
      `;
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 3000);
    }

    showError(message) {
      this.showNotification(message, 'error');
      this.debug.log(message, 'error');
    }

    destroy() {
      if (this.healthCheckInterval) {
        clearInterval(this.healthCheckInterval);
      }
      if (this.container && this.container.parentNode) {
        this.container.parentNode.removeChild(this.container);
      }
    }
  }

  window.ChatWidget = ChatWidget;
}

// ============================================================================
// COMPONENT REGISTRATION AND INITIALIZATION
// ============================================================================

// Create and expose global instance
window.componentSystem = new ComponentSystem();

// Register all components with the system
window.componentSystem.register('team-member-card', SafeTeamMemberCard, {
  priority: 1,
  fallbackContent: `
    <div style="padding:1.5rem;border:2px dashed #6366f1;border-radius:8px;text-align:center;color:#cccccc;">
      <strong>👤 Team Member</strong><br>
      <small>Loading member information...</small>
    </div>
  `
});

window.componentSystem.register('service-card', ServiceCard, {
  priority: 2,
  fallbackContent: `<div style="padding:1rem;border:2px dashed #6366f1;text-align:center;color:#cccccc;">🔬 Service Loading...</div>`
});

window.componentSystem.register('testimonial-card', TestimonialCard, {
  priority: 2,
  fallbackContent: `<div style="padding:1rem;border:2px dashed #6366f1;text-align:center;color:#cccccc;">💬 Testimonial Loading...</div>`
});

window.componentSystem.register('contact-info', ContactInfo, {
  priority: 3,
  fallbackContent: `<div style="padding:0.5rem;color:#cccccc;">📞 Contact Loading...</div>`
});

window.componentSystem.register('hero-section', HeroSection, {
  priority: 1,
  fallbackContent: `
    <div style="height:60vh;background:#1a1a2e;display:flex;align-items:center;justify-content:center;color:white;text-align:center;">
      <div>
        <h1 style="font-size:3rem;margin-bottom:1rem;">Loading Hero...</h1>
        <p>Please wait while the hero section loads</p>
      </div>
    </div>
  `
});

window.componentSystem.register('feature-grid', FeatureGrid, {
  priority: 2,
  fallbackContent: `<div style="padding:2rem;text-align:center;color:#cccccc;">🔧 Feature Grid Loading...</div>`
});

window.componentSystem.register('feature-card', FeatureCard, {
  priority: 2,
  fallbackContent: `<div style="padding:2rem;border:2px dashed #6366f1;border-radius:12px;text-align:center;color:#cccccc;">⭐ Feature Loading...</div>`
});

window.componentSystem.register('stats-counter', StatsCounter, {
  priority: 3,
  fallbackContent: `<div style="padding:2rem;text-align:center;color:#cccccc;">📊 Counter Loading...</div>`
});

window.componentSystem.register('image-gallery', ImageGallery, {
  priority: 2,
  fallbackContent: `<div style="padding:2rem;text-align:center;color:#cccccc;">🖼️ Gallery Loading...</div>`
});

window.componentSystem.register('gallery-image', GalleryImage, {
  priority: 3,
  dependencies: ['image-gallery'],
  fallbackContent: `<div style="width:300px;height:200px;background:#333;border-radius:8px;display:flex;align-items:center;justify-content:center;color:#ccc;">📷 Image Loading...</div>`
});

window.componentSystem.register('content-timeline', ContentTimeline, {
  priority: 2,
  fallbackContent: `<div style="padding:2rem;text-align:center;color:#cccccc;">⏰ Timeline Loading...</div>`
});

window.componentSystem.register('timeline-item', TimelineItem, {
  priority: 3,
  dependencies: ['content-timeline'],
  fallbackContent: `<div style="padding:1rem;border-left:3px solid #6366f1;margin:1rem 0;color:#cccccc;">📅 Timeline Item Loading...</div>`
});

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.componentSystem.init();
  });
} else {
  window.componentSystem.init();
}

console.log('🎨 Complete app-with-components.js loaded successfully!');
console.log('📦 Available components:', [
  'team-member-card', 'service-card', 'testimonial-card', 'contact-info',
  'hero-section', 'feature-grid', 'feature-card', 'stats-counter',
  'image-gallery', 'gallery-image', 'content-timeline', 'timeline-item'
]);
console.log('💬 ChatWidget class available globally');
console.log('🔧 ComponentSystem available at window.componentSystem');