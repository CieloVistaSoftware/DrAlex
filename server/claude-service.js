// Basic Claude API backend service implementation
import express from 'express';
import cors from 'cors';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Enhanced CORS configuration to accept requests from any origin during development
const corsOptions = {
  origin: function (origin, callback) {
    // Allow any origin in development
    callback(null, true);
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));

// Add OPTIONS preflight handler for all routes
app.options('*', cors(corsOptions));

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log('Request Headers:', req.headers);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Request Body:', JSON.stringify(req.body));
  }
  next();
});

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later'
});
app.use('/api/chat', limiter);

// System prompt for Claude
const SYSTEM_PROMPT = `
You are Dr. Alex's AI assistant for the eye care clinic website. Your role is to help visitors with information about eye care services, common eye conditions, scheduling appointments, and answering general questions about the clinic.

Important clinic information:
- Name: Dr. Alex Kisitu Eye Care
- Services: Comprehensive eye exams, contact lens fittings, vision therapy, prescription glasses
- Hours: Monday-Friday 9am-5pm, Saturday 10am-2pm
- Phone: (800) 888-8888
- Email: contact@dralexkisitu.com

Always be helpful, concise, and professional. If asked about specific medical advice, remind users that while you can provide general information, they should consult with Dr. Alex directly for personalized medical guidance.

When users want to book an appointment, guide them to the appointment form on the website or provide the clinic's phone number.
`;

// Function to validate Claude API key
const validateClaudeApiKey = (apiKey) => {
  if (!apiKey) return false;
  
  // Basic validation - Claude API keys typically start with "sk-ant-" and have a certain length
  // This is just a basic check and might need updates if Anthropic changes their key format
  return apiKey.startsWith('sk-ant-') && apiKey.length > 20;
};

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, conversationId, sessionHistory = [] } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    // Get API key from environment variable
    const apiKey = process.env.CLAUDE_API_KEY;
    if (!apiKey) {
      console.error('Claude API key not found in environment variables');
      console.warn('⚠️ Running in DEMO mode - no API key provided');
      console.warn('Please set the CLAUDE_API_KEY environment variable for production use');
      // Instead of failing, return a demo response
      return res.json({
        response: "This is a demo response. To enable the full AI functionality, please set the CLAUDE_API_KEY environment variable. No actual API call was made.",
        conversationId: conversationId || uuidv4(),
        timestamp: new Date().toISOString(),
        demo: true
      });
    }
    
    // Validate API key format
    if (!validateClaudeApiKey(apiKey)) {
      console.error('Invalid Claude API key format');
      return res.status(500).json({
        error: 'API configuration error',
        details: 'The CLAUDE_API_KEY environment variable is set, but the key appears to be invalid. Claude API keys typically start with "sk-ant-".',
        invalid: 'CLAUDE_API_KEY',
        keyPrefix: apiKey.substring(0, 7) // Only show the prefix for security
      });
    }
    
    // Log request details
    console.log('Processing chat request:');
    console.log('- Conversation ID:', conversationId || 'New conversation');
    console.log('- Message:', message);
    console.log('- Session history length:', sessionHistory.length);
    
    // Format messages for Claude API
    const messages = sessionHistory.length > 0 ? 
      sessionHistory : 
      [];
    
    // Add the current message
    messages.push({ role: "user", content: message });
    
    // Prepare request data for logging
    const requestData = {
      model: 'claude-3-opus-20240229',
      max_tokens: 1024,
      temperature: 0.7,
      system: SYSTEM_PROMPT,
      messages: messages
    };
    
    console.log('Sending request to Claude API:');
    console.log('- API Endpoint: https://api.anthropic.com/v1/messages');
    console.log('- Model:', requestData.model);
    
    // Call Claude API with detailed error handling
    let response;
    try {
      response = await axios.post(
        'https://api.anthropic.com/v1/messages',
        requestData,
        {
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01'
          }
        }
      );
      console.log('Claude API response received successfully');
    } catch (apiError) {
      // Extract detailed error information from Claude API
      console.error('Claude API Error:', apiError.message);
      
      if (apiError.response) {
        // The API responded with an error status
        console.error('Status:', apiError.response.status);
        console.error('Headers:', apiError.response.headers);
        console.error('Data:', JSON.stringify(apiError.response.data, null, 2));
        
        return res.status(apiError.response.status).json({
          error: 'Claude API Error',
          status: apiError.response.status,
          message: apiError.message,
          details: apiError.response.data
        });
      } else if (apiError.request) {
        // No response received from the API
        console.error('No response received from Claude API');
        return res.status(503).json({
          error: 'Claude API Unavailable',
          message: apiError.message,
          details: 'No response received from API server'
        });
      } else {
        // Error setting up the request
        console.error('Error setting up Claude API request:', apiError.message);
        return res.status(500).json({
          error: 'Request Configuration Error',
          message: apiError.message
        });
      }
    }
    
    // Return Claude's response
    const claudeResponse = response.data.content[0].text;
    const newConversationId = conversationId || uuidv4();
    
    return res.json({
      response: claudeResponse,
      conversationId: newConversationId,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error calling Claude API:', error.message);
    
    // Handle different types of errors
    if (error.response) {
      // The API responded with an error status code
      console.error('API Error Response:', error.response.data);
      return res.status(error.response.status).json({ 
        error: 'Error from Claude API',
        details: error.response.data.error?.message || 'Unknown API error'
      });
    } else if (error.request) {
      // The request was made but no response was received
      return res.status(503).json({ error: 'No response from Claude API, service may be unavailable' });
    } else {
      // Something else caused the error
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  // Check if API key is configured
  const apiKeyConfigured = Boolean(process.env.CLAUDE_API_KEY);
  const apiKeyValid = validateClaudeApiKey(process.env.CLAUDE_API_KEY || '');
  
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    config: {
      apiKeyConfigured,
      apiKeyValid,
      port: PORT,
      environment: process.env.NODE_ENV || 'development'
    }
  });
});

