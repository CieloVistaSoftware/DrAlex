// Enhanced Application Class with JSON-driven content
class EyeCareApp {
  constructor() {
    this.config = null;
    this.currentSection = 'home';
    this.debounceTimer = null;
    this.isLoading = false;
    this.loadingOverlay = document.getElementById('loading-overlay');
    this.mainContent = document.getElementById('main-content');
    
    this.init();
  }
  
  async init() {
    try {
      // Load configuration first
      const configLoaded = await this.loadConfig();
      
      // Show error if JSON failed to load
      if (!configLoaded) {
        this.showCriticalError();
        return;
      }
      
      // Initialize site metadata
      this.initializeSiteMetadata();
      
      // Build navigation and footer
      this.buildNavigation();
      this.buildFooter();
      
      // Setup event listeners
      this.setupEventListeners();
      
      // Handle initial page load
      this.handleInitialLoad();
      
      // Register service worker
      this.registerServiceWorker();
      
    } catch (error) {
      this.handleError('Failed to initialize application', error);
    } finally {
      // Hide initial loading
      this.showLoading(false);
    }
  }
  
  async loadConfig() {
    try {
      console.log('Loading configuration from data/content.json...');
      const response = await fetch('data/content.json');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      this.config = await response.json();
      console.log('✅ Configuration loaded successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to load configuration:', error);
      return false;
    }
  }
  
  showCriticalError() {
    this.mainContent.innerHTML = `
      <section class="content-section">
        <div class="error-message">
          <h2>⚠️ Configuration Error</h2>
          <p>Unable to load website configuration. Please ensure:</p>
          <ul>
            <li>The <code>data/content.json</code> file exists</li>
            <li>The file contains valid JSON data</li>
            <li>The web server can access the file</li>
          </ul>
          <button onclick="location.reload()" class="cta-button">Retry</button>
        </div>
      </section>
    `;
  }
  
  initializeSiteMetadata() {
    if (!this.config?.site) return;
    
    // Update structured data
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "MedicalBusiness",
      "name": this.config.site.title,
      "description": this.config.site.description
    };
    
    if (this.config.contact) {
      if (this.config.contact.phones?.[0]) {
        structuredData.telephone = this.config.contact.phones[0].number;
      }
      if (this.config.contact.emails?.[0]) {
        structuredData.email = this.config.contact.emails[0].address;
      }
      if (this.config.contact.address) {
        structuredData.address = {
          "@type": "PostalAddress",
          "addressLocality": this.config.contact.address.city,
          "addressCountry": this.config.contact.address.country === "Uganda" ? "UG" : this.config.contact.address.country
        };
      }
    }
    
    // Update or create structured data script
    let structuredScript = document.querySelector('script[type="application/ld+json"]');
    if (!structuredScript) {
      structuredScript = document.createElement('script');
      structuredScript.type = 'application/ld+json';
      document.head.appendChild(structuredScript);
    }
    structuredScript.textContent = JSON.stringify(structuredData);
    
