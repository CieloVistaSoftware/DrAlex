// Modernized Chat Widget - ES6+ with improved error handling and performance
if (!window.ChatWidget) {
  class ChatWidget {
    constructor(options = {}) {
      // Use modern destructuring and defaults
      const {
        apiPort = '3000',
        apiUrl = `${window.location.protocol}//${window.location.hostname}:${apiPort}/api/chat`,
        mount = null,
        debugMode = localStorage.getItem('chatDebugMode') === 'true'
      } = options;

      this.apiUrl = apiUrl;
      this.conversationId = null;
      this.sessionHistory = [];
      this.isLoading = false;
      this.isDebugMode = debugMode;
      
      this.maxRetries = 3;
      this.retryCount = 0;
      this.retryDelay = 1000;
      
      this.connectionStatus = 'unknown';
      this.lastHealthCheck = null;
      this.healthCheckInterval = null;

      this.debug = this.createDebugSystem();
      this.performanceMetrics = {
        messagesSent: 0,
        messagesReceived: 0,
        averageResponseTime: 0,
        errors: 0,
        retries: 0
      };

      // Initialize widget
      this.init(mount);
    }

    createDebugSystem() {
      return {
        log: (message, type = 'info', data = null) => {
          if (!this.isDebugMode) return;
          const timestamp = new Date().toLocaleTimeString();
          console.log(`[${timestamp}] ${type.toUpperCase()}: ${message}`, data || '');
        }
      };
    }

    // Modern input validation with better error messages
    validateMessage(message) {
      if (!message?.trim()) {
        return { valid: false, error: 'Message cannot be empty' };
      }
      
      if (typeof message !== 'string') {
        return { valid: false, error: 'Message must be text' };
      }
      
      if (message.length > 500) {
        return { valid: false, error: 'Message too long (max 500 characters)' };
      }
      
      // Enhanced security check
      const dangerousPatterns = [
        /<script/i,
        /javascript:/i,
        /on\w+\s*=/i,
        /data:text\/html/i
      ];
      
      if (dangerousPatterns.some(pattern => pattern.test(message))) {
        return { valid: false, error: 'Invalid characters detected' };
      }
      
      return { valid: true };
    }

    // Modern HTML sanitization
    sanitizeHTML(str) {
      const div = document.createElement('div');
      div.textContent = str;
      return div.innerHTML;
    }
    
    async init(mountElement) {
      try {
        this.debug.log('Initializing modern chat widget', 'info');
        
        this.container = this.createContainer();
        
        // Mount to provided element or body
        const target = mountElement || document.body;
        target.appendChild(this.container);

        this.addModernStyles();
        this.cacheElements();
        this.setupEventListeners();
        this.setupConnectionMonitoring();
        this.addWelcomeMessage();

        this.debug.log('Chat widget initialized successfully', 'success');
        
      } catch (error) {
        this.debug.log('Failed to initialize chat widget', 'error', error);
        this.showError('Failed to initialize chat widget');
      }
    }

    createContainer() {
      const container = document.createElement('div');
      container.className = 'modern-chat-widget';
      container.innerHTML = this.getHTMLTemplate();
      return container;
    }

    getHTMLTemplate() {
      return `
        <header class="chat-header-section">
          <h2 class="section-title">Chat With Us</h2>
          <div class="chat-status-bar">
            <span class="status-indicator connecting" id="connection-status" aria-label="Connection status"></span>
            <span class="status-text">Connecting...</span>
          </div>
        </header>
        
        <main class="chat-main-section">
          <div class="chat-messages" id="chat-messages" role="log" aria-live="polite" aria-label="Chat messages"></div>
        </main>
        
        <footer class="chat-footer-section">
          <div class="chat-input-wrapper">
            <textarea 
              class="chat-input" 
              placeholder="Ask me about eye care..." 
              rows="2" 
              maxlength="500" 
              aria-label="Type your message"
              spellcheck="true"
              autocomplete="off">
            </textarea>
            <button class="chat-send" disabled aria-label="Send message">
              <span class="send-text">Send</span>
            </button>
          </div>
          <div class="chat-input-footer">
            <span class="chat-counter" aria-live="polite">0/500</span>
            <div class="quick-actions" role="group" aria-label="Quick actions">
              <button class="quick-action" data-message="What services do you offer?" aria-label="Ask about services">Services</button>
              <button class="quick-action" data-message="How can I book an appointment?" aria-label="Ask about booking">Book</button>
              <button class="quick-action" data-message="What are your hours?" aria-label="Ask about hours">Hours</button>
            </div>
          </div>
        </footer>
      `;
    }

    cacheElements() {
      // Modern element caching with error handling
      const elements = {
        messagesContainer: '#chat-messages',
        inputField: '.chat-input',
        sendButton: '.chat-send',
        charCounter: '.chat-counter',
        connectionStatus: '#connection-status',
        statusText: '.status-text',
        quickActions: '.quick-action'
      };

      Object.entries(elements).forEach(([key, selector]) => {
        if (selector.startsWith('.') && key === 'quickActions') {
          this[key] = this.container.querySelectorAll(selector);
        } else {
          this[key] = this.container.querySelector(selector);
          if (!this[key]) {
            console.warn(`Element not found: ${selector}`);
          }
        }
      });
    }

    setupEventListeners() {
      // Debounced input handler
      let inputTimeout;
      this.inputField?.addEventListener('input', () => {
        clearTimeout(inputTimeout);
        inputTimeout = setTimeout(() => this.handleInput(), 100);
      });
      
      // Keyboard shortcuts
      this.inputField?.addEventListener('keydown', (e) => this.handleKeyDown(e));
      this.sendButton?.addEventListener('click', () => this.sendMessage());
      
      // Quick actions with modern event delegation
      this.quickActions?.forEach(action => {
        action.addEventListener('click', () => {
          const message = action.dataset.message;
          if (message) {
            this.inputField.value = message;
            this.handleInput();
            this.sendMessage();
          }
        });
      });

      // Auto-resize textarea
      this.inputField?.addEventListener('input', () => {
        this.inputField.style.height = 'auto';
        this.inputField.style.height = `${Math.min(this.inputField.scrollHeight, 120)}px`;
      });

      // Focus management for better UX
      this.container.addEventListener('click', (e) => {
        if (!e.target.closest('button') && !e.target.closest('a') && 
            window.getSelection().toString() === '') {
          this.inputField?.focus();
        }
      });
    }

    handleInput() {
      const messageLength = this.inputField.value.trim().length;
      this.sendButton.disabled = messageLength === 0 || this.isLoading;
      this.charCounter.textContent = `${messageLength}/500`;
      this.charCounter.classList.toggle('near-limit', messageLength > 450);
    }

    handleKeyDown(e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (!this.sendButton.disabled) {
          this.sendMessage();
        }
      }
    }

    setupConnectionMonitoring() {
      this.testConnection();
      this.healthCheckInterval = setInterval(() => {
        if (!this.isLoading) {
          this.testConnection(true);
        }
      }, 30000);
    }

    async testConnection(silent = false) {
      try {
        if (!silent) {
          this.debug.log('Testing connection...', 'network');
        }
        
        const startTime = performance.now();
        const healthUrl = this.apiUrl.replace('/chat', '/health');
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const response = await fetch(healthUrl, {
          method: 'GET',
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        const responseTime = performance.now() - startTime;
        
        if (response.ok) {
          const data = await response.json();
          this.updateConnectionStatus('online', 'Online - Ready to help');
          this.lastHealthCheck = new Date();
          
          if (!silent) {
            this.debug.log(`Connection test successful (${responseTime.toFixed(0)}ms)`, 'success', data);
          }
          return { success: true, responseTime, data };
        } else {
          throw new Error(`Health check failed: ${response.status}`);
        }
      } catch (error) {
        this.updateConnectionStatus('offline', 'Offline - Connection issues');
        if (!silent) {
          this.debug.log('Connection test failed', 'error', error);
        }
        return { success: false, error: error.message };
      }
    }

    updateConnectionStatus(status, text) {
      this.connectionStatus.className = `status-indicator ${status}`;
      this.statusText.textContent = text;
      this.connectionStatus = status;
    }

    addWelcomeMessage() {
      this.addMessage({
        role: 'assistant',
        content: 'Hello! I\'m your AI assistant for eye care questions. Feel free to ask me anything or use the quick action buttons below!'
      });
    }

    async sendMessage() {
      const message = this.inputField.value.trim();
      if (!message || this.isLoading) return;

      const validation = this.validateMessage(message);
      if (!validation.valid) {
        this.showError(validation.error);
        return;
      }

      this.debug.log(`User message: ${message}`, 'input');
      const startTime = performance.now();
      
      // Clear input immediately for better UX
      this.inputField.value = '';
      this.sendButton.disabled = true;
      this.charCounter.textContent = '0/500';
      this.inputField.style.height = 'auto';
      this.charCounter.classList.remove('near-limit');

      try {
        this.addMessage({ role: 'user', content: message });
        this.setLoading(true);
        this.addLoadingIndicator();

        this.sessionHistory.push({ role: 'user', content: message });

        const requestBody = {
          message: this.sanitizeHTML(message),
          conversationId: this.conversationId,
          sessionHistory: this.sessionHistory
        };
        
        this.debug.log('Sending request to API', 'network', requestBody);

        const response = await this.fetchWithRetry(this.apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`API error: ${response.status} ${response.statusText} - ${errorText}`);
        }

        const data = await response.json();
        const responseTime = performance.now() - startTime;
        
        this.debug.log(`Response received (${responseTime.toFixed(0)}ms)`, 'output', data);

        if (!data.response) {
          throw new Error('Invalid response: Missing response field');
        }

        this.conversationId = data.conversationId;
        this.removeLoadingIndicator();
        
        const assistantMessage = { role: 'assistant', content: data.response };
        this.addMessage(assistantMessage);
        this.sessionHistory.push(assistantMessage);

        // Update metrics
        this.performanceMetrics.messagesSent++;
        this.performanceMetrics.messagesReceived++;
        this.performanceMetrics.averageResponseTime = 
          (this.performanceMetrics.averageResponseTime + responseTime) / 2;

        this.retryCount = 0;
        this.retryDelay = 1000;

      } catch (error) {
        this.debug.log('Error sending message', 'error', error);
        this.performanceMetrics.errors++;
        this.handleError(error);
      } finally {
        this.setLoading(false);
        this.inputField.disabled = false;
        this.inputField.focus();
      }
    }

    async fetchWithRetry(url, options, maxRetries = this.maxRetries) {
      for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 30000);
          
          const response = await fetch(url, {
            ...options,
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);
          return response;
          
        } catch (error) {
          this.debug.log(`Fetch attempt ${attempt + 1}/${maxRetries} failed`, 'warning', error);
          
          if (attempt === maxRetries - 1) {
            throw error;
          }
          
          const delay = this.retryDelay * Math.pow(2, attempt) + Math.random() * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
          this.performanceMetrics.retries++;
        }
      }
    }

    handleError(error) {
      this.removeLoadingIndicator();
      this.retryCount++;
      
      let errorMessage = 'An unexpected error occurred.';
      let canRetry = false;
      
      if (error.message.includes('timeout') || error.name === 'AbortError') {
        errorMessage = '⏱️ Request Timeout';
        canRetry = true;
      } else if (error.message.includes('Failed to fetch') || error.message.includes('Network error')) {
        errorMessage = '🌐 Connection Failed';
        canRetry = true;
      } else if (error.message.includes('500')) {
        errorMessage = '🚨 Server Error';
        canRetry = true;
      } else if (error.message.includes('429')) {
        errorMessage = '🚫 Rate Limited';
        canRetry = true;
      }
      
      this.addMessage({
        role: 'system',
        content: errorMessage
      });
      
      if (canRetry && this.retryCount <= this.maxRetries) {
        this.addRetryButton();
      }
    }

    addRetryButton() {
      const retryEl = document.createElement('div');
      retryEl.className = 'chat-message system-message retry-message';
      retryEl.innerHTML = `
        <div class="message-content system-content">
          <div class="retry-actions">
            <button class="retry-button">🔄 Retry Last Message</button>
            <button class="test-connection-button">🔗 Test Connection</button>
          </div>
          <div class="retry-info">Attempt ${this.retryCount}/${this.maxRetries}</div>
        </div>
      `;
      
      this.messagesContainer.insertBefore(retryEl, this.messagesContainer.firstChild);
      
      const retryButton = retryEl.querySelector('.retry-button');
      const testButton = retryEl.querySelector('.test-connection-button');
      
      retryButton.addEventListener('click', () => {
        retryEl.remove();
        for (let i = this.sessionHistory.length - 1; i >= 0; i--) {
          if (this.sessionHistory[i].role === 'user') {
            this.inputField.value = this.sessionHistory[i].content;
            this.handleInput();
            setTimeout(() => this.sendMessage(), this.retryDelay);
            this.retryDelay = Math.min(this.retryDelay * 2, 10000);
            break;
          }
        }
      });
      
      testButton.addEventListener('click', async () => {
        retryEl.remove();
        const result = await this.testConnection();
        if (result.success) {
          this.showNotification('Connection restored!', 'success');
        } else {
          this.showNotification('Connection still failing', 'error');
        }
      });
    }

    setLoading(loading) {
      this.isLoading = loading;
      this.sendButton.disabled = loading || this.inputField.value.trim().length === 0;
      this.inputField.disabled = false;
      
      this.inputField.placeholder = loading ? '' : 'Ask me about eye care...';
      
      this.quickActions?.forEach(action => action.disabled = loading);
      
      const sendText = this.sendButton.querySelector('.send-text');
      if (sendText) {
        sendText.textContent = loading ? 'Sending...' : 'Send';
      }
    }

    addLoadingIndicator() {
      this.removeLoadingIndicator();
      const loadingEl = document.createElement('div');
      loadingEl.className = 'chat-message assistant-message loading-indicator';
      loadingEl.innerHTML = `
        <div class="message-content">
          <div class="loading-dots">
            <span></span><span></span><span></span>
          </div>
          <div class="loading-text">Thinking...</div>
        </div>
      `;
      this.messagesContainer.insertBefore(loadingEl, this.messagesContainer.firstChild);
    }

    removeLoadingIndicator() {
      const loadingEl = this.messagesContainer.querySelector('.loading-indicator');
      loadingEl?.remove();
    }

    addMessage({ role, content }) {
      this.debug.log(`Adding ${role} message to UI`, 'ui');
      
      const messageEl = document.createElement('div');
      messageEl.className = `chat-message ${role}-message`;
      messageEl.setAttribute('role', role === 'system' ? 'status' : 'log');
      
      const formattedContent = this.formatMessage(content);
      messageEl.innerHTML = `<div class="message-content">${formattedContent}</div>`;
      
      this.messagesContainer.insertBefore(messageEl, this.messagesContainer.firstChild);
      
      // Smooth animation
      messageEl.style.opacity = '0';
      messageEl.style.transform = 'translateY(-20px)';
      
      requestAnimationFrame(() => {
        messageEl.style.transition = 'all 0.3s ease';
        messageEl.style.opacity = '1';
        messageEl.style.transform = 'translateY(0)';
      });
    }

    formatMessage(content) {
      const formatted = this.sanitizeHTML(content);
      return formatted
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
        .replace(/`(.*?)`/g, '<code>$1</code>')
        .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>')
        .replace(/\n/g, '<br>');
    }

    showNotification(message, type = 'info') {
      const notification = document.createElement('div');
      notification.textContent = message;
      
      const colors = {
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b',
        info: '#3b82f6'
      };
      
      notification.style.cssText = `
        position: fixed; 
        top: 20px; 
        right: 20px; 
        padding: 0.75rem 1rem; 
        border-radius: 8px; 
        color: white; 
        z-index: 10000; 
        background: ${colors[type]}; 
        animation: slideIn 0.3s ease;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      `;
      
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 3000);
    }

    showError(message) {
      this.showNotification(message, 'error');
      this.debug.log(message, 'error');
    }

    destroy() {
      if (this.healthCheckInterval) {
        clearInterval(this.healthCheckInterval);
      }
      this.container?.remove();
    }

    addModernStyles() {
      if (document.getElementById('modern-chat-styles')) return;

      const style = document.createElement('style');
      style.id = 'modern-chat-styles';
      style.textContent = this.getModernCSS();
      document.head.appendChild(style);
    }

    getModernCSS() {
      return `
        .modern-chat-widget {
          width: 100%;
          height: 600px;
          background: var(--bg-secondary, #333333);
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          border: 1px solid var(--border-color, #555555);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        }

        .chat-header-section {
          background: var(--bg-primary, #222222);
          padding: 1.5rem 2rem 0.5rem 2rem;
          border-bottom: 1px solid var(--border-color, #555555);
        }

        .chat-header-section .section-title {
          font-size: 2rem;
          margin-bottom: 1rem;
          color: var(--primary, #6366f1) !important;
          padding-bottom: 0;
          border-bottom: none;
        }

        .chat-status-bar {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
          color: var(--text-secondary, #cccccc);
          margin-bottom: 1rem;
        }

        .status-indicator {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #6b7280;
          transition: all 0.3s ease;
          box-shadow: 0 0 4px rgba(0, 0, 0, 0.3);
        }

        .status-indicator.online {
          background: #10b981;
          box-shadow: 0 0 8px rgba(16, 185, 129, 0.4);
        }

        .status-indicator.offline {
          background: #ef4444;
          box-shadow: 0 0 8px rgba(239, 68, 68, 0.4);
        }

        .status-indicator.connecting {
          background: #f59e0b;
          box-shadow: 0 0 8px rgba(245, 158, 11, 0.4);
          animation: pulse 2s infinite;
        }

        .chat-main-section {
          flex: 1;
          overflow: hidden;
          background: var(--bg-primary, #222222);
        }

        .chat-messages {
          height: 100%;
          padding: 1.5rem;
          overflow-y: auto;
          overflow-x: hidden;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .chat-message {
          animation: fadeInMessage 0.3s ease;
          max-width: 85%;
        }

        .user-message {
          align-self: flex-end;
        }

        .assistant-message {
          align-self: flex-start;
        }

        .system-message {
          align-self: center;
          max-width: 90%;
        }

        .message-content {
          padding: 0.75rem 1rem;
          border-radius: 12px;
          line-height: 1.5;
          word-wrap: break-word;
          background: var(--bg-secondary, #333333);
          border: 1px solid var(--border-color, #555555);
          color: var(--text-primary, #ffffff);
        }

        .user-message .message-content {
          background: var(--primary, #6366f1);
          color: white;
          border-color: var(--primary, #6366f1);
        }

        .system-content {
          background: rgba(255, 193, 7, 0.1);
          border: 1px solid rgba(255, 193, 7, 0.3);
          color: var(--text-secondary, #cccccc);
          font-style: italic;
          text-align: center;
        }

        .loading-dots {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 4px;
          margin-bottom: 0.5rem;
        }

        .loading-dots span {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--primary, #6366f1);
          animation: dotPulse 1.4s infinite ease-in-out;
        }

        .loading-dots span:nth-child(2) { animation-delay: 0.2s; }
        .loading-dots span:nth-child(3) { animation-delay: 0.4s; }

        .loading-text {
          text-align: center;
          font-size: 0.85rem;
          color: var(--text-secondary, #cccccc);
        }

        .chat-footer-section {
          background: var(--bg-secondary, #333333);
          border-top: 1px solid var(--border-color, #555555);
          padding: 1rem 1.5rem;
        }

        .chat-input-wrapper {
          display: flex;
          gap: 0.75rem;
          margin-bottom: 0.75rem;
        }

        .chat-input {
          flex: 1;
          padding: 0.75rem;
          border: 1px solid var(--border-color, #555555);
          border-radius: 8px;
          background: var(--bg-primary, #222222);
          color: var(--text-primary, #ffffff);
          resize: none;
          outline: none;
          font-family: inherit;
          font-size: 0.9rem;
          min-height: 44px;
          max-height: 120px;
          transition: border-color 0.2s ease;
        }

        .chat-input:focus {
          border-color: var(--primary, #6366f1);
          box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.1);
        }

        .chat-send {
          background: var(--primary, #6366f1);
          color: white;
          border: none;
          border-radius: 8px;
          padding: 0.75rem 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          min-width: 80px;
        }

        .chat-send:hover:not(:disabled) {
          background: var(--primary-dark, #4244b8);
          transform: translateY(-1px);
        }

        .chat-send:disabled {
          background: #666;
          cursor: not-allowed;
          transform: none;
        }

        .chat-input-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .chat-counter {
          font-size: 0.8rem;
          color: var(--text-secondary, #cccccc);
        }

        .chat-counter.near-limit {
          color: #ef4444;
          font-weight: 600;
        }

        .quick-actions {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .quick-action {
          background: rgba(255, 255, 255, 0.1);
          color: var(--text-secondary, #cccccc);
          border: 1px solid var(--border-color, #555555);
          border-radius: 16px;
          padding: 0.25rem 0.75rem;
          font-size: 0.8rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .quick-action:hover:not(:disabled) {
          background: var(--primary, #6366f1);
          color: white;
          border-color: var(--primary, #6366f1);
        }

        .quick-action:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .retry-actions {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
        }

        .retry-button, .test-connection-button {
          background: var(--primary, #6366f1);
          color: white;
          border: none;
          border-radius: 6px;
          padding: 0.5rem 1rem;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .retry-button:hover, .test-connection-button:hover {
          background: var(--primary-dark, #4244b8);
        }

        .retry-info {
          font-size: 0.8rem;
          color: var(--text-secondary, #cccccc);
          text-align: center;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.8; }
        }

        @keyframes dotPulse {
          0%, 100% { transform: scale(0.7); opacity: 0.5; }
          50% { transform: scale(1); opacity: 1; }
        }

        @keyframes fadeInMessage {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 768px) {
          .modern-chat-widget {
            height: 500px;
          }
          
          .chat-header-section {
            padding: 1rem 1.5rem 0.5rem 1.5rem;
          }
          
          .chat-messages {
            padding: 1rem;
            gap: 0.75rem;
          }
          
          .chat-footer-section {
            padding: 0.75rem 1rem;
          }
          
          .chat-input-footer {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }
          
          .quick-actions {
            width: 100%;
            justify-content: center;
          }
        }
      `;
    }
  }

  // Make available globally
  window.ChatWidget = ChatWidget;

  // CommonJS support
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChatWidget;
  }
}
          