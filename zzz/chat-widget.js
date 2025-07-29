// Chat widget component for Dr. Alex Kisitu website
export class ChatWidget {
  addLoadingIndicator() {
    if (!this.messagesContainer) return;
    // Remove any existing loading indicator
    this.removeLoadingIndicator();
    const loadingEl = document.createElement('div');
    loadingEl.className = 'chat-message system-message loading-indicator';
    loadingEl.innerHTML = `
      <div class="message-content system-content">
        <span class="loading-dots"><span></span><span></span><span></span></span>
      </div>`;
    this.messagesContainer.appendChild(loadingEl);
    this.scrollToBottom();
  }

  removeLoadingIndicator() {
    if (!this.messagesContainer) return;
    const loadingEl = this.messagesContainer.querySelector('.loading-indicator');
    if (loadingEl) loadingEl.remove();
  }
  
  scrollToBottom() {
    if (this.messagesContainer) {
      this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }
  }
  
  constructor(options = {}) {
    // Use window.location to dynamically determine the API URL
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    const port = '3000'; // Backend server port
    this.apiUrl = `${protocol}//${hostname}:${port}/api/chat`;
    
    console.log(`Chat widget initialized with API URL: ${this.apiUrl}`);
    this.conversationId = null;
    this.sessionHistory = [];
    this.isOpen = false;
    this.isLoading = false;
    this.isDebugMode = false; // Track debug state
    
    // Initialize debug mode first
    this.isDebugMode = localStorage.getItem('chatDebugMode') === 'true';
    
    // Create debug logging system
    this.debug = {
      log: (message, direction = null, source = null) => {
        if (!this.isDebugMode) return;
        
        const timestamp = new Date().toLocaleTimeString();
        let prefix = '';
        let className = '';
        
        switch(direction) {
          case 'input':
            prefix = '↓ USER: ';
            className = 'debug-input';
            break;
          case 'outgoing':
            prefix = `→ TO ${source || 'UNKNOWN'}: `;
            className = 'debug-outgoing';
            break;
          case 'incoming':
            prefix = `← FROM ${source || 'UNKNOWN'}: `;
            className = 'debug-incoming';
            break;
          case 'ui':
            prefix = '↑ TO UI: ';
            className = 'debug-ui';
            break;
          case 'error':
            prefix = '❌ ERROR: ';
            className = 'debug-error';
            break;
          case 'success':
            prefix = '✅ SUCCESS: ';
            className = 'debug-success';
            break;
          case 'warning':
            prefix = '⚠️ WARNING: ';
            className = 'debug-warning';
            break;
          default:
            prefix = 'DEBUG: ';
            className = 'debug-info';
        }
        
        const logEntry = document.createElement('div');
        logEntry.className = `debug-entry ${className}`;
        logEntry.innerHTML = `
          <span class="debug-time">${timestamp}</span>
          <span class="debug-prefix">${prefix}</span>
          <span class="debug-message">${this.escapeHtml(message)}</span>
        `;
        
        if (this.debugLog) {
          if (this.debugLog.firstChild) {
            this.debugLog.insertBefore(logEntry, this.debugLog.firstChild);
          } else {
            this.debugLog.appendChild(logEntry);
          }
        }
      }
    };
    
    try {
      // Try to retrieve existing conversation from localStorage
      this.loadConversation();

      // Create chat widget DOM elements
      this.createChatWidget(options);

      // Add event listeners
      this.addEventListeners();
    } catch (err) {
      console.error('ChatWidget constructor error:', err);
      throw err;
    }
  }
  