    // Update meta tags
    document.title = this.config.site.title;
    this.updateMetaTag('description', this.config.site.description);
    this.updateMetaTag('keywords', this.config.site.keywords);
  }
  
  updateMetaTag(name, content) {
    if (!content) return;
    let meta = document.querySelector(`meta[name="${name}"]`);
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = name;
      document.head.appendChild(meta);
    }
    meta.content = content;
  }
  
  buildNavigation() {
    const navList = document.getElementById('nav-list');
    if (!navList || !this.config?.navigation) return;
    
    navList.innerHTML = '';
    
    this.config.navigation.forEach((item, index) => {
      const li = document.createElement('li');
      li.setAttribute('role', 'none');
      
      const a = document.createElement('a');
      a.href = item.url;
      a.className = `nav-link ${index === 0 ? 'active' : ''}`;
      a.dataset.section = item.id;
      a.setAttribute('role', 'menuitem');
      a.tabIndex = index === 0 ? 0 : -1;
      a.innerHTML = `${item.icon} <span>${item.label}</span>`;
      
      li.appendChild(a);
      navList.appendChild(li);
    });
  }
  
  buildFooter() {
    const footerCopyright = document.getElementById('footer-copyright');
    const footerLinks = document.getElementById('footer-links');
    
    if (footerCopyright && this.config?.site?.copyright) {
      footerCopyright.textContent = `© ${this.config.site.copyright}`;
    }
    
    if (footerLinks && this.config?.footer?.links) {
      footerLinks.innerHTML = '';
      
      this.config.footer.links.forEach(link => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = link.url;
        a.className = 'footer-link';
        a.textContent = link.label;
        li.appendChild(a);
        footerLinks.appendChild(li);
      });
    }
  }
  
  setupEventListeners() {
    // Mobile toggle
    const mobileToggle = document.getElementById('mobile-toggle');
    if (mobileToggle) {
      mobileToggle.addEventListener('click', (e) => this.toggleNav(e));
    }
    
    // Navigation with event delegation
    const navList = document.getElementById('nav-list');
    if (navList) {
      navList.addEventListener('click', (e) => this.handleNavigation(e));
      navList.addEventListener('keydown', (e) => this.handleKeyboardNavigation(e));
    }
    
    // Close mobile nav when clicking outside
    document.addEventListener('click', (e) => this.handleOutsideClick(e));
    
    // Popstate with debouncing
    window.addEventListener('popstate', (e) => this.handlePopState(e));
    
    // Handle phone and email links
    document.addEventListener('click', (e) => this.handleContactLinks(e));
    
    // Handle internal navigation links (like CTAs and footer links)
    document.addEventListener('click', (e) => this.handleInternalLinks(e));
  }
  
  toggleNav(e) {
    e.preventDefault();
    const nav = document.getElementById('site-nav');
    const toggle = document.getElementById('mobile-toggle');
    
    if (nav && toggle) {
      const isOpen = nav.classList.contains('open');
      nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', !isOpen);
    }
  }
  
  handleNavigation(e) {
    const link = e.target.closest('.nav-link');
    if (!link) return;
    
    e.preventDefault();
    
    try {
      this.updateActiveNavLink(link);
      const section = link.dataset.section;
      this.loadPage(section);
      this.updateURL(section);
      this.closeMobileNav();
      this.scrollToTop();
    } catch (error) {
      this.handleError('Navigation failed', error);
    }
  }
  
  handleKeyboardNavigation(e) {
    const currentLink = e.target;
    if (!currentLink.classList.contains('nav-link')) return;
    
    const navLinks = Array.from(document.querySelectorAll('.nav-link'));
    const currentIndex = navLinks.indexOf(currentLink);
    
    let targetIndex;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        targetIndex = (currentIndex + 1) % navLinks.length;
        break;
      case 'ArrowUp':
        e.preventDefault();
        targetIndex = currentIndex === 0 ? navLinks.length - 1 : currentIndex - 1;
        break;
      case 'Home':
        e.preventDefault();
        targetIndex = 0;
        break;
      case 'End':
        e.preventDefault();
        targetIndex = navLinks.length - 1;
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        currentLink.click();
        return;
      default:
        return;
    }
    
    navLinks.forEach((link, index) => {
      link.tabIndex = index === targetIndex ? 0 : -1;
    });
    navLinks[targetIndex].focus();
  }
  
  updateActiveNavLink(activeLink) {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.classList.remove('active');
      link.tabIndex = -1;
    });
    
    activeLink.classList.add('active');
    activeLink.tabIndex = 0;
  }
  
  handleOutsideClick(e) {
    const nav = document.getElementById('site-nav');
    const toggle = document.getElementById('mobile-toggle');
    
    if (nav && toggle && !nav.contains(e.target) && !toggle.contains(e.target)) {
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  }
  
  handlePopState(e) {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      try {
        const hash = window.location.hash.slice(1);
        const section = hash || 'home';
        
        const activeLink = document.querySelector(`[data-section="${section}"]`);
        if (activeLink) {
          this.updateActiveNavLink(activeLink);
        }
        
        this.loadPage(section);
        this.scrollToTop();
      } catch (error) {
        this.handleError('Browser navigation failed', error);
      }
    }, 100);
  }
  
  handleContactLinks(e) {
    if (e.target.tagName === 'A') {
      if (e.target.href.startsWith('tel:')) {
        const phoneNumber = e.target.href.replace('tel:', '');
        
        if (!/^\+?[\d\s-()]+$/.test(phoneNumber)) {
          e.preventDefault();
          this.showError('Invalid phone number format');
          return;
        }
        
        if (!('ontouchstart' in window) && !navigator.userAgent.includes('Mobile')) {
          e.preventDefault();
          this.copyToClipboard(phoneNumber);
          this.showSuccess(`Phone number ${phoneNumber} copied to clipboard`);
        }
      }
    }
  }
  
  handleInternalLinks(e) {
    const link = e.target.closest('a');
    if (!link) return;
    
    const href = link.getAttribute('href');
    if (href && href.startsWith('#') && href.length > 1) {
      const section = href.substring(1);
      
      // Check if it's a valid navigation section
      const navItem = this.config?.navigation?.find(item => item.id === section);
      if (navItem) {
        e.preventDefault();
        
        // Update active nav link
        const navLink = document.querySelector(`[data-section="${section}"]`);
        if (navLink) {
          this.updateActiveNavLink(navLink);
        }
        
        // Load the page and scroll to top
        this.loadPage(section);
        this.updateURL(section);
        this.closeMobileNav();
      }
    }
  }
  
  async loadPage(section) {
    if (this.isLoading) return;
    
    try {
      this.isLoading = true;
      this.showLoading(true);
      
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const content = this.generatePageContent(section);
      
      if (this.mainContent) {
        this.mainContent.innerHTML = content;
        this.currentSection = section;
        this.updatePageTitle(section);
      }
      
    } catch (error) {
      this.handleError(`Failed to load ${section} content`, error);
      this.showErrorContent();
    } finally {
      this.isLoading = false;
      this.showLoading(false);
      // Scroll to top after content is loaded and loading is hidden
      setTimeout(() => this.scrollToTop(), 50);
    }
  }
  
  generatePageContent(section) {
    if (!this.config) return this.getErrorContent('Configuration not loaded');
    
    switch (section) {
      case 'home':
        return this.generateHomePage();
      case 'about':
        return this.generateAboutPage();
      case 'services':
        return this.generateServicesPage();
      case 'portfolio':
        return this.generatePortfolioPage();
      case 'contact':
        return this.generateContactPage();
      case 'chat':
        return this.generateChatPage();
      case 'privacy':
        return this.generatePrivacyPage();
      case 'terms':
        return this.generateTermsPage();
      default:
        return this.getErrorContent(`Page "${section}" not found`);
    }
  }
  
  generateHomePage() {
    const page = this.config.pages?.home || {};
    const hero = page.hero || {};
    const featuredServices = page.featuredServices || [];
    
    let servicesHTML = '';
    if (featuredServices.length > 0 && this.config.services) {
      const services = this.config.services.filter(s => featuredServices.includes(s.id));
      servicesHTML = `
        <section class="content-section">
          <h2 class="section-title">Our Services</h2>
          <div class="content-grid">
            ${services.map(service => `
              <div class="content-card">
                <span class="card-icon" role="img" aria-label="${service.title}">${service.icon}</span>
                <h3 class="card-title">${service.title}</h3>
                <p class="card-description">${service.description}</p>
              </div>
            `).join('')}
          </div>
        </section>
      `;
    }
    
    return `
      <section class="content-section">
        <div class="hero-section">
          <h1>${hero.title || 'Welcome'}</h1>
          ${hero.subtitle ? `<p class="hero-subtitle">${hero.subtitle}</p>` : ''}
          <p class="hero-description">${hero.description || 'Professional services'}</p>
          ${hero.cta ? `
            <a href="${hero.cta.link}" class="cta-link">
              <button class="cta-button">${hero.cta.text}</button>
            </a>
          ` : ''}
        </div>
      </section>
      ${servicesHTML}
    `;
  }
  
  generateAboutPage() {
    const page = this.config.pages?.about || {};
    const team = this.config.team || [];
    
    const teamHTML = team.length > 0 ? `
      <section class="content-section">
        <h2 class="section-title">Our Team</h2>
        <div class="content-grid">
          ${team.map(member => `
            <div class="content-card">
              <h3 class="card-title">${member.name}</h3>
              <p class="card-description">
                <strong>${member.role}</strong><br>
                ${member.description || ''}
                ${member.specialties ? `<br><em>Specialties: ${member.specialties.join(', ')}</em>` : ''}
              </p>
            </div>
          `).join('')}
        </div>
      </section>
    ` : '';
    
    return `
      <section class="content-section">
        <h2 class="section-title">${page.title || 'About Us'}</h2>
        ${page.subtitle ? `<p class="section-subtitle">${page.subtitle}</p>` : ''}
        <div class="content-card">
          <p class="card-description">${page.description || 'Learn more about our practice.'}</p>
          ${page.mission ? `
            <h3 class="card-title">Our Mission</h3>
            <p class="card-description">${page.mission}</p>
          ` : ''}
          ${page.values ? `
            <h3 class="card-title">Our Values</h3>
            <ul>
              ${page.values.map(value => `<li>${value}</li>`).join('')}
            </ul>
          ` : ''}
        </div>
      </section>
      ${teamHTML}
    `;
  }
  
  generateServicesPage() {
    const page = this.config.pages?.services || {};
    const services = this.config.services || [];
    
    return `
      <section class="content-section">
        <h2 class="section-title">${page.title || 'Our Services'}</h2>
        ${page.subtitle ? `<p class="section-subtitle">${page.subtitle}</p>` : ''}
        <p style="color: var(--text-secondary); margin-bottom: 2rem; line-height: 1.6;">
          ${page.description || 'Our comprehensive services'}
        </p>
        <div class="content-grid">
          ${services.map(service => `
            <div class="content-card">
              <span class="card-icon" role="img" aria-label="${service.title}">${service.icon}</span>
              <h3 class="card-title">${service.title}</h3>
              <p class="card-description">${service.description}</p>
              ${service.details ? `
                <div class="service-details">
                  <p>${service.details}</p>
                  <div class="service-meta">
                    ${service.duration ? `<span>Duration: ${service.duration}</span>` : ''}
                    ${service.price ? `<span>Price: ${service.price}</span>` : ''}
                  </div>
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>
      </section>
    `;
  }
  
  generatePortfolioPage() {
    const page = this.config.pages?.portfolio || {};
    const testimonials = this.config.testimonials || [];
    
    return `
      <section class="content-section">
        <h2 class="section-title">${page.title || 'Portfolio'}</h2>
        ${page.subtitle ? `<p class="section-subtitle">${page.subtitle}</p>` : ''}
        <p style="color: var(--text-secondary); margin-bottom: 2rem; line-height: 1.6;">
          ${page.description || 'Our work and testimonials'}
        </p>
        ${testimonials.map(testimonial => `
          <article class="testimonial-card">
            <blockquote class="testimonial-text">
              ${testimonial.text}
            </blockquote>
            ${testimonial.rating ? `
              <div class="rating-stars">
                ${'★'.repeat(testimonial.rating)}${'☆'.repeat(5 - testimonial.rating)}
              </div>
            ` : ''}
            <footer class="testimonial-author">
              <div>
                <cite class="author-name">${testimonial.name}</cite>
                <p class="author-info">${testimonial.relationship}</p>
                ${testimonial.service ? `<p class="author-info">Service: ${testimonial.service}</p>` : ''}
              </div>
            </footer>
          </article>
        `).join('')}
      </section>
    `;
  }
  
  generateContactPage() {
    const page = this.config.pages?.contact || {};
    const contact = this.config.contact || {};
    
    return `
      <section class="content-section">
        <h2 class="section-title">${page.title || 'Contact Us'}</h2>
        ${page.subtitle ? `<p class="section-subtitle">${page.subtitle}</p>` : ''}
        <p style="color: var(--text-secondary); margin-bottom: 2rem; line-height: 1.6;">
          ${page.description || 'Get in touch with us'}
        </p>
        <div class="content-grid">
          ${contact.phones ? `
            <div class="content-card">
              <span class="card-icon" role="img" aria-label="Phone">📞</span>
              <h3 class="card-title">Phone</h3>
              <address class="card-description">
                ${contact.phones.map(phone => `
                  <a href="tel:${phone.number}" aria-label="Call ${phone.label}">${phone.number}</a>
                  <span style="font-size: 0.9em; color: var(--text-secondary);"> (${phone.label})</span><br>
                `).join('')}
              </address>
            </div>
          ` : ''}
          ${contact.emails ? `
            <div class="content-card">
              <span class="card-icon" role="img" aria-label="Email">✉️</span>
              <h3 class="card-title">Email</h3>
              <address class="card-description">
                ${contact.emails.map(email => `
                  <a href="mailto:${email.address}" aria-label="Send email to ${email.label}">${email.address}</a>
                  <span style="font-size: 0.9em; color: var(--text-secondary);"> (${email.label})</span><br>
                `).join('')}
              </address>
            </div>
          ` : ''}
          ${contact.address ? `
            <div class="content-card">
              <span class="card-icon" role="img" aria-label="Location">📍</span>
              <h3 class="card-title">Address</h3>
              <address class="card-description">${contact.address.full}</address>
            </div>
          ` : ''}
        </div>
        ${contact.hours ? `
          <section class="content-section">
            <h2 class="section-title">Hours of Operation</h2>
            <div class="content-card">
              <p class="card-description">
                ${contact.hours.weekdays}<br>
                ${contact.hours.weekend}<br>
                ${contact.hours.closed}
              </p>
            </div>
          </section>
        ` : ''}
      </section>
    `;
  }
  
  generateChatPage() {
    const page = this.config.pages?.chat || {};
    const primaryPhone = this.config.contact?.phones?.find(p => p.primary)?.number || '';
    
    return `
      <section class="content-section">
        <h2 class="section-title">${page.title || 'Chat'}</h2>
        ${page.subtitle ? `<p class="section-subtitle">${page.subtitle}</p>` : ''}
        <p style="color: var(--text-secondary); margin-bottom: 2rem; line-height: 1.6;">
          ${page.description || 'Get in touch'}
        </p>
        <div class="content-card">
          <p class="card-description">
            ${primaryPhone ? `
              Live chat functionality coming soon. For immediate assistance, please call us at 
              <a href="tel:${primaryPhone}" aria-label="Call for immediate assistance">${primaryPhone}</a>.
            ` : 'Live chat functionality coming soon.'}
          </p>
          ${page.fallback ? `
            <div style="margin-top: 1rem;">
              <button class="cta-button" onclick="window.location.href='${page.fallback.link}'">
                ${page.fallback.text}
              </button>
            </div>
          ` : ''}
        </div>
      </section>
    `;
  }
  
  generatePrivacyPage() {
    const page = this.config.pages?.privacy || {};
    return this.generateLegalPage(page, 'Privacy Policy');
  }
  
  generateTermsPage() {
    const page = this.config.pages?.terms || {};
    return this.generateLegalPage(page, 'Terms of Service');
  }
  
  generateLegalPage(page, defaultTitle) {
    return `
      <section class="content-section">
        <h2 class="section-title">${page.title || defaultTitle}</h2>
        ${page.lastUpdated ? `<p style="color: var(--text-secondary); margin-bottom: 2rem;">Last updated: ${page.lastUpdated}</p>` : ''}
        ${page.sections ? page.sections.map(section => `
          <div class="content-card">
            <h3 class="card-title">${section.title}</h3>
            <p class="card-description">${section.content}</p>
          </div>
        `).join('') : '<div class="content-card"><p>Content coming soon.</p></div>'}
      </section>
    `;
  }
  
  getErrorContent(message) {
    return `
      <section class="content-section">
        <div class="error-message">
          <h2>Content Not Available</h2>
          <p>${message}</p>
          <button onclick="location.reload()" class="cta-button">Refresh Page</button>
        </div>
      </section>
    `;
  }
  
  updatePageTitle(section) {
    const navItem = this.config?.navigation?.find(item => item.id === section);
    const title = navItem?.title || this.config?.site?.title || 'Website';
    document.title = title;
  }
  
  updateURL(section) {
    try {
      window.history.pushState({ section }, '', '#' + section);
    } catch (error) {
      console.warn('Failed to update URL:', error);
    }
  }
  
  closeMobileNav() {
    if (window.innerWidth <= 768) {
      const nav = document.getElementById('site-nav');
      const toggle = document.getElementById('mobile-toggle');
      if (nav && toggle) {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    }
  }
  
  scrollToTop() {
    // Scroll the main content area to the top smoothly
    if (this.mainContent) {
      this.mainContent.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
    
    // Also scroll the window in case the main content doesn't have its own scroll
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }
  
  showLoading(show) {
    if (this.loadingOverlay) {
      this.loadingOverlay.classList.toggle('active', show);
    }
  }
  
  handleInitialLoad() {
    try {
      const hash = window.location.hash.slice(1);
      const initialSection = hash || 'home';
      
      const activeLink = document.querySelector(`[data-section="${initialSection}"]`);
      if (activeLink) {
        this.updateActiveNavLink(activeLink);
      }
      
      this.loadPage(initialSection);
    } catch (error) {
      this.handleError('Failed to load initial content', error);
    }
  }
  
  async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        // Check if service worker file exists first
        const swResponse = await fetch('/sw.js', { method: 'HEAD' });
        if (swResponse.ok) {
          await navigator.serviceWorker.register('/sw.js');
          console.log('✅ Service Worker registered successfully');
        } else {
          console.log('ℹ️ Service Worker file not found - skipping registration (optional)');
        }
      } catch (error) {
        console.log('ℹ️ Service Worker registration skipped:', error.message);
      }
    }
  }
  
  async copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  }
  
  showSuccess(message) {
    this.showNotification(message, 'success');
  }
  
  showError(message) {
    this.showNotification(message, 'error');
  }
  
  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    const colors = {
      error: '#e74c3c',
      success: '#27ae60',
      warning: '#f39c12',
      info: '#3498db'
    };
    
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 1rem;
      border-radius: 8px;
      color: white;
      background: ${colors[type] || colors.info};
      z-index: 10000;
      animation: slideIn 0.3s ease;
      max-width: 300px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => notification.remove(), 300);
    }, type === 'warning' ? 5000 : 3000);
  }
  
  handleError(message, error) {
    console.error(message, error);
    this.showError(message);
    
    if (typeof gtag !== 'undefined') {
      gtag('event', 'exception', {
        description: message,
        fatal: false
      });
    }
  }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new EyeCareApp());
} else {
  new EyeCareApp();
}