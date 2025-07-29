class MainComponent extends HTMLElement {
  constructor() {
    super();
    this.render();
  }

  render() {
    this.innerHTML = `
      <main class="main-content">
        <section class="content-section">
          <div class="hero-section">
            <h2 class="hero-title">Welcome to Our Practice</h2>
            <p class="hero-description">
              Providing comprehensive eye care services with the latest technology and personalized attention. 
              Your vision is our priority.
            </p>
            <a href="#contact" class="cta-link">
              <button class="cta-button">Schedule Appointment</button>
            </a>
          </div>
        </section>

        <section class="content-section">
          <h2 class="section-title">Our Services</h2>
          <div class="content-grid">
            <div class="content-card">
              <span class="card-icon">👁️</span>
              <h3 class="card-title">Comprehensive Eye Exams</h3>
              <p class="card-description">
                Complete eye health evaluations using the latest diagnostic technology.
              </p>
            </div>
            <div class="content-card">
              <span class="card-icon">🥽</span>
              <h3 class="card-title">Contact Lens Fittings</h3>
              <p class="card-description">
                Expert consultation and fitting for all types of contact lenses.
              </p>
            </div>
            <div class="content-card">
              <span class="card-icon">👓</span>
              <h3 class="card-title">Prescription Glasses</h3>
              <p class="card-description">
                Wide selection of frames and the latest lens technology.
              </p>
            </div>
          </div>
        </section>
      </main>
    `;
  }

  setContent(html) {
    const container = this.querySelector('.main-content');
    if (container) {
      container.innerHTML = html;
    } else {
      // Fallback: set content on the component itself
      this.innerHTML = `<main class="main-content">${html}</main>`;
    }
  }

  // Alternative method name in case of conflicts
  updateContent(html) {
    this.setContent(html);
  }
}

customElements.define('main-component', MainComponent);