// Chat widget component for Dr. Alex Kisitu website
class ChatWidget {
  constructor() {
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
    
    // Try to retrieve existing conversation from localStorage
    this.loadConversation();
    
    // Create chat widget DOM elements
    this.createChatWidget();
    
    // Add event listeners
    this.addEventListeners();
  }
  
  createChatWidget() {
    // Get current mode (dark/light) from the document
    const isDarkMode = document.body.classList.contains('dark-mode');
    
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
          <h3>Dr. Alex's Assistant</h3>
          <div class="chat-controls">
            <button class="maximize-button" title="Maximize chat window">
              <span class="maximize-icon">⬜</span>
              <span class="minimize-icon">⟱</span>
            </button>
          </div>
        </div>
        <div class="chat-messages"></div>
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
    document.body.appendChild(this.container);
    
    // Cache DOM elements
    this.chatBox = this.container.querySelector('.chat-box');
    this.messagesContainer = this.container.querySelector('.chat-messages');
    this.inputField = this.container.querySelector('.chat-input');
    this.sendButton = this.container.querySelector('.chat-send');
    this.toggleButton = this.container.querySelector('.chat-toggle');
    this.charCounter = this.container.querySelector('.chat-counter');
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
  }
  
  updateTheme() {
    const isDarkMode = document.body.classList.contains('dark-mode');
    this.container.classList.toggle('dark-mode', isDarkMode);
    this.container.classList.toggle('light-mode', !isDarkMode);
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
  
  async sendMessage() {
    const message = this.inputField.value.trim();
    if (!message || this.isLoading) return;
    
    // Add user message to UI
    this.addMessage({
      role: 'user',
      content: message
    });
    
    // Clear input field
    this.inputField.value = '';
    this.sendButton.disabled = true;
    this.charCounter.textContent = '0/500';
    
    // Show loading indicator
    this.isLoading = true;
    this.addLoadingIndicator();
    
    try {
      // Add to session history
      this.sessionHistory.push({
        role: 'user',
        content: message
      });
      
      console.log(`Sending request to API endpoint: ${this.apiUrl}`);
      
      // Call API
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: message,
          conversationId: this.conversationId,
          sessionHistory: this.sessionHistory
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API Response Status: ${response.status} ${response.statusText}`);
        console.error(`API Response Body: ${errorText}`);
        
        // Try to parse the error response as JSON
        let responseData;
        try {
          responseData = JSON.parse(errorText);
        } catch (e) {
          // If it's not valid JSON, use the raw text
          responseData = { error: 'Parse Error', details: errorText };
        }
        
        // Create a custom error with the response data
        const apiError = new Error(`API error: ${response.status} ${response.statusText}`);
        apiError.status = response.status;
        apiError.statusText = response.statusText;
        apiError.responseData = responseData;
        
        throw apiError;
      }
      
      const data = await response.json();
      console.log("API Response received:", data);
      
      // Store conversation ID
      this.conversationId = data.conversationId;
      
      // Remove loading indicator
      this.removeLoadingIndicator();
      
      // Add Claude response to UI
      const assistantMessage = {
        role: 'assistant',
        content: data.response
      };
      
      this.addMessage(assistantMessage);
      
      // Add to session history
      this.sessionHistory.push(assistantMessage);
      
      // Save conversation to localStorage
      this.saveConversation();
      
    } catch (error) {
      console.error('Error sending message:', error);
      console.error('Error details:', error.stack);
      
      // Default error message
      let errorMessage = 'Sorry, there was an error processing your request. Please try again later.';
      let errorDetails = '';
      
      try {
        // Try to extract detailed error information from the response
        if (error.responseData) {
          // If we have parsed error data
          const errorData = error.responseData;
          errorMessage = `Error: ${errorData.error || 'Unknown error'}`;
          
          if (errorData.details) {
            // Handle structured error details
            if (typeof errorData.details === 'object') {
              errorDetails = JSON.stringify(errorData.details, null, 2);
            } else {
              errorDetails = errorData.details;
            }
          } else if (errorData.message) {
            errorDetails = errorData.message;
          }
        } 
        // Handle specific HTTP status errors
        else if (error.message && error.message.includes('405')) {
          errorMessage = 'Server configuration issue: Method not allowed.';
          errorDetails = 'Please ensure the server is properly configured to accept POST requests.';
        } else if (error.message && error.message.includes('404')) {
          errorMessage = 'API endpoint not found.';
          errorDetails = 'Please check the server URL configuration.';
        } else if (error.message && error.message.includes('Failed to fetch')) {
          errorMessage = 'Unable to connect to the chat server.';
          errorDetails = 'The server may be offline or not properly configured.';
        } else if (error.message && error.message.includes('API error')) {
          // Try to extract more information from the error message
          const match = error.message.match(/API error: (.+)/);
          if (match && match[1]) {
            errorMessage = `Server returned: ${match[1]}`;
          }
        }
      } catch (parsingError) {
        console.error('Error while parsing error details:', parsingError);
        errorDetails = 'Additional error details could not be parsed.';
      }
      
      this.removeLoadingIndicator();
      
      // Display both the error message and details
      this.addMessage({
        role: 'system',
        content: `${errorMessage}\n\n${errorDetails ? 'Details: ' + errorDetails : ''}`
      });
      
      // Also add a help message
      this.addMessage({
        role: 'system',
        content: 'If this problem persists, please contact our support team or try again later.'
      });
    }
    
    // Reset loading state
    this.isLoading = false;
    
    // Scroll to bottom
    this.scrollToBottom();
  }
  
  addMessage({ role, content }) {
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
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Line breaks
      .replace(/\n/g, '<br>');
      
    return formatted;
  }
  
  addLoadingIndicator() {
    const loadingEl = document.createElement('div');
    loadingEl.className = 'chat-message assistant-message loading-message';
    loadingEl.innerHTML = `
      <div class="message-content">
        <div class="loading-dots">
          <span></span><span></span><span></span>
        </div>
      </div>
    `;
    loadingEl.id = 'loading-indicator';
    this.messagesContainer.appendChild(loadingEl);
    this.scrollToBottom();
  }
  
  removeLoadingIndicator() {
    const loadingIndicator = document.getElementById('loading-indicator');
    if (loadingIndicator) {
      loadingIndicator.remove();
    }
  }
  
  scrollToBottom() {
    this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
  }
  
  saveConversation() {
    const conversationData = {
      conversationId: this.conversationId,
      sessionHistory: this.sessionHistory,
      timestamp: new Date().toISOString()
    };
    
    localStorage.setItem('drAlexChat', JSON.stringify(conversationData));
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
}

// Initialize chat widget when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Add CSS for chat widget
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
    
    /* Removed fullscreen chat box styles */
    
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
      min-height: 36px;
    }
    
    body[data-layout="left-nav"] .chat-widget.maximized .chat-header {
      border-radius: 0; /* No border radius when maximized in left-nav layout */
    }
    
    .chat-controls {
      display: flex;
      gap: 8px;
    }
    
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
    
    .maximize-button:hover {
      background: rgba(255, 255, 255, 0.2);
    }
    
    .maximize-icon, .minimize-icon {
      position: absolute;
      transition: opacity 0.3s ease, transform 0.3s ease;
    }
    
    .minimize-icon {
      opacity: 0;
      transform: scale(0.5);
    }
    
    .chat-widget.maximized .maximize-icon {
      opacity: 0;
      transform: scale(0.5);
    }
    
    .chat-widget.maximized .minimize-icon {
      opacity: 1;
      transform: scale(1);
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
    
    /* Removed avatar styles and kept only message styles */
    
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
    }
  `;
  document.head.appendChild(style);
  
  try {
    // Initialize chat widget
    console.log('Initializing Dr. Alex Chat Widget...');
    window.drAlexChat = new ChatWidget();
    console.log('Chat widget initialized successfully');
  } catch (error) {
    console.error('Error initializing chat widget:', error);
  }
});