// Error simulation endpoint (for testing only, should be disabled in production)
app.get('/api/simulate-error/:type', (req, res) => {
  const errorType = req.params.type;
  
  switch(errorType) {
    case 'missing-key':
      return res.status(500).json({
        error: 'API configuration error',
        details: 'CLAUDE_API_KEY environment variable is not set. Please set this environment variable with a valid Claude API key.',
        missing: 'CLAUDE_API_KEY'
      });
      
    case 'invalid-key':
      return res.status(500).json({
        error: 'API configuration error',
        details: 'The CLAUDE_API_KEY environment variable is set, but the key appears to be invalid. Claude API keys typically start with "sk-ant-".',
        invalid: 'CLAUDE_API_KEY'
      });
      
    case 'rate-limit':
      return res.status(429).json({
        error: 'Rate limit exceeded',
        details: 'You have sent too many requests in a short period. Please wait and try again later.',
        retryAfter: 60
      });
      
    case 'server-error':
      return res.status(500).json({
        error: 'Internal server error',
        details: 'An unexpected error occurred while processing your request.',
        requestId: 'sim_' + Math.random().toString(36).substring(2, 15)
      });
      
    case 'claude-error':
      return res.status(502).json({
        error: 'Claude API Error',
        status: 400,
        message: 'Bad request to Claude API',
        details: {
          error: {
            type: 'invalid_request_error',
            message: 'Simulated error from Claude API for testing purposes'
          }
        }
      });
      
    default:
      return res.status(400).json({
        error: 'Unknown error simulation type',
        details: `Error type '${errorType}' is not supported for simulation`,
        validTypes: ['missing-key', 'invalid-key', 'rate-limit', 'server-error', 'claude-error']
      });
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Add a catch-all route for 404s
app.use((req, res) => {
  console.warn(`Route not found: ${req.method} ${req.url}`);
  res.status(404).json({
    error: 'Not Found',
    message: `The requested resource was not found: ${req.method} ${req.url}`
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Claude chat service running on port ${PORT}`);
  console.log(`Server environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`API endpoint available at: http://localhost:${PORT}/api/chat`);
  
  // Check if API key is set
  if (!process.env.CLAUDE_API_KEY) {
    console.warn('\n⚠️  WARNING: CLAUDE_API_KEY environment variable is not set');
    console.warn('Running in DEMO mode - AI responses will be simulated');
    console.warn('To enable the full AI functionality, set the CLAUDE_API_KEY environment variable');
    console.warn('For more information, please check the readme.html documentation\n');
  } else {
    console.log('✅ CLAUDE_API_KEY environment variable is set');
  }
});

export default app; // For testing
