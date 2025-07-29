import { ChatWidget } from './chat-widget.js';
// Claude-Chat Web Component
class ClaudeChat extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.widget = null;
  }

  connectedCallback() {
    // Only create the widget once
    if (!this.widget) {
      try {
        this.widget = document.createElement('div');
        this.widget.style.display = 'block';
        this.shadowRoot.appendChild(this.widget);
  new ChatWidget({ mount: this.widget });
      } catch (err) {
        console.error('Error mounting ChatWidget in <claude-chat>:', err);
        this.shadowRoot.innerHTML = '<div style="color:red">Chat widget failed to load.</div>';
      }
    }
  }
}

customElements.define('claude-chat', ClaudeChat);
