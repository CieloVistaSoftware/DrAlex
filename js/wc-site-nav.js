class SiteNav extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.innerHTML = `
      <style>
        nav {
          position: sticky;
          top: 0;
          background: var(--bg-secondary, #fff);
          z-index: 100;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }
        .site-nav {
          display: flex;
          align-items: center;
          padding: 0.5rem 1rem;
        }
        .mobile-menu-toggle {
          display: none;
          background: none;
          border: none;
          font-size: 2rem;
          margin-right: 1rem;
          cursor: pointer;
        }
        .nav-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          list-style: none;
          margin: 0;
          padding: 0;
        }
        .nav-link {
          color: var(--primary, #6366f1);
          text-decoration: none;
          font-weight: 500;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          transition: background 0.2s;
        }
        .nav-link:hover, .nav-link.active {
          background: var(--primary, #6366f1);
          color: #fff;
        }
        @media (max-width: 767px) {
          .nav-list {
            flex-direction: column;
            background: var(--bg-secondary, #fff);
            position: absolute;
            top: 3.5rem;
            left: 0;
            right: 0;
            display: none;
            box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          }
          .nav-list.open {
            display: flex;
          }
          .mobile-menu-toggle {
            display: block;
          }
        }
      </style>
      <nav class="site-nav">
        <button class="mobile-menu-toggle" aria-label="Toggle navigation">☰ Menu</button>
        <ul class="nav-list">
          <li><a href="#" class="nav-link" data-section="home">Home</a></li>
          <li><a href="#" class="nav-link" data-section="about">About</a></li>
          <li><a href="#" class="nav-link" data-section="services">Services</a></li>
          <li><a href="#" class="nav-link" data-section="portfolio">Portfolio</a></li>
          <li><a href="#" class="nav-link" data-section="contact">Contact</a></li>
          <li><a href="#" class="nav-link" data-section="chat">Chat</a></li>
        </ul>
      </nav>
    `;
    this._setupMenuToggle();
    this._setupNavLinks();
    this._highlightActiveLink();
  }

  _setupMenuToggle() {
    const shadow = this.shadowRoot;
    const toggleBtn = shadow.querySelector('.mobile-menu-toggle');
    const navList = shadow.querySelector('.nav-list');
    toggleBtn.addEventListener('click', () => {
      navList.classList.toggle('open');
    });
  }

  _setupNavLinks() {
    const shadow = this.shadowRoot;
    const links = shadow.querySelectorAll('.nav-link');
    links.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const section = link.getAttribute('data-section');
        if (section) {
          this.dispatchEvent(new CustomEvent('nav-section-change', {
            detail: { section },
            bubbles: true,
            composed: true
          }));
        }
      });
    });
  }

  _highlightActiveLink() {
    const shadow = this.shadowRoot;
    const links = shadow.querySelectorAll('.nav-link');
    const current = window.location.pathname.split('/').pop();
    links.forEach(link => {
      if (link.getAttribute('href') === current) {
        link.classList.add('active');
      }
    });
  }
}

customElements.define('site-nav', SiteNav);
