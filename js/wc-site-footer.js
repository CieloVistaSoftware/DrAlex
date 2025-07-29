class SiteFooter extends HTMLElement {
  constructor() {
    super();
    
    this.innerHTML = `
      <footer class="site-footer">
        <div class="footer-content">
          <p class="footer-text">&copy; 2025 Dr. Alex Kisitu. All rights reserved.</p>
          <ul class="footer-links">
            <li><a href="#privacy" class="footer-link">Privacy Policy</a></li>
            <li><a href="#terms" class="footer-link">Terms of Service</a></li>
            <li><a href="#contact" class="footer-link">Contact</a></li>
          </ul>
        </div>
      </footer>
    `;
  }
}

customElements.define('site-footer', SiteFooter);