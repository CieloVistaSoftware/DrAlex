
// Tab Web Component: <tab-control>
// See tab-component-spec.md for full specification

const template = document.createElement('template');
template.innerHTML = `
  <style>@import url('tab-control.css');</style>
  <nav class="tab-nav" aria-label="Main Tabs">
    <div class="tab-list" role="tablist"></div>
  </nav>
  <div class="tab-panels"></div>
`;

class TabControl extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(template.content.cloneNode(true));
    this._config = null;
    this._tabs = [];
    this._panels = [];
    this._activeTabId = null;
    this._tabList = this.shadowRoot.querySelector('.tab-list');
    this._tabPanels = this.shadowRoot.querySelector('.tab-panels');
    this._contentCache = new Map();
  }

  static get observedAttributes() {
    return ['config', 'src', 'default-tab'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'config' && newValue) {
      this.config = JSON.parse(newValue);
    } else if (name === 'src' && newValue) {
      this._fetchConfig(newValue);
    } else if (name === 'default-tab' && this._config) {
      this.activateTab(newValue);
    }
  }

  set config(val) {
    this._config = val;
    this._renderFromConfig();
  }
  get config() {
    return this._config;
  }

  async _fetchConfig(url) {
    try {
      const resp = await fetch(url);
      const json = await resp.json();
      this.config = json;
    } catch (e) {
      this.dispatchEvent(new CustomEvent('tab-error', { detail: { error: e } }));
    }
  }

  connectedCallback() {
    // Inline <script type="application/json"> config
    if (!this._config) {
      const script = this.querySelector('script[type="application/json"]');
      if (script) {
        try {
          this.config = JSON.parse(script.textContent);
        } catch (e) {
          this.dispatchEvent(new CustomEvent('tab-error', { detail: { error: e } }));
        }
      }
    }
    // Static HTML fallback (not implemented)
  }

  _renderFromConfig() {
    if (!this._config || !this._config.tabs) return;
    this._tabList.innerHTML = '';
    this._tabPanels.innerHTML = '';
    this._tabs = [];
    this._panels = [];
    const acc = this._config.accessibility || {};
    if (acc.tablistLabel) this._tabList.setAttribute('aria-label', acc.tablistLabel);
    if (acc.navLabel) this.shadowRoot.querySelector('.tab-nav').setAttribute('aria-label', acc.navLabel);
    const defaultTab = this.getAttribute('default-tab') || this._config.defaultTab || this._config.tabs[0].id;
    this._config.tabs.forEach(tab => {
      const btn = document.createElement('button');
      btn.className = 'tab';
      btn.setAttribute('role', 'tab');
      btn.setAttribute('id', tab.id);
      btn.setAttribute('aria-controls', tab.panel);
      btn.setAttribute('tabindex', '-1');
      btn.setAttribute('type', 'button');
      if (tab.icon) {
        const icon = document.createElement('span');
        icon.className = 'tab-icon';
        icon.innerHTML = tab.icon; // SVG or icon HTML
        btn.appendChild(icon);
      }
      btn.appendChild(document.createTextNode(tab.label));
      if (tab.disabled) btn.setAttribute('disabled', '');
      btn.addEventListener('click', () => this.activateTab(tab.id));
      this._tabList.appendChild(btn);
      this._tabs.push(btn);

      const panel = document.createElement('div');
      panel.className = 'tab-panel';
      panel.setAttribute('role', 'tabpanel');
      panel.setAttribute('id', tab.panel);
      panel.setAttribute('aria-labelledby', tab.id);
      panel.hidden = true;
      this._tabPanels.appendChild(panel);
      this._panels.push(panel);
    });
    this.activateTab(defaultTab);
    this._setupKeyboard();
  }

  activateTab(tabId) {
    const idx = this._config.tabs.findIndex(t => t.id === tabId);
    if (idx === -1) return;
    this._tabs.forEach((tab, i) => {
      const active = i === idx;
      tab.setAttribute('aria-selected', active);
      tab.setAttribute('tabindex', active ? '0' : '-1');
      this._panels[i].hidden = !active;
      if (active) {
        this._activeTabId = tabId;
        this._loadTabContent(this._config.tabs[i], this._panels[i]);
        this.dispatchEvent(new CustomEvent('tab-activated', { detail: { tabId, panel: this._panels[i].id } }));
      }
    });
  }

  async _loadTabContent(tab, panel) {
    // Content caching and lazy loading
    const loading = (this._config.loading || {});
    if (tab.content) {
      if (loading.cache && this._contentCache.has(tab.id)) {
        panel.innerHTML = this._contentCache.get(tab.id);
        return;
      }
      panel.innerHTML = '<div class="tab-panel--loading">Loading...</div>';
      try {
        let html = await fetch(tab.content).then(r => r.text());
        // TODO: Sanitize html with DOMPurify or similar
        panel.innerHTML = html;
        if (loading.cache) this._contentCache.set(tab.id, html);
        this.dispatchEvent(new CustomEvent('tab-content-loaded', { detail: { tabId: tab.id, success: true } }));
      } catch (e) {
        panel.innerHTML = `<div class="tab-panel--error">Failed to load content</div>`;
        this.dispatchEvent(new CustomEvent('tab-content-loaded', { detail: { tabId: tab.id, success: false } }));
      }
    }
    if (tab.css) {
      let style = this.shadowRoot.getElementById('tab-css');
      if (style) style.remove();
      style = document.createElement('link');
      style.rel = 'stylesheet';
      style.href = tab.css;
      style.id = 'tab-css';
      this.shadowRoot.appendChild(style);
    }
  }

  _setupKeyboard() {
    this._tabList.addEventListener('keydown', e => {
      const current = this.shadowRoot.activeElement || document.activeElement;
      let idx = this._tabs.indexOf(current);
      if (idx === -1) return;
      if (e.key === 'ArrowRight') idx = (idx + 1) % this._tabs.length;
      else if (e.key === 'ArrowLeft') idx = (idx - 1 + this._tabs.length) % this._tabs.length;
      else if (e.key === 'Home') idx = 0;
      else if (e.key === 'End') idx = this._tabs.length - 1;
      else if (e.key === 'Enter' || e.key === ' ') {
        this._tabs[idx].click();
        e.preventDefault();
        return;
      } else return;
      this._tabs[idx].focus();
      e.preventDefault();
    });
  }

  addTab(tab) {
    this._config.tabs.push(tab);
    this._renderFromConfig();
  }

  removeTab(tabId) {
    this._config.tabs = this._config.tabs.filter(t => t.id !== tabId);
    this._renderFromConfig();
  }

  getActiveTab() {
    return this._activeTabId;
  }
}

customElements.define('tab-control', TabControl);
