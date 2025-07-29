// TraceElement web component (default dark mode, full implementation)
class TraceElement extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._logs = [];
    this._filterLevel = 'all';
    this._filterText = '';
    this._init();
  }

  async _init() {
    // Load HTML
    const html = await fetch('js/TraceElement/trace-element.html').then(r => r.text());
    this.shadowRoot.innerHTML = html;
    // Load CSS
    const css = await fetch('js/TraceElement/trace-element.css').then(r => r.text());
    const style = document.createElement('style');
    style.textContent = css;
    this.shadowRoot.appendChild(style);
    // Set dark mode by default
    this.classList.add('dark-mode');
    // Cache elements
    this.logContainer = this.shadowRoot.querySelector('.trace-log');
    this.copyBtn = this.shadowRoot.querySelector('.trace-copy');
    this.clearBtn = this.shadowRoot.querySelector('.trace-clear');
    this.exportBtn = this.shadowRoot.querySelector('.trace-export');
    this.toggleBtn = this.shadowRoot.querySelector('.trace-toggle');
    this.filterInput = this.shadowRoot.querySelector('.trace-search');
    this.levelFilter = this.shadowRoot.querySelector('.trace-level-filter');
    // Event listeners
    this.copyBtn.addEventListener('click', () => this.copy());
    this.clearBtn.addEventListener('click', () => this.clear());
    this.exportBtn.addEventListener('click', () => this.export('json'));
    this.toggleBtn.addEventListener('click', () => this.toggleCollapse());
    this.filterInput.addEventListener('input', e => {
      this._filterText = e.target.value;
      this.render();
    });
    this.levelFilter.addEventListener('change', e => {
      this._filterLevel = e.target.value;
      this.render();
    });
    // Keyboard accessibility
    this.copyBtn.setAttribute('tabindex', '0');
    this.clearBtn.setAttribute('tabindex', '0');
    this.exportBtn.setAttribute('tabindex', '0');
    this.toggleBtn.setAttribute('tabindex', '0');
    // Initial render
    this.render();
  }

  addEntry({ level = 'info', direction = '', message = '', data = null, timestamp = new Date() }) {
    // For 'ui' direction, show full data object
    let displayMsg = message;
    if (direction === 'ui' && data) {
      displayMsg += ' ' + JSON.stringify(data);
    }
    const entry = {
      level,
      direction,
      message: displayMsg,
      timestamp: timestamp instanceof Date ? timestamp : new Date(timestamp)
    };
    // Prepend to logs (most recent at top)
    this._logs.unshift(entry);
    this.render();
  }

  clear() {
    this._logs = [];
    this.render();
  }

  copy() {
    const text = this._logs.map(e => this._formatEntryText(e)).join('\n');
    navigator.clipboard.writeText(text);
  }

  export(format = 'json') {
    let content = '';
    if (format === 'json') {
      content = JSON.stringify(this._logs, null, 2);
    } else {
      content = this._logs.map(e => this._formatEntryText(e)).join('\n');
    }
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trace-log-${Date.now()}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  toggleCollapse() {
    this.classList.toggle('collapsed');
    this.logContainer.style.display = this.classList.contains('collapsed') ? 'none' : '';
  }

  _formatEntryText(e) {
    const time = e.timestamp.toLocaleTimeString();
    let arrow = '';
    switch (e.direction) {
      case 'outgoing': arrow = '→'; break;
      case 'incoming': arrow = '←'; break;
      case 'user': arrow = '↓'; break;
      case 'ui': arrow = '↑'; break;
      default: arrow = '';
    }
    let dirLabel = '';
    if (e.direction === 'outgoing') dirLabel = 'TO CLAUDE:';
    else if (e.direction === 'incoming') dirLabel = 'FROM CLAUDE:';
    else if (e.direction === 'user') dirLabel = 'USER:';
    else if (e.direction === 'ui') dirLabel = 'TO UI:';
    return `[${time}] ${arrow} ${dirLabel} ${e.message}`;
  }

  render() {
    if (!this.logContainer) return;
    // Filter logs
    let logs = this._logs;
    if (this._filterLevel !== 'all') {
      logs = logs.filter(e => e.level === this._filterLevel);
    }
    if (this._filterText) {
      logs = logs.filter(e =>
        e.message.toLowerCase().includes(this._filterText.toLowerCase())
      );
    }
    // Render entries (most recent at top)
    this.logContainer.innerHTML = '';
    for (const e of logs) {
      const div = document.createElement('div');
      div.className = `trace-entry ${e.level} ${e.direction}`;
      div.textContent = this._formatEntryText(e);
      this.logContainer.appendChild(div);
    }
  }
}
customElements.define('trace-element', TraceElement);
