// js/component-system.js - Safe component loading system
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

// Create and expose global instance
window.componentSystem = new ComponentSystem();

// Safe Team Member Card Component (rewritten without external dependencies)
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

// Register components with the system
window.componentSystem.register('team-member-card', SafeTeamMemberCard, {
  priority: 1,
  fallbackContent: `
    <div style="padding:1.5rem;border:2px dashed #6366f1;border-radius:8px;text-align:center;color:#cccccc;">
      <strong>👤 Team Member</strong><br>
      <small>Loading member information...</small>
    </div>
  `
});

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.componentSystem.init();
  });
} else {
  window.componentSystem.init();
}

export { ComponentSystem, SafeTeamMemberCard };