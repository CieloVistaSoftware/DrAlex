// Clean Chat Widget - Copy this EXACTLY to js/chat-widget.js
if (!window.ChatWidget) {
  class ChatWidget {
    constructor(options) {
      options = options || {};
      const protocol = window.location.protocol;
      const hostname = window.location.hostname;
      const port = options.apiPort || '3000';
      this.apiUrl = options.apiUrl || protocol + '//' + hostname + ':' + port + '/api/chat';

      this.conversationId = null;
      this.sessionHistory = [];
      this.isLoading = false;
      this.isDebugMode = localStorage.getItem('chatDebugMode') === 'true';
      
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

      this.loadWidgetAssets(options);
    }

    createDebugSystem() {
      var self = this;
      return {
        log: function(message, type, data) {
          if (!self.isDebugMode) return;
          var timestamp = new Date().toLocaleTimeString();
          console.log('[' + timestamp + '] ' + (type || 'info').toUpperCase() + ': ' + message, data || '');
        }
      };
    }

    sanitizeHTML(str) {
      var div = document.createElement('div');
      div.textContent = str;
      return div.innerHTML;
    }

    validateMessage(message) {
      if (!message || typeof message !== 'string') {
        return { valid: false, error: 'Message must be a non-empty string' };
      }
      if (message.length > 500) {
        return { valid: false, error: 'Message too long (max 500 characters)' };
      }
      if (/<script|javascript:|on\w+=/i.test(message)) {
        return { valid: false, error: 'Invalid characters detected' };
      }
      return { valid: true };
    }
    
    loadWidgetAssets(options) {
      var self = this;
      try {
        this.debug.log('Initializing chat widget with nav layout', 'info');
        
        var html = this.createHTML();
        this.container = document.createElement('div');
        this.container.className = 'redesigned-chat-widget';
        this.container.innerHTML = html;
        
        document.body.appendChild(this.container);

        this.addStyles();
        this.cacheElements();
        this.addEventListeners();
        this.setupConnectionMonitoring();
        this.addWelcomeMessage();

        this.debug.log('Chat widget initialized successfully', 'success');
        
      } catch (error) {
        this.debug.log('Failed to initialize chat widget', 'error', error);
        this.showError('Failed to initialize chat widget');
      }
    }

    createHTML() {
      return [
        '<header class="chat-header-section">',
          '<h2 class="section-title">Chat With Us</h2>',
          '<div class="chat-status-bar">',
            '<span class="status-indicator connecting" id="connection-status"></span>',
            '<span class="status-text">Connecting...</span>',
          '</div>',
        '</header>',
        '<main class="chat-main-section">',
          '<div class="chat-messages" id="chat-messages" role="log" aria-live="polite"></div>',
        '</main>',
        '<footer class="chat-footer-section">',
          '<div class="chat-input-wrapper">',
            '<textarea class="chat-input" placeholder="Ask me about eye care..." rows="2" maxlength="500" aria-label="Type your message"></textarea>',
            '<button class="chat-send" disabled aria-label="Send message">',
              '<span class="send-text">Send</span>',
            '</button>',
          '</div>',
          '<div class="chat-input-footer">',
            '<span class="chat-counter" aria-live="polite">0/500</span>',
            '<div class="quick-actions">',
              '<button class="quick-action" data-message="What services do you offer?">Services</button>',
              '<button class="quick-action" data-message="How can I book an appointment?">Book</button>',
              '<button class="quick-action" data-message="What are your hours?">Hours</button>',
            '</div>',
          '</div>',
        '</footer>'
      ].join('');
    }

    cacheElements() {
      this.messagesContainer = this.container.querySelector('#chat-messages');
      this.inputField = this.container.querySelector('.chat-input');
      this.sendButton = this.container.querySelector('.chat-send');
      this.charCounter = this.container.querySelector('.chat-counter');
      this.connectionStatus = this.container.querySelector('#connection-status');
      this.statusText = this.container.querySelector('.status-text');
      this.quickActions = this.container.querySelectorAll('.quick-action');
    }

    addEventListeners() {
      var self = this;
      var inputTimeout;
      
      this.inputField.addEventListener('input', function() {
        clearTimeout(inputTimeout);
        inputTimeout = setTimeout(function() { self.handleInput(); }, 100);
      });
      
      this.inputField.addEventListener('keydown', function(e) { self.handleKeyDown(e); });
      this.sendButton.addEventListener('click', function() { self.sendMessage(); });
      
      for (var i = 0; i < this.quickActions.length; i++) {
        this.quickActions[i].addEventListener('click', function() {
          var message = this.dataset.message;
          if (message) {
            self.inputField.value = message;
            self.handleInput();
            self.sendMessage();
          }
        });
      }

      this.inputField.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = Math.min(this.scrollHeight, 120) + 'px';
      });

      this.container.addEventListener('click', function(e) {
        if (!e.target.closest('button') && !e.target.closest('a') && window.getSelection().toString() === '') {
          self.inputField.focus();
        }
      });
    }

    handleInput() {
      var messageLength = this.inputField.value.trim().length;
      this.sendButton.disabled = messageLength === 0 || this.isLoading;
      this.charCounter.textContent = messageLength + '/500';
      if (messageLength > 450) {
        this.charCounter.classList.add('near-limit');
      } else {
        this.charCounter.classList.remove('near-limit');
      }
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
      var self = this;
      this.testConnection();
      this.healthCheckInterval = setInterval(function() {
        if (!self.isLoading) {
          self.testConnection(true);
        }
      }, 30000);
    }

    testConnection(silent) {
      var self = this;
      try {
        if (!silent) {
          this.debug.log('Testing connection...', 'network');
        }
        
        var startTime = performance.now();
        var healthUrl = this.apiUrl.replace('/chat', '/health');
        
        return fetch(healthUrl, {
          method: 'GET'
        }).then(function(response) {
          var responseTime = performance.now() - startTime;
          
          if (response.ok) {
            return response.json().then(function(data) {
              self.updateConnectionStatus('online', 'Online - Ready to help');
              self.lastHealthCheck = new Date();
              
              if (!silent) {
                self.debug.log('Connection test successful (' + responseTime.toFixed(0) + 'ms)', 'success', data);
              }
              return { success: true, responseTime: responseTime, data: data };
            });
          } else {
            throw new Error('Health check failed: ' + response.status);
          }
        }).catch(function(error) {
          self.updateConnectionStatus('offline', 'Offline - Connection issues');
          if (!silent) {
            self.debug.log('Connection test failed', 'error', error);
          }
          return { success: false, error: error.message };
        });
      } catch (error) {
        this.updateConnectionStatus('offline', 'Offline - Connection issues');
        if (!silent) {
          this.debug.log('Connection test failed', 'error', error);
        }
        return Promise.resolve({ success: false, error: error.message });
      }
    }

    updateConnectionStatus(status, text) {
      this.connectionStatus.className = 'status-indicator ' + status;
      this.statusText.textContent = text;
      this.connectionStatus = status;
    }

    addWelcomeMessage() {
      this.addMessage({
        role: 'assistant',
        content: 'Hello! I\'m your AI assistant for eye care questions. Feel free to ask me anything or use the quick action buttons below!'
      });
    }

    sendMessage() {
      var self = this;
      var message = this.inputField.value.trim();
      if (!message || this.isLoading) return;

      var validation = this.validateMessage(message);
      if (!validation.valid) {
        this.showError(validation.error);
        return;
      }

      this.debug.log('User message: ' + message, 'input');
      var startTime = performance.now();
      var messageToSend = message;
      
      this.inputField.value = '';
      this.sendButton.disabled = true;
      this.charCounter.textContent = '0/500';
      this.inputField.style.height = 'auto';
      this.charCounter.classList.remove('near-limit');

      this.addMessage({ role: 'user', content: messageToSend });
      
      this.setLoading(true);
      this.addLoadingIndicator();

      this.sessionHistory.push({ role: 'user', content: messageToSend });

      var requestBody = {
        message: this.sanitizeHTML(messageToSend),
        conversationId: this.conversationId,
        sessionHistory: this.sessionHistory
      };
      
      this.debug.log('Sending request to API', 'network', requestBody);

      fetch(this.apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      }).then(function(response) {
        if (!response.ok) {
          return response.text().then(function(errorText) {
            throw new Error('API error: ' + response.status + ' ' + response.statusText + ' - ' + errorText);
          });
        }
        return response.json();
      }).then(function(data) {
        var responseTime = performance.now() - startTime;
        
        self.debug.log('Response received (' + responseTime.toFixed(0) + 'ms)', 'output', data);

        if (!data.response) {
          throw new Error('Invalid response: Missing response field');
        }

        self.conversationId = data.conversationId;
        self.removeLoadingIndicator();
        
        var assistantMessage = { role: 'assistant', content: data.response };
        self.addMessage(assistantMessage);
        self.sessionHistory.push(assistantMessage);

        self.performanceMetrics.messagesSent++;
        self.performanceMetrics.messagesReceived++;
        self.performanceMetrics.averageResponseTime = 
          (self.performanceMetrics.averageResponseTime + responseTime) / 2;

        self.retryCount = 0;
        self.retryDelay = 1000;

      }).catch(function(error) {
        self.debug.log('Error sending message', 'error', error);
        self.performanceMetrics.errors++;
        self.handleError(error);
      }).finally(function() {
        self.setLoading(false);
        self.inputField.disabled = false;
        self.inputField.focus();
      });
    }

    handleError(error) {
      this.removeLoadingIndicator();
      this.retryCount++;
      
      var errorMessage = 'An unexpected error occurred.';
      var canRetry = false;
      
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
      var self = this;
      var retryEl = document.createElement('div');
      retryEl.className = 'chat-message system-message retry-message';
      retryEl.innerHTML = [
        '<div class="message-content system-content">',
          '<div class="retry-actions">',
            '<button class="retry-button">🔄 Retry Last Message</button>',
            '<button class="test-connection-button">🔗 Test Connection</button>',
          '</div>',
          '<div class="retry-info">Attempt ' + this.retryCount + '/' + this.maxRetries + '</div>',
        '</div>'
      ].join('');
      
      this.messagesContainer.insertBefore(retryEl, this.messagesContainer.firstChild);
      
      var retryButton = retryEl.querySelector('.retry-button');
      var testButton = retryEl.querySelector('.test-connection-button');
      
      retryButton.addEventListener('click', function() {
        retryEl.remove();
        for (var i = self.sessionHistory.length - 1; i >= 0; i--) {
          if (self.sessionHistory[i].role === 'user') {
            self.inputField.value = self.sessionHistory[i].content;
            self.handleInput();
            setTimeout(function() { self.sendMessage(); }, self.retryDelay);
            self.retryDelay = Math.min(self.retryDelay * 2, 10000);
            break;
          }
        }
      });
      
      testButton.addEventListener('click', function() {
        retryEl.remove();
        self.testConnection().then(function(result) {
          if (result.success) {
            self.showNotification('Connection restored!', 'success');
          } else {
            self.showNotification('Connection still failing', 'error');
          }
        });
      });
    }

    setLoading(loading) {
      this.isLoading = loading;
      this.sendButton.disabled = loading || this.inputField.value.trim().length === 0;
      this.inputField.disabled = false;
      
      if (loading) {
        this.inputField.placeholder = '';
      } else {
        this.inputField.placeholder = 'Ask me about eye care...';
      }
      
      for (var i = 0; i < this.quickActions.length; i++) {
        this.quickActions[i].disabled = loading;
      }
      
      var sendText = this.sendButton.querySelector('.send-text');
      if (sendText) {
        sendText.textContent = loading ? 'Sending...' : 'Send';
      }
    }

    addLoadingIndicator() {
      this.removeLoadingIndicator();
      var loadingEl = document.createElement('div');
      loadingEl.className = 'chat-message assistant-message loading-indicator';
      loadingEl.innerHTML = [
        '<div class="message-content">',
          '<div class="loading-dots">',
            '<span></span><span></span><span></span>',
          '</div>',
          '<div class="loading-text">Thinking...</div>',
        '</div>'
      ].join('');
      this.messagesContainer.insertBefore(loadingEl, this.messagesContainer.firstChild);
    }

    removeLoadingIndicator() {
      var loadingEl = this.messagesContainer.querySelector('.loading-indicator');
      if (loadingEl) loadingEl.remove();
    }

    addMessage(messageObj) {
      this.debug.log('Adding ' + messageObj.role + ' message to UI', 'ui');
      
      var messageEl = document.createElement('div');
      messageEl.className = 'chat-message ' + messageObj.role + '-message';
      messageEl.setAttribute('role', messageObj.role === 'system' ? 'status' : 'log');
      
      var formattedContent = this.formatMessage(messageObj.content);
      messageEl.innerHTML = '<div class="message-content">' + formattedContent + '</div>';
      
      this.messagesContainer.insertBefore(messageEl, this.messagesContainer.firstChild);
      
      messageEl.style.opacity = '0';
      messageEl.style.transform = 'translateY(-20px)';
      setTimeout(function() {
        messageEl.style.transition = 'all 0.3s ease';
        messageEl.style.opacity = '1';
        messageEl.style.transform = 'translateY(0)';
      }, 50);
    }

    formatMessage(content) {
      var formatted = this.sanitizeHTML(content);
      return formatted
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
        .replace(/`(.*?)`/g, '<code>$1</code>')
        .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>')
        .replace(/\n/g, '<br>');
    }

    showNotification(message, type) {
      var notification = document.createElement('div');
      notification.textContent = message;
      var bgColor = type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6';
      notification.style.cssText = 'position: fixed; top: 20px; right: 20px; padding: 0.75rem 1rem; border-radius: 8px; color: white; z-index: 10000; background: ' + bgColor + '; animation: slideIn 0.3s ease;';
      document.body.appendChild(notification);
      setTimeout(function() { notification.remove(); }, 3000);
    }

    showError(message) {
      this.showNotification(message, 'error');
      this.debug.log(message, 'error');
    }

    destroy() {
      if (this.healthCheckInterval) {
        clearInterval(this.healthCheckInterval);
      }
      if (this.container && this.container.parentNode) {
        this.container.parentNode.removeChild(this.container);
      }
    }

    addStyles() {
      if (document.getElementById('nav-respecting-chat-styles')) return;

      var style = document.createElement('style');
      style.id = 'nav-respecting-chat-styles';
      style.textContent = '.redesigned-chat-widget{width:calc(100% - 320px);height:100vh;background:#333333;display:flex;flex-direction:column;overflow:hidden;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;position:fixed;top:0;left:320px;right:0;bottom:0;z-index:100}@media(max-width:1024px){.redesigned-chat-widget{width:100%;left:0}}.chat-header-section{background:#222222;padding:1rem 2rem 0.5rem 2rem;border-bottom:1px solid #555555;flex-shrink:0;max-height:120px}.chat-header-section .section-title{font-size:2rem;margin-bottom:1rem;color:#6366f1 !important;padding-bottom:0;border-bottom:none}.chat-status-bar{display:flex;align-items:center;gap:0.5rem;font-size:0.85rem;color:#cccccc;margin-bottom:1rem}.status-indicator{width:10px;height:10px;border-radius:50%;background:#6b7280;transition:all 0.3s ease;box-shadow:0 0 4px rgba(0,0,0,0.3)}.status-indicator.online{background:#10b981;box-shadow:0 0 8px rgba(16,185,129,0.4)}.status-indicator.offline{background:#ef4444;box-shadow:0 0 8px rgba(239,68,68,0.4)}.status-indicator.connecting{background:#f59e0b;box-shadow:0 0 8px rgba(245,158,11,0.4);animation:pulse 2s infinite}.chat-main-section{flex:2;overflow:hidden;background:#222222;min-height:300px;padding-bottom:140px}.chat-messages{height:100%;padding:1.5rem;overflow-y:auto;overflow-x:hidden;display:flex;flex-direction:column;gap:1rem}.chat-messages::-webkit-scrollbar{width:12px}.chat-messages::-webkit-scrollbar-track{background:#333333;border-radius:6px}.chat-messages::-webkit-scrollbar-thumb{background:#6366f1;border-radius:6px;border:2px solid #333333}.chat-message{animation:fadeInMessage 0.3s ease;max-width:85%}.user-message{align-self:flex-end}.assistant-message{align-self:flex-start}.system-message{align-self:center;max-width:90%}.message-content{padding:0.75rem 1rem;border-radius:12px;line-height:1.5;word-wrap:break-word;background:#333333;border:1px solid #555555;color:#ffffff}.user-message .message-content{background:#6366f1;color:white;border-color:#6366f1}.assistant-message .message-content{background:#333333;color:#ffffff;border-color:#555555}.system-content{background:rgba(255,193,7,0.1);border:1px solid rgba(255,193,7,0.3);color:#cccccc;font-style:italic;text-align:center}.loading-dots{display:flex;justify-content:center;align-items:center;gap:4px;margin-bottom:0.5rem}.loading-dots span{width:6px;height:6px;border-radius:50%;background:#6366f1;animation:dotPulse 1.4s infinite ease-in-out}.loading-dots span:nth-child(2){animation-delay:0.2s}.loading-dots span:nth-child(3){animation-delay:0.4s}.loading-text{text-align:center;font-size:0.85rem;color:#cccccc}.chat-footer-section{background:#333333;border-top:1px solid #555555;padding:0.75rem 1.5rem;flex-shrink:0;position:fixed;bottom:0;left:320px;right:0;z-index:1000;min-height:100px;max-height:140px}@media(max-width:1024px){.chat-footer-section{left:0}}.chat-input-wrapper{display:flex;gap:0.75rem;margin-bottom:0.75rem}.chat-input{flex:1;padding:0.75rem;border:1px solid #555555;border-radius:8px;background:#222222;color:#ffffff;resize:none;outline:none;font-family:inherit;font-size:0.9rem;min-height:44px;max-height:120px;transition:border-color 0.2s ease}.chat-input:focus{border-color:#6366f1;box-shadow:0 0 0 2px rgba(99,102,241,0.1)}.chat-send{background:#6366f1;color:white;border:none;border-radius:8px;padding:0.75rem 1rem;font-weight:600;cursor:pointer;transition:all 0.2s ease;display:flex;align-items:center;gap:0.5rem;min-width:80px}.chat-send:hover:not(:disabled){background:#4244b8;transform:translateY(-1px)}.chat-send:disabled{background:#666;cursor:not-allowed;transform:none}.chat-input-footer{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:1rem}.chat-counter{font-size:0.8rem;color:#cccccc}.chat-counter.near-limit{color:#ef4444;font-weight:600}.quick-actions{display:flex;gap:0.5rem;flex-wrap:wrap}.quick-action{background:rgba(255,255,255,0.1);color:#cccccc;border:1px solid #555555;border-radius:16px;padding:0.25rem 0.75rem;font-size:0.8rem;cursor:pointer;transition:all 0.2s ease}.quick-action:hover:not(:disabled){background:#6366f1;color:white;border-color:#6366f1}.quick-action:disabled{opacity:0.5;cursor:not-allowed}.retry-actions{display:flex;flex-direction:column;gap:0.5rem;margin-bottom:0.5rem}.retry-button,.test-connection-button{background:#6366f1;color:white;border:none;border-radius:6px;padding:0.5rem 1rem;font-size:0.9rem;cursor:pointer;transition:all 0.2s ease}.retry-button:hover,.test-connection-button:hover{background:#4244b8}.retry-info{font-size:0.8rem;color:#cccccc;text-align:center}@keyframes pulse{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.2);opacity:0.8}}@keyframes dotPulse{0%,100%{transform:scale(0.7);opacity:0.5}50%{transform:scale(1);opacity:1}}@keyframes fadeInMessage{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:translateY(0)}}@keyframes slideIn{from{transform:translateX(100%);opacity:0}to{transform:translateX(0);opacity:1}}@media(max-width:768px){.chat-header-section{padding:1rem 1.5rem 0.5rem 1.5rem}.chat-header-section .section-title{font-size:1.7rem}.chat-messages{padding:1rem;gap:0.75rem}.chat-footer-section{padding:0.75rem 1rem;min-height:100px}.chat-input-footer{flex-direction:column;align-items:flex-start;gap:0.5rem}.quick-actions{width:100%;justify-content:center}}';
      document.head.appendChild(style);
    }
  }

  window.ChatWidget = ChatWidget;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChatWidget;
  }
}