  createChatWidget(options = {}) {
    // Get current mode (dark/light) from the document
    // Force dark mode to be true when in chat-test.html
    const isChatTest = window.location.pathname.includes('chat-test.html');
    const isDarkMode = isChatTest ? true : document.body.classList.contains('dark-mode');
    console.log(`Creating chat widget. Dark mode detected: ${isDarkMode}. Is chat-test page: ${isChatTest}`);
    
    // Create chat container
    this.container = document.createElement('div');
    this.container.className = `chat-widget ${isDarkMode ? 'dark-mode' : 'light-mode'}`;
    this.container.innerHTML = `
      <button class="chat-toggle">
        <span class="chat-icon">💬</span>
        <span class="close-icon">✕</span>
      </button>
      <div class="chat-box">
        <div class="chat-header">
          <span class="backend-status-indicator" title="Backend status" style="display:inline-block;width:12px;height:12px;border-radius:50%;margin-right:8px;vertical-align:middle;background:#ccc;"></span>
          <h3>Dr. Alex's Assistant</h3>
          <div class="chat-controls">
            <button class="copy-messages" title="Copy all messages">
              <span>📋</span>
            </button>
            <button class="maximize-button" title="Maximize chat window">
              <span class="maximize-icon">⬜</span>
              <span class="minimize-icon">⟱</span>
            </button>
          </div>
        </div>
  // Reference indicator for updates
  this.backendIndicator = this.container.querySelector('.backend-status-indicator');
  // Initial backend status check
  this.updateBackendStatus();
  // Periodically update backend status
  this._backendStatusInterval = setInterval(() => this.updateBackendStatus(), 10000);
  async updateBackendStatus() {
    if (!this.backendIndicator) return;
    try {
      const healthUrl = this.apiUrl.replace('/chat', '/health');
      const response = await fetch(healthUrl);
      if (response.ok) {
        this.backendIndicator.style.background = '#00c853'; // green
        this.backendIndicator.title = 'Backend is up';
      } else {
        this.backendIndicator.style.background = '#d50000'; // red
        this.backendIndicator.title = 'Backend is down';
      }
    } catch (err) {
      this.backendIndicator.style.background = '#d50000'; // red
      this.backendIndicator.title = 'Backend is down';
    }
  }
        <div class="chat-tabs">
          <button class="chat-tab active" data-tab="messages">Chat</button>
          <button class="chat-tab" data-tab="trace">Trace</button>
          <button class="chat-tab" data-tab="debug">Debug</button>
        </div>
        <div class="tab-content">
          <div class="tab-pane active" id="messages-tab">
            <div class="chat-messages"></div>
          </div>
          <div class="tab-pane" id="trace-tab">
            <div class="trace-container">
              <div class="trace-header">Trace</div>
              <div class="trace-log" style="min-height:120px;max-height:300px;overflow-y:auto;background:#222;color:#fff;padding:8px;border-radius:8px;margin-top:8px;"></div>
              <div class="trace-controls" style="margin-top:8px;">
                <label class="debug-toggle">
                  <input type="checkbox" ${this.isDebugMode ? 'checked' : ''}>
                  Debug Mode
                </label>
                <button class="debug-clear">Clear</button>
                <button class="debug-copy">Copy Log</button>
              </div>
            </div>
          </div>
          <div class="tab-pane" id="debug-tab">
            <div style="padding:16px;color:#888;">Debug tab is now empty. All logs and controls are in the Trace tab.</div>
          </div>
        </div>
        <div class="chat-input-container">
          <textarea 
            class="chat-input" 
            placeholder="Ask me about eye care services..." 
            rows="2"
          ></textarea>
          <button class="chat-send" disabled>
            <span>Send</span>
          </button>
          <div class="chat-counter">0/500</div>
        </div>
      </div>
    `;
    
    // Add to DOM
    if (options.mount && options.mount.appendChild) {
      options.mount.appendChild(this.container);
    } else {
      document.body.appendChild(this.container);
    }
    
    // Cache DOM elements
    this.chatBox = this.container.querySelector('.chat-box');
    this.messagesContainer = this.container.querySelector('.chat-messages');
    this.inputField = this.container.querySelector('.chat-input');
    this.sendButton = this.container.querySelector('.chat-send');
    this.toggleButton = this.container.querySelector('.chat-toggle');
    this.charCounter = this.container.querySelector('.chat-counter');
    
    // Cache copy button
    this.copyButton = this.container.querySelector('.copy-messages');
    
    // Update debug elements references (now in Trace tab)
    this.debugLog = this.container.querySelector('.trace-log');
    this.debugToggle = this.container.querySelector('.debug-toggle input');
    this.debugClear = this.container.querySelector('.debug-clear');
    this.debugCopy = this.container.querySelector('.debug-copy');
    
    // Cache tab elements
    this.tabs = this.container.querySelectorAll('.chat-tab');
    this.tabPanes = this.container.querySelectorAll('.tab-pane');
    
    // Add debug controls event listeners
    this.debugClear.addEventListener('click', () => {
      while (this.debugLog.firstChild) {
        this.debugLog.removeChild(this.debugLog.firstChild);
      }
      this.debug.log('Debug log cleared');
    });

    this.debugCopy.addEventListener('click', () => {
      const logText = this.debugLog.innerText || '';
      navigator.clipboard.writeText(logText)
        .then(() => this.debug.log('Debug log copied to clipboard'))
        .catch(err => this.debug.log('Failed to copy debug log: ' + err.message));
    });

    // Initial debug log
    this.debug.log('Chat widget initialized');
  }
  
