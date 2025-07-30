// Only define if not already defined
if (!customElements.get('claude-chat')) {
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
          // Load the chat widget script if not already loaded
          this.loadChatWidget().then(() => {
            this.widget = document.createElement('div');
            this.widget.style.display = 'block';
            this.widget.style.width = '100%';
            this.widget.style.height = '600px';
            this.shadowRoot.appendChild(this.widget);
            
            // Initialize ChatWidget with mount option
            if (window.ChatWidget) {
              new window.ChatWidget({ mount: this.widget });
            } else {
              throw new Error('ChatWidget class not available');
            }
          }).catch(err => {
            console.error('Error loading ChatWidget:', err);
            this.shadowRoot.innerHTML = '<div style="color:red; padding: 20px;">Chat widget failed to load. Please check if chat-widget.js is available.</div>';
          });
        } catch (err) {
          console.error('Error mounting ChatWidget in <claude-chat>:', err);
          this.shadowRoot.innerHTML = '<div style="color:red; padding: 20px;">Chat widget failed to load.</div>';
        }
      }
    }

    async loadChatWidget() {
      // Check if ChatWidget is already available
      if (window.ChatWidget) {
        return Promise.resolve();
      }

      // Load the chat-widget.js script
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'js/chat-widget.js';
        script.onload = () => {
          // Give a moment for the script to execute
          setTimeout(() => {
            if (window.ChatWidget) {
              resolve();
            } else {
              reject(new Error('ChatWidget class not found after loading script'));
            }
          }, 100);
        };
        script.onerror = () => reject(new Error('Failed to load chat-widget.js'));
        document.head.appendChild(script);
      });
    }
  }

  customElements.define('claude-chat', ClaudeChat);
}