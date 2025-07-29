class SiteHeader extends HTMLElement {
  static get observedAttributes() {
    return ['title', 'subtitle'];
  }
  
  constructor() {
    super();
    this.render();
  }
  
  attributeChangedCallback() {
    this.render();
  }
  
  render() {
    const title = this.getAttribute('title') || 'Dr. Alex Kisitu';
    const subtitle = this.getAttribute('subtitle') || 'Personal Eye Care just for you!';
    
    this.innerHTML = `
      <header class="site-header">
        <h1 class="site-title">${title}</h1>
        <p class="site-subtitle">${subtitle}</p>
      </header>
    `;
  }
}

customElements.define('site-header', SiteHeader);