  addEventListeners() {
    // Toggle chat open/closed
    this.toggleButton.addEventListener('click', () => {
      this.toggleChat();
    });
    
    // Enable/disable send button based on input
    this.inputField.addEventListener('input', () => {
      const messageLength = this.inputField.value.trim().length;
      this.sendButton.disabled = messageLength === 0;
      this.charCounter.textContent = `${messageLength}/500`;
      
      // Change counter color when approaching limit
      if (messageLength > 450) {
        this.charCounter.classList.add('near-limit');
      } else {
        this.charCounter.classList.remove('near-limit');
      }
    });
    
    // Send message on button click
    this.sendButton.addEventListener('click', () => {
      this.sendMessage();
    });
    
    // Send message on Enter key (but allow shift+enter for new lines)
    this.inputField.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (!this.sendButton.disabled) {
          this.sendMessage();
        }
      }
    });
    
    // Maximize/Minimize chat window
    const maximizeButton = this.container.querySelector('.maximize-button');
    maximizeButton.addEventListener('click', () => {
      this.maximize();
      
      // Update button title based on current state
      if (this.container.classList.contains('maximized')) {
        maximizeButton.title = 'Minimize chat window';
      } else {
        maximizeButton.title = 'Maximize chat window';
      }
    });
    
    // Update theme when the document theme changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && 
            mutation.attributeName === 'class' && 
            mutation.target === document.body) {
          this.updateTheme();
        }
      });
    });
    
    observer.observe(document.body, { attributes: true });
    
    // Tab switching
    this.tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const tabName = tab.getAttribute('data-tab');
        
        // Update active tab
        this.tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        // Update active pane
        this.tabPanes.forEach(pane => pane.classList.remove('active'));
        this.container.querySelector(`#${tabName}-tab`).classList.add('active');
        
        // Log tab switch
        this.debug.log(`Switched to ${tabName} tab`);
        
        // Ensure scroll position is correct
        if (tabName === 'messages') {
          this.scrollToBottom();
        }
      });
    });
    
    // Enhanced debug toggle listener
    this.debugToggle.addEventListener('change', (e) => {
      console.log('Debug toggle clicked, value:', e.target.checked);
      this.isDebugMode = e.target.checked;
      localStorage.setItem('chatDebugMode', this.isDebugMode ? 'true' : 'false');
      
      // Toggle full screen and debug visibility
      this.container.classList.toggle('debug-fullscreen', this.isDebugMode);
      this.debugLog.style.display = this.isDebugMode ? 'block' : 'none';
      
      // Adjust layout when debug mode changes
      if (this.isDebugMode) {
        // Switch to trace tab when enabling debug mode
        this.tabs.forEach(t => t.classList.remove('active'));
        this.container.querySelector('.chat-tab[data-tab="trace"]').classList.add('active');
        
        this.tabPanes.forEach(pane => pane.classList.remove('active'));
        this.container.querySelector('#trace-tab').classList.add('active');
        
        this.container.classList.add('maximized');
        document.body.style.overflow = 'hidden'; // Prevent body scroll when in debug
      } else {
        // Switch back to chat tab when disabling debug mode
        this.tabs.forEach(t => t.classList.remove('active'));
        this.container.querySelector('.chat-tab[data-tab="messages"]').classList.add('active');
        
        this.tabPanes.forEach(pane => pane.classList.remove('active'));
        this.container.querySelector('#messages-tab').classList.add('active');
        
        this.container.classList.remove('maximized');
        document.body.style.overflow = '';
      }
      
      // Add a visible message to show the debug toggle worked
      this.addMessage({
        role: 'system',
        content: this.isDebugMode ? '🟢 Debug mode enabled' : '🔴 Debug mode disabled'
      });
      
      this.debug.log(this.isDebugMode ? '🟢 Debug mode enabled' : '🔴 Debug mode disabled', 'info');
    });
  }
  
  updateTheme() {
    const isDarkMode = document.body.classList.contains('dark-mode');
    this.container.classList.toggle('dark-mode', isDarkMode);
    this.container.classList.toggle('light-mode', !isDarkMode);
    
    // Log theme update for debugging
    console.log(`Theme updated. Dark mode: ${isDarkMode}`);
    this.debug.log(`Theme updated to ${isDarkMode ? 'dark' : 'light'} mode`);
  }
  
  toggleChat() {
    this.isOpen = !this.isOpen;
    this.container.classList.toggle('open', this.isOpen);
    
    // Add welcome message if first open and no history
    if (this.isOpen && this.messagesContainer.children.length === 0) {
      this.addMessage({
        role: 'assistant',
        content: 'Hello! I\'m Dr. Alex\'s virtual assistant. How can I help you with your eye care needs today?'
      });
    }
    
    // Focus input when opening
    if (this.isOpen) {
      setTimeout(() => this.inputField.focus(), 300);
    }
  }
  
  // Add automatic focus to the input field when maximizing too
  maximize() {
    this.container.classList.toggle('maximized');
    
    // Set focus to the input field when maximizing
    if (this.container.classList.contains('maximized')) {
      setTimeout(() => this.inputField.focus(), 300);
    }
  }
  
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  async sendMessage() {
    const message = this.inputField.value.trim();
    if (!message || this.isLoading) return;

    // Log user input
    this.debug.log(`Message: ${message}`, 'input');

    // Clear input immediately
    this.inputField.value = '';
    this.sendButton.disabled = true;
    this.charCounter.textContent = '0/500';

    // Check for admin command
    const isAdminCommand = /^[/\\](admin)\s+/.test(message);
    const commandType = message.startsWith('/') || message.startsWith('\\') ? 
      message.substring(1).split(/\s+/)[0] : null;

    // Process admin command
    if (isAdminCommand && commandType === 'admin') {
      this.debug.log('Processing admin command', 'outgoing', 'ADMIN');
      if (!this.adminController?.isAdmin) {
        this.debug.log('Access denied: Not logged in', 'incoming', 'ADMIN');
        this.debug.log('Displaying error message', 'ui');
        this.addMessage({
          role: 'system',
          content: '❌ Admin access required.'
        });
        return;
      }
      
      try {
        const command = message.substring(message.indexOf('admin') + 6).trim();
        const result = await this.adminController.handleAdminCommand(command);
        this.debug.log('Command executed successfully', 'incoming', 'ADMIN');
        this.debug.log('Displaying success message', 'ui');
        this.addMessage({
          role: 'system',
          content: `✅ Change applied successfully: ${JSON.stringify(result)}`
        });
      } catch (error) {
        this.debug.log(`Command error: ${error.message}`, 'incoming', 'ADMIN');
        this.debug.log('Displaying error message', 'ui');
        this.addMessage({
          role: 'system',
          content: `❌ Error applying change: ${error.message}`
        });
      }
      return;
    }

    try {
      // Only non-command messages proceed to Claude API
      this.debug.log('Processing regular message', 'outgoing', 'CLAUDE');

      // Add user message to UI first
      this.debug.log('Adding user message to UI', 'ui');
      this.addMessage({
        role: 'user',
        content: message
      });

      // Show loading indicator
      this.isLoading = true;
      this.addLoadingIndicator();

      // Add to session history
      this.sessionHistory.push({
        role: 'user',
        content: message
      });

      const requestBody = {
        message,
        conversationId: this.conversationId,
        sessionHistory: this.sessionHistory
      };
      
      this.debug.log(`Request payload: ${JSON.stringify(requestBody)}`, 'outgoing', 'CLAUDE');

      // Enhanced fetch with timeout and better error handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      try {
        const response = await fetch(this.apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        // Enhanced response handling
        if (!response.ok) {
          // Try to get error details from response
          let errorDetails = '';
          try {
            const errorData = await response.json();
            errorDetails = errorData.error || errorData.message || '';
            this.debug.log(`Server error details: ${JSON.stringify(errorData)}`, 'incoming', 'CLAUDE');
          } catch (parseError) {
            // If response isn't JSON, try to get text
            try {
              errorDetails = await response.text();
              this.debug.log(`Server error text: ${errorDetails}`, 'incoming', 'CLAUDE');
            } catch (textError) {
              this.debug.log(`Failed to parse error response: ${textError.message}`, 'incoming', 'CLAUDE');
            }
          }
          
          throw new Error(`API error: ${response.status} ${response.statusText}${errorDetails ? ` - ${errorDetails}` : ''}`);
        }

        const data = await response.json();
        this.debug.log('Response received from Claude', 'incoming', 'CLAUDE');
        this.debug.log(`Response data: ${JSON.stringify(data)}`, 'incoming', 'CLAUDE');

        // Validate response structure
        if (!data.response) {
          throw new Error('Invalid response: Missing response field');
        }

        // Store conversation ID
        this.conversationId = data.conversationId;
        
        // Remove loading indicator
        this.removeLoadingIndicator();
        
        // Add Claude response to UI
        const assistantMessage = {
          role: 'assistant',
          content: data.response
        };
        
        this.debug.log('Adding Claude response to UI', 'ui');
        this.addMessage(assistantMessage);
        
        // Add to session history
        this.sessionHistory.push(assistantMessage);
        
        // Save conversation to localStorage
        this.saveConversation();

      } catch (fetchError) {
        clearTimeout(timeoutId);
        
        // Enhanced error categorization
        if (fetchError.name === 'AbortError') {
          throw new Error('Request timeout: The server took too long to respond');
        } else if (fetchError.message.includes('Failed to fetch')) {
          throw new Error('Network error: Unable to connect to server. Please check if the server is running.');
        } else {
          throw fetchError;
        }
      }

    } catch (error) {
      this.debug.log(`Error: ${error.message}`, 'error');
      this.handleError(error);
    }

    // Reset loading state
    this.isLoading = false;
    this.scrollToBottom();
  }
  
  // Enhanced error handling method
  handleError(error) {
    this.removeLoadingIndicator();
    this.debug.log('🚨 Handling error: ' + error.message, 'error');
    
    let errorMessage = 'An error occurred while processing your message.';
    let errorDetail = '';
    let showRetry = false;
    
    if (error.message.includes('timeout')) {
      errorMessage = '⏱️ Request Timeout';
      errorDetail = 'The server took too long to respond. This might indicate server overload or network issues.';
      showRetry = true;
    } else if (error.message.includes('Network error') || error.message.includes('Failed to fetch')) {
      errorMessage = '🌐 Connection Failed';
      errorDetail = 'Unable to connect to the chat server. Please ensure the server is running on port 3000.';
      showRetry = true;
    } else if (error.message.includes('500 Internal Server Error')) {
      errorMessage = '🚨 Server Error';
      errorDetail = 'The server encountered an internal error. This could be due to:\n• Missing or invalid API key\n• Server configuration issues\n• Claude API service problems';
      showRetry = true;
    } else if (error.message.includes('401') || error.message.includes('Unauthorized')) {
      errorMessage = '🔒 Authentication Error';
      errorDetail = 'The server requires valid authentication. Please check the API key configuration.';
    } else if (error.message.includes('429') || error.message.includes('rate limit')) {
      errorMessage = '🚫 Rate Limited';
      errorDetail = 'Too many requests. Please wait a moment before trying again.';
      showRetry = true;
    } else if (error.message.includes('Invalid response')) {
      errorMessage = '📦 Invalid Response';
      errorDetail = 'The server returned an unexpected response format.';
    } else if (error.message.includes('API error')) {
      errorMessage = '⚠️ Server Error';
      errorDetail = error.message;
      showRetry = true;
    }
    
    this.addMessage({
      role: 'system',
      content: `${errorMessage}\n\n${errorDetail}`
    });
    
    // Add retry button for recoverable errors
    if (showRetry) {
      this.addRetryButton();
    }
    
    // Add server status check button for connection issues
    if (error.message.includes('Network error') || error.message.includes('500')) {
      this.addServerStatusButton();
    }
  }

  // Enhanced retry button with better UX
  addRetryButton() {
    const retryEl = document.createElement('div');
    retryEl.className = 'chat-message system-message retry-message';
    retryEl.innerHTML = `
      <div class="message-content system-content">
        <div class="retry-actions">
          <button class="retry-button">🔄 Retry Last Message</button>
          <button class="test-connection-button">🔗 Test Connection</button>
        </div>
        <div class="retry-info">Try sending your message again or test the server connection</div>
      </div>
    `;
    this.messagesContainer.appendChild(retryEl);
    
    // Add click events
    const retryButton = retryEl.querySelector('.retry-button');
    const testButton = retryEl.querySelector('.test-connection-button');
    
    retryButton.addEventListener('click', () => {
      retryEl.remove();
      // Get the last user message and resend it
      const lastUserMessage = this.sessionHistory.filter(msg => msg.role === 'user').pop();
      if (lastUserMessage) {
        this.inputField.value = lastUserMessage.content;
        this.sendMessage();
      }
    });
    
    testButton.addEventListener('click', () => {
      retryEl.remove();
      this.testConnection();
    });
    
    this.scrollToBottom();
  }

  // Add server status check
  addServerStatusButton() {
    const statusEl = document.createElement('div');
    statusEl.className = 'chat-message system-message status-message';
    statusEl.innerHTML = `
      <div class="message-content system-content">
        <button class="status-button">🔍 Check Server Status</button>
        <div class="status-info">Check if the backend server is running and accessible</div>
      </div>
    `;
    this.messagesContainer.appendChild(statusEl);
    
    const statusButton = statusEl.querySelector('.status-button');
    statusButton.addEventListener('click', () => {
      statusEl.remove();
      this.checkServerStatus();
    });
    
    this.scrollToBottom();
  }

  // Enhanced connection test with comprehensive checks
  async testConnection() {
    this.addMessage({
      role: 'system',
      content: '🔍 Running connection diagnostics...'
    });
    
    const diagnostics = [];
    
    try {
      // Test 1: Basic health check
      const healthUrl = this.apiUrl.replace('/chat', '/health');
      
      try {
        const healthResponse = await fetch(healthUrl, { 
          method: 'GET',
          signal: AbortSignal.timeout(5000)
        });
        
        if (healthResponse.ok) {
          const healthData = await healthResponse.json();
          diagnostics.push(`✅ Server Health: ${healthData.status || 'OK'}`);
          diagnostics.push(`✅ API Key: ${healthData.config?.apiKeyConfigured ? 'Configured' : 'Missing'}`);
        } else {
          diagnostics.push(`❌ Health Check: ${healthResponse.status} ${healthResponse.statusText}`);
        }
      } catch (healthError) {
        diagnostics.push(`❌ Health Check: ${healthError.message}`);
      }
      
      // Test 2: Simple chat test
      try {
        const testResponse = await fetch(this.apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: 'test',
            conversationId: null,
            sessionHistory: []
          }),
          signal: AbortSignal.timeout(10000)
        });
        
        if (testResponse.ok) {
          diagnostics.push(`✅ Chat Endpoint: Working`);
        } else {
          const errorText = await testResponse.text();
          diagnostics.push(`❌ Chat Endpoint: ${testResponse.status} - ${errorText.substring(0, 100)}`);
        }
      } catch (chatError) {
        diagnostics.push(`❌ Chat Endpoint: ${chatError.message}`);
      }
      
    } catch (error) {
      diagnostics.push(`❌ Test Failed: ${error.message}`);
    }
    
    this.addMessage({
      role: 'system',
      content: `🔍 Connection Diagnostics Results:\n\n${diagnostics.join('\n')}\n\n${diagnostics.some(d => d.includes('✅')) ? '✅ Some services are working' : '❌ All services failed - check if server is running'}`
    });
  }

  // Server status check method
  async checkServerStatus() {
    this.addMessage({
      role: 'system',
      content: '🔍 Checking server status...'
    });
    
    try {
      const baseUrl = this.apiUrl.replace('/api/chat', '');
      const statusChecks = [
        { name: 'Main Server', url: baseUrl },
        { name: 'Health Endpoint', url: `${baseUrl}/api/health` },
        { name: 'Chat Endpoint', url: this.apiUrl }
      ];
      
      const results = await Promise.allSettled(
        statusChecks.map(async (check) => {
          const response = await fetch(check.url, { 
            method: 'GET',
            signal: AbortSignal.timeout(3000)
          });
          return { ...check, status: response.status, ok: response.ok };
        })
      );
      
      const statusReport = results.map((result, index) => {
        if (result.status === 'fulfilled') {
          const { name, status, ok } = result.value;
          return `${ok ? '✅' : '❌'} ${name}: ${status}`;
        } else {
          return `❌ ${statusChecks[index].name}: ${result.reason.message}`;
        }
      }).join('\n');
      
      this.addMessage({
        role: 'system',
        content: `🔍 Server Status Report:\n\n${statusReport}`
      });
      
    } catch (error) {
      this.addMessage({
        role: 'system',
        content: `❌ Status check failed: ${error.message}`
      });
    }
  }
  
  addMessage({ role, content }) {
    // Log message being added to UI
    this.debug.log(`Displaying ${role} message: ${content.substring(0, 50)}${content.length > 50 ? '...' : ''}`, 'ui');
    
    const messageEl = document.createElement('div');
    messageEl.className = `chat-message ${role}-message`;
    
    let formattedContent = this.formatMessage(content);
    
    if (role === 'system') {
      messageEl.innerHTML = `<div class="message-content system-content">${formattedContent}</div>`;
    } else {
      // Removed avatar and use only the message content
      messageEl.innerHTML = `
        <div class="message-content">${formattedContent}</div>
      `;
    }
    
    this.messagesContainer.appendChild(messageEl);
    this.scrollToBottom();
  }
  
  formatMessage(content) {
    // Very basic markdown formatting (could be enhanced with a proper markdown library)
    let formatted = content
      // Bold text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Italic text
      .replace(/\*(.*?)\*/g, '<em>$1</em>');
    return formatted;
  }

  loadConversation() {
    try {
      const savedData = localStorage.getItem('drAlexChat');
      if (savedData) {
        const { conversationId, sessionHistory, timestamp } = JSON.parse(savedData);
        // Check if conversation is older than 24 hours
        const savedTime = new Date(timestamp).getTime();
        const currentTime = new Date().getTime();
        const hoursDiff = (currentTime - savedTime) / (1000 * 60 * 60);
        if (hoursDiff < 24) {
          this.conversationId = conversationId;
          this.sessionHistory = sessionHistory;
          return;
        }
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
    }
    // Default to empty conversation
    this.conversationId = null;
    this.sessionHistory = [];
  }

  saveConversation() {
    try {
      const conversationData = {
        conversationId: this.conversationId,
        sessionHistory: this.sessionHistory,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem('drAlexChat', JSON.stringify(conversationData));
      this.debug.log('Conversation saved to localStorage', 'success');
    } catch (error) {
      this.debug.log('Failed to save conversation: ' + error.message, 'error');
    }
  }

  async copyMessages() {
    try {
      const messages = Array.from(this.messagesContainer.querySelectorAll('.message-content'))
        .map(el => el.textContent.trim())
        .join('\n\n');
      
      await navigator.clipboard.writeText(messages);
      
      // Show feedback
      const originalText = this.copyButton.innerHTML;
      this.copyButton.innerHTML = '<span>✓</span>';
      setTimeout(() => {
        this.copyButton.innerHTML = originalText;
      }, 2000);
      
      this.debug.log('Messages copied to clipboard', 'success');
    } catch (error) {
      this.debug.log('Failed to copy messages: ' + error.message, 'error');
    }
  }
}

/**
 * Initialize and configure the chat widget.
 * This function can be called directly or will be automatically invoked when the DOM is loaded.
 * It handles chat widget initialization and theme detection.
 */
function initializeChatWidget() {
  // Force explicit dark mode check on load
  const forceDarkModeCheck = () => {
    // Test pages: always force dark mode on test pages
    const isTestPage = window.location.pathname.includes('chat-test.html') || 
                      window.location.pathname.includes('simple-chat-test.html') ||
                      window.location.pathname.includes('improved-chat-test.html');
    
    // Check if dark mode is active on the body
    const bodyHasDarkMode = document.body.classList.contains('dark-mode');
    
    // Test pages always use dark mode, otherwise use the body class
    const isDarkMode = isTestPage ? true : bodyHasDarkMode;
    
    console.log(`Theme check: Body has dark-mode class: ${bodyHasDarkMode}, Is test page: ${isTestPage}, Using dark mode: ${isDarkMode}`);
    
    // Apply the correct theme to the chat widget
    const chatWidget = document.querySelector('.chat-widget');
    if (chatWidget) {
      if (isDarkMode) {
        chatWidget.classList.add('dark-mode');
        chatWidget.classList.remove('light-mode');
      } else {
        chatWidget.classList.add('light-mode');
        chatWidget.classList.remove('dark-mode');
      }
      console.log(`Applied theme to chat widget: ${isDarkMode ? 'dark-mode' : 'light-mode'}`);
    } else {
      console.warn('Chat widget not found for theme application');
    }
  };
  
  // Initialize chat widget if not already done
  if (!window.drAlexChat) {
    console.log('Initializing Dr. Alex Chat Widget...');
    try {
      window.drAlexChat = new ChatWidget();
      console.log('Chat widget initialized successfully');
    } catch (error) {
      console.error('Error initializing chat widget:', error && error.message ? error.message : error);
      if (error && error.stack) {
        console.error('Stack trace:', error.stack);
      }
    }
  } else {
    console.log('Chat widget already initialized');
  }
  
  // Run the theme check multiple times to ensure it's applied correctly
  // This handles race conditions with CSS loading and DOM manipulation
  forceDarkModeCheck(); // Immediate check
  setTimeout(forceDarkModeCheck, 500);  // Short delay check
  setTimeout(forceDarkModeCheck, 1000); // Longer delay final check
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  
  // Add CSS for chat widget (keeping existing styles plus new enhanced styles)
  const style = document.createElement('style');
  style.textContent = `
    .chat-widget {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 1000;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    
    .chat-toggle {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: var(--primary, #6366f1);
      color: white;
      border: none;
      outline: none;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      transition: all 0.3s ease;
    }
    
    .chat-toggle:hover {
      transform: scale(1.05);
      background: var(--primary-dark, #4244b8);
    }
    
    .chat-icon, .close-icon {
      position: absolute;
      transition: opacity 0.3s ease, transform 0.3s ease;
    }
    
    .close-icon {
      opacity: 0;
      transform: scale(0.5);
    }
    
    .chat-box {
      position: absolute;
      bottom: 70px;
      right: 0;
      width: 380px;
      height: 600px;
      max-height: 80vh;
      background: white;
      border-radius: 12px;
      box-shadow: 0 5px 25px rgba(0, 0, 0, 0.2);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      opacity: 0;
      transform: translateY(20px) scale(0.9);
      pointer-events: none;
      transition: all 0.3s ease;
    }
    
    /* Maximized chat box */
    .chat-widget.maximized .chat-box {
      width: 90vw;
      max-width: 800px;
      height: 80vh;
      max-height: 700px;
      right: 5vw;
      bottom: 10vh;
    }
    
    /* Left Nav Layout - Maximized chat takes only the right side (respects left nav) */
    body[data-layout="left-nav"] .chat-widget.maximized .chat-box {
      width: calc(100vw - var(--nav-width, 200px)); /* Respecting the left nav width using CSS variable if available */
      left: auto; /* Ensure it doesn't position from left */
      max-width: none;
      height: 100vh;
      max-height: none;
      right: 0;
      bottom: 0;
      border-radius: 0;
    }
    
    @media (max-width: 767px) {
      body[data-layout="left-nav"] .chat-widget.maximized .chat-box {
        width: 100vw; /* Full width on mobile */
      }
    }
    
    .chat-widget.open .chat-box {
      opacity: 1;
      transform: translateY(0) scale(1);
      pointer-events: all;
    }
    
    .chat-widget.open .chat-icon {
      opacity: 0;
      transform: scale(0.5);
    }
    
    .chat-widget.open .close-icon {
      opacity: 1;
      transform: scale(1);
    }
    
    .chat-header {
      background: var(--primary, #6366f1);
      color: white;
      padding: 8px 15px; /* Reduced vertical padding */
      font-weight: bold;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-radius: 12px 12px 0 0;
      min-height: 40px; /* Ensure minimum height */
    }
    
    .chat-header h3 {
      margin: 0;
      flex: 1;
      text-align: center;
      font-size: 1rem; /* Slightly smaller font */
    }
    
    /* Smaller header in maximized mode */
    .chat-widget.maximized .chat-header {
      padding: 6px 15px;
    }
    
    body[data-layout="left-nav"] .chat-widget.maximized .chat-header {
      border-radius: 0; /* No border radius when maximized in left-nav layout */
    }
    
    .chat-controls {
      display: flex;
      gap: 8px;
    }
    
    .copy-messages,
    .maximize-button {
      background: transparent;
      border: none;
      color: white;
      font-size: 18px;
      cursor: pointer;
      padding: 2px 6px;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    }
    
    .copy-messages:hover,
    .maximize-button:hover {
      background: rgba(255, 255, 255, 0.2);
    }
    
    .maximize-icon, .minimize-icon {
      position: absolute;
      transition: opacity 0.3s ease, transform 0.3s ease;
    }
    
    .minimize-icon {
      opacity: 0;
    }
    
    .chat-tabs {
      display: flex;
      background: #f8f9fa;
      border-bottom: 1px solid #e1e4e8;
    }
    
    .chat-tab {
      flex: 1;
      padding: 8px 12px;
      border: none;
      background: transparent;
      cursor: pointer;
      border-bottom: 2px solid transparent;
      transition: all 0.2s ease;
      font-size: 14px;
      color: #666;
    }
    
    .chat-tab.active {
      background: white;
      border-bottom-color: var(--primary, #6366f1);
      color: var(--primary, #6366f1);
      font-weight: 600;
    }
    
    .chat-tab:hover:not(.active) {
      background: #f0f0f0;
    }
    
    .tab-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    
    .tab-pane {
      flex: 1;
      display: none;
      flex-direction: column;
      overflow: hidden;
    }
    
    .tab-pane.active {
      display: flex;
    }
    
    .chat-messages {
      flex: 1;
      padding: 20px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 16px;
      background-color: #f8f9fa;
    }
    
    .chat-widget.maximized .chat-messages {
      padding: 24px;
    }
    
    body[data-layout="left-nav"] .chat-widget.maximized .chat-messages {
      padding: 30px;
      font-size: 1.05rem;
    }
    
    .chat-message {
      display: flex;
      align-items: flex-start;
      max-width: 85%;
      animation: fadeIn 0.3s ease;
    }
    
    .user-message {
      align-self: flex-end;
      flex-direction: row-reverse;
    }
    
    .system-message {
      align-self: center;
      background-color: #f0f0f0;
      padding: 8px 12px;
      border-radius: 12px;
      font-style: italic;
      color: #555;
    }
    
    .message-content {
      padding: 10px 14px;
      border-radius: 12px;
      line-height: 1.4;
    }
    
    .assistant-message .message-content {
      background-color: #f0f4fa;
      border: 1px solid #d0d7e2;
      color: #333333;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
    
    .user-message .message-content {
      background-color: var(--primary, #6366f1);
      color: white;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
    }
    
    .system-content {
      background-color: #ffeeee;
      border: 1px solid #ffcccc;
    }
    
    /* Enhanced retry and status button styles */
    .retry-actions {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 8px;
    }
    
    .retry-button, 
    .test-connection-button, 
    .status-button {
      background-color: var(--primary, #6366f1);
      color: white;
      border: none;
      border-radius: 6px;
      padding: 8px 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      display: block;
      margin: 0;
      font-size: 14px;
    }
    
    .retry-button:hover, 
    .test-connection-button:hover, 
    .status-button:hover {
      background-color: var(--primary-dark, #4244b8);
      transform: translateY(-1px);
    }
    
    .test-connection-button {
      background-color: #28a745;
    }
    
    .test-connection-button:hover {
      background-color: #218838;
    }
    
    .status-button {
      background-color: #17a2b8;
    }
    
    .status-button:hover {
      background-color: #138496;
    }
    
    .retry-info, 
    .status-info {
      font-size: 0.9em;
      color: #666;
      text-align: center;
      font-style: italic;
      margin-top: 4px;
    }
    
    .chat-input-container {
      padding: 12px;
      border-top: 1px solid #e1e4e8;
      display: flex;
      flex-direction: column;
      gap: 8px;
      background-color: #fff; /* Explicit background color for light mode */
    }
    
    .chat-widget.maximized .chat-input-container {
      padding: 16px;
      position: sticky;
      bottom: 0;
      background-color: #f8f9fa;
      box-shadow: 0 -2px 10px rgba(0,0,0,0.05);
    }
    
    body[data-layout="left-nav"] .chat-widget.maximized .chat-input-container {
      padding: 16px;
      position: sticky;
      bottom: 0;
      background-color: #f8f9fa;
      box-shadow: 0 -2px 10px rgba(0,0,0,0.05);
    }
    
    .chat-input {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid #e1e4e8;
      border-radius: 6px;
      resize: none;
      outline: none;
      font-family: inherit;
      font-size: 14px;
      transition: border-color 0.2s ease;
    }
    
    .chat-input:focus {
      border-color: var(--primary, #6366f1);
    }
    
    .chat-send {
      background-color: var(--primary, #6366f1);
      color: white;
      border: none;
      border-radius: 6px;
      padding: 8px 16px;
      font-weight: 600;
      cursor: pointer;
      transition: background-color 0.2s ease;
      align-self: flex-end;
    }
    
    .chat-send:hover:not(:disabled) {
      background-color: var(--primary-dark, #4244b8);
    }
    
    .chat-send:disabled {
      background-color: #ccc;
      cursor: not-allowed;
      opacity: 0.7;
    }
    
    .chat-counter {
      font-size: 12px;
      color: #888;
      text-align: right;
      margin-top: 4px;
    }
    
    .chat-counter.near-limit {
      color: #e74c3c;
    }
    
    .loading-dots {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 4px;
      padding: 4px;
    }
    
    .loading-dots span {
      display: inline-block;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background-color: var(--primary, #6366f1);
      opacity: 0.6;
      animation: dotPulse 1.4s infinite ease-in-out;
    }
    
    .loading-dots span:nth-child(2) {
      animation-delay: 0.2s;
    }
    
    .loading-dots span:nth-child(3) {
      animation-delay: 0.4s;
    }
    
    /* Dark Mode Styles */
    .chat-widget.dark-mode .chat-box {
      background-color: #1a1d21;
      border: 1px solid #333;
      box-shadow: 0 5px 25px rgba(0, 0, 0, 0.4);
    }
    
    .chat-widget.dark-mode .chat-tabs {
      background-color: #2a2d35;
      border-bottom-color: #3a3d45;
    }
    
    .chat-widget.dark-mode .chat-tab {
      color: #adb5bd;
    }
    
    .chat-widget.dark-mode .chat-tab.active {
      background-color: #212529;
      color: var(--primary, #6366f1);
    }
    
    .chat-widget.dark-mode .chat-tab:hover:not(.active) {
      background-color: #343a40;
    }
    
    .chat-widget.dark-mode .chat-messages {
      background-color: #212529;
    }
    
    .chat-widget.dark-mode .assistant-message .message-content {
      background-color: #2a2d35;
      border-color: #3a3d45;
      color: #e1e4e8;
    }
    
    .chat-widget.dark-mode .system-content {
      background-color: #342a2a;
      border-color: #5a3434;
      color: #e1e4e8;
    }
    
    .chat-widget.dark-mode .retry-info,
    .chat-widget.dark-mode .status-info {
      color: #aaa;
    }
    
    .chat-widget.dark-mode .chat-input {
      background-color: #2a2d35;
      border-color: #3a3d45;
      color: #e1e4e8;
    }
    
    .chat-widget.dark-mode .chat-input-container {
      border-color: #3a3d45;
      background-color: #212529; /* Adding background color for dark mode */
    }
    
    /* Ensure dark mode for the input container in maximized state */
    body[data-layout="left-nav"] .chat-widget.dark-mode.maximized .chat-input-container {
      background-color: #212529;
      border-top: 1px solid #3a3d45;
      box-shadow: 0 -2px 10px rgba(0,0,0,0.2);
    }
    
    .chat-widget.dark-mode .chat-counter {
      color: #adb5bd;
    }
    
    .chat-widget.dark-mode .chat-counter.near-limit {
      color: #e57373;
    }
    
    /* Debug mode styling - consistent for both light and dark mode */
    .trace-container {
      padding: 16px;
    }
    
    .trace-header {
      font-weight: bold;
      margin-bottom: 8px;
      color: #333;
    }
    
    .chat-widget.dark-mode .trace-header {
      color: #fff;
    }
    
    .trace-controls {
      display: flex;
      gap: 8px;
      align-items: center;
      flex-wrap: wrap;
    }
    
    .trace-controls button {
      background: #6366f1;
      color: white;
      border: none;
      border-radius: 4px;
      padding: 6px 12px;
      font-size: 12px;
      cursor: pointer;
      transition: background-color 0.2s ease;
    }
    
    .trace-controls button:hover {
      background: #4f46e5;
    }
    
    .debug-log {
      width: 100%;
      min-height: 200px;
      max-height: 400px;
      background: #000;
      color: #0f0;
      border: 1px solid #333;
      font-family: 'Consolas', monospace;
      font-size: 12px;
      line-height: 1.4;
      padding: 8px;
      overflow-y: auto;
    }
    
    .debug-entry {
      margin-bottom: 5px;
      padding: 3px 0;
      border-bottom: 1px dotted #333;
    }
    
    .debug-time {
      color: #888;
      margin-right: 8px;
    }
    
    .debug-prefix {
      color: #0088ff;
      font-weight: bold;
      margin-right: 8px;
    }
    
    .debug-message {
      color: #0f0;
    }
    
    .debug-input .debug-prefix {
      color: #ff8800;
    }
    
    .debug-outgoing .debug-prefix {
      color: #ff0088;
    }
    
    .debug-incoming .debug-prefix {
      color: #00ff88;
    }
    
    .debug-ui .debug-prefix {
      color: #8800ff;
    }
    
    .debug-error .debug-prefix {
      color: #ff0000;
    }
    
    .debug-success .debug-prefix {
      color: #00ff00;
    }
    
    .debug-warning .debug-prefix {
      color: #ffaa00;
    }
    
    .debug-toggle {
      display: flex;
      align-items: center;
      gap: 4px;
      color: #fff;
      font-size: 12px;
      cursor: pointer;
    }
    
    .debug-toggle input {
      margin: 0;
      cursor: pointer;
      width: 16px;
      height: 16px;
    }
    
    @keyframes dotPulse {
      0%, 100% { transform: scale(0.7); opacity: 0.5; }
      50% { transform: scale(1); opacity: 1; }
    }
    
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    @media (max-width: 480px) {
      .chat-box {
        width: calc(100vw - 40px);
        right: 0;
      }
      
      .chat-widget.maximized .chat-box {
        width: 100vw;
        height: 100vh;
        max-height: 100vh;
        right: 0;
        bottom: 0;
        border-radius: 0;
      }
      
      .retry-actions {
        flex-direction: column;
      }
      
      .retry-button, 
      .test-connection-button, 
      .status-button {
        width: 100%;
        margin-bottom: 4px;
      }
      
      .trace-controls {
        flex-direction: column;
        align-items: stretch;
      }
      
      .trace-controls button {
        width: 100%;
        margin-bottom: 4px;
      }
    }
  `;
  document.head.appendChild(style);
  
  // Only initialize the floating chat widget if <claude-chat> is NOT present
  if (!document.querySelector('claude-chat')) {
    initializeChatWidget();
  }
});

