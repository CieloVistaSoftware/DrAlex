class LeftNav extends HTMLElement {
  constructor() {
    super();
    
    // Use light DOM to work with existing CSS
    this.innerHTML = `
      <div class="site-nav">
        <div class="nav-header">
          <div class="nav-title">Dr. Alex Kisitu</div>
          <div class="nav-subtitle">Eye Care Specialist</div>
        </div>
        
        <div class="nav-menu">
          <ul class="nav-list">
            <li><a href="#home" class="nav-link active" data-section="home">🏠 Home</a></li>
            <li><a href="#about" class="nav-link" data-section="about">👤 About</a></li>
            <li><a href="#services" class="nav-link" data-section="services">🔬 Services</a></li>
            <li><a href="#portfolio" class="nav-link" data-section="portfolio">📁 Portfolio</a></li>
            <li><a href="#contact" class="nav-link" data-section="contact">📞 Contact</a></li>
            <li><a href="#chat" class="nav-link" data-section="chat">💬 Chat</a></li>
          </ul>
        </div>
      </div>
      <div class="site-content">
        <slot></slot>
      </div>
    `;

    this.setupNavigation();
  }

  setupNavigation() {
    const navLinks = this.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Remove active class from all links
        navLinks.forEach(l => l.classList.remove('active'));
        
        // Add active class to clicked link
        link.classList.add('active');
        
        // Dispatch custom event for SPA navigation
        const section = link.dataset.section;
        this.dispatchEvent(new CustomEvent('nav-section-change', {
          detail: { section },
          bubbles: true
        }));
      });
    });
  }
}

customElements.define('left-nav', LeftNav);