// Make the init function globally available for direct calls from HTML
window.initializeChatWidget = initializeChatWidget;
// Add an alias for backward compatibility
window.initChatWidget = initializeChatWidget;

// Handle load event as well to ensure the chat widget is initialized
// This is a fallback for cases where DOMContentLoaded might have already fired
window.addEventListener('load', () => {
  if (!window.drAlexChat) {
    console.log('No chat widget found on load, initializing...');
    initializeChatWidget();
  } else {
    console.log('Chat widget already exists on load, checking theme...');
    // Just check the theme since the widget already exists
    setTimeout(() => {
      const forceDarkModeCheck = () => {
        const isTestPage = window.location.pathname.includes('chat-test.html') || 
                          window.location.pathname.includes('simple-chat-test.html') ||
                          window.location.pathname.includes('improved-chat-test.html');
        const isDarkMode = isTestPage ? true : document.body.classList.contains('dark-mode');
        
        const chatWidget = document.querySelector('.chat-widget');
        if (chatWidget) {
          if (isDarkMode) {
            chatWidget.classList.add('dark-mode');
            chatWidget.classList.remove('light-mode');
          } else {
            chatWidget.classList.add('light-mode');
            chatWidget.classList.remove('dark-mode');
          }
          console.log(`Applied theme on load event: ${isDarkMode ? 'dark-mode' : 'light-mode'}`);
        }
      };
      
      forceDarkModeCheck();
    }, 500);
  }
});