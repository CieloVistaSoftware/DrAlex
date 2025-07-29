
import express from 'express';
import cors from 'cors';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import multer from 'multer';
import { Buffer } from 'buffer';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to capture raw body for multipart/form-data
app.use((req, res, next) => {
  if (req.method === 'POST' && req.is('multipart/form-data')) {
    let data = [];
    req.on('data', chunk => data.push(chunk));
    req.on('end', () => {
      req.rawBody = Buffer.concat(data);
      next();
    });
  } else {
    next();
  }
});

// Configure multer for image uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB limit
  },
  fileFilter: (req, file, cb) => {
    // Claude supports these image types
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}. Supported types: ${allowedTypes.join(', ')}`));
    }
  }
});

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    callback(null, true);
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later'
});
app.use('/api/chat', limiter);

// System prompt
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

// Helper function to convert image to base64
function imageToBase64(buffer, mimetype) {
  const base64 = buffer.toString('base64');
  return `data:${mimetype};base64,${base64}`;
}

// Helper function to get media type for Claude API
function getClaudeMediaType(mimetype) {
  const typeMap = {
    'image/jpeg': 'image/jpeg',
    'image/jpg': 'image/jpeg',
    'image/png': 'image/png',
    'image/gif': 'image/gif',
    'image/webp': 'image/webp'
  };
  return typeMap[mimetype.toLowerCase()] || 'image/jpeg';
}

// Chat endpoint with proper Claude image handling
app.post('/api/chat', upload.single('image'), async (req, res) => {
  try {
    console.log('--- Chat Request Debug ---');
    // Log all headers
    console.log('Request Headers:', req.headers);
    // Log Content-Type
    console.log('Content-Type:', req.get('Content-Type'));
    // Log all body fields and their values
    if (req.body && typeof req.body === 'object') {
      Object.entries(req.body).forEach(([key, value]) => {
        console.log(`Body field: ${key} =`, value);
      });
    } else {
      console.log('No req.body or not an object:', req.body);
    }
    // Log file info if present
    console.log('File present:', !!req.file);
    if (req.file) {
      console.log('File details:', {
        fieldname: req.file.fieldname,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size
      });
    }
    // Log raw body if available (for debugging)
    if (req.rawBody) {
      console.log('Raw body length:', req.rawBody.length);
    }
    console.log('--- End Chat Request Debug ---');

    // Extract data from request
    let { message, conversationId, sessionHistory } = req.body;
    
    // Parse sessionHistory if it's a string (from FormData)
    if (typeof sessionHistory === 'string') {
      try {
        sessionHistory = JSON.parse(sessionHistory);
      } catch (e) {
        console.warn('Failed to parse sessionHistory:', e.message);
        sessionHistory = [];
      }
    }
    sessionHistory = sessionHistory || [];

    // Validate input
    if (!message && !req.file) {
      return res.status(400).json({ 
        error: 'Either message text or image is required' 
      });
    }

    // Check API key
    const apiKey = process.env.CLAUDE_API_KEY;
    if (!apiKey) {
      console.warn('⚠️ Running in DEMO mode - no API key provided');
      return res.json({
        response: "This is a demo response. To enable the full AI functionality, please set the CLAUDE_API_KEY environment variable.",
        conversationId: conversationId || uuidv4(),
        timestamp: new Date().toISOString(),
        demo: true
      });
    }

    // Prepare messages array
    const messages = [...sessionHistory];
    
    // Create the user message content
    let userContent = [];
    
    // Add text if present
    if (message && message.trim()) {
      userContent.push({
        type: "text",
        text: message.trim()
      });
    }
    
    // Add image if present
    if (req.file) {
      const base64Data = req.file.buffer.toString('base64');
      const claudeMediaType = getClaudeMediaType(req.file.mimetype);
      
      userContent.push({
        type: "image",
        source: {
          type: "base64",
          media_type: claudeMediaType,
          data: base64Data
        }
      });
      
      console.log(`Image added to message: ${claudeMediaType}, ${base64Data.length} base64 chars`);
    }
    
    // Add user message to messages array
    if (userContent.length > 0) {
      messages.push({
        role: "user",
        content: userContent
      });
    }

    // Prepare Claude API request
    const requestData = {
      model: 'claude-3-5-sonnet-20241022', // Updated to latest model that supports vision
      max_tokens: 1024,
      temperature: 0.7,
      system: SYSTEM_PROMPT,
      messages: messages
    };

    console.log('Sending request to Claude API...');
    console.log('Message count:', messages.length);
    console.log('Last message content types:', messages[messages.length - 1]?.content?.map(c => c.type));

    // Call Claude API
    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      requestData,
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        timeout: 30000 // 30 second timeout
      }
    );

    console.log('Claude API response received successfully');
    
    // Extract response text
    const claudeResponse = response.data.content[0].text;
    const newConversationId = conversationId || uuidv4();

    // Update session history for next request
    const updatedHistory = [...messages];
    updatedHistory.push({
      role: "assistant",
      content: [{ type: "text", text: claudeResponse }]
    });

    return res.json({
      response: claudeResponse,
      conversationId: newConversationId,
      sessionHistory: updatedHistory,
      timestamp: new Date().toISOString(),
      hasImage: !!req.file
    });

  } catch (error) {
    console.error('Error in chat endpoint:', error.message);
    
    if (error.response) {
      // Claude API error
      console.error('Claude API Error:', {
        status: error.response.status,
        data: error.response.data
      });
      
      return res.status(error.response.status).json({
        error: 'Claude API Error',
        message: error.response.data?.error?.message || 'Unknown API error',
        details: error.response.data
      });
    } else if (error.request) {
      // Network error
      return res.status(503).json({
        error: 'Service Unavailable',
        message: 'Could not reach Claude API'
      });
    } else if (error.code === 'LIMIT_FILE_SIZE') {
      // File too large
      return res.status(413).json({
        error: 'File Too Large',
        message: 'Image file must be smaller than 20MB'
      });
    } else {
      // Other errors
      return res.status(500).json({
        error: 'Internal Server Error',
        message: error.message
      });
    }
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  const apiKeyConfigured = Boolean(process.env.CLAUDE_API_KEY);
  
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    config: {
      apiKeyConfigured,
      port: PORT,
      environment: process.env.NODE_ENV || 'development',
      supportedImageTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      maxFileSize: '20MB'
    }
  });
});

// Test endpoint for image upload
app.post('/api/test-image', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file uploaded' });
    }

    const base64Data = req.file.buffer.toString('base64');
    const claudeMediaType = getClaudeMediaType(req.file.mimetype);

    res.json({
      success: true,
      file: {
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        claudeMediaType: claudeMediaType,
        base64Length: base64Data.length
      },
      message: 'Image processed successfully and ready for Claude API'
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Error processing image', 
      message: error.message 
    });
  }
});

// Error handler for multer errors
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        error: 'File Too Large',
        message: 'Image file must be smaller than 20MB'
      });
    }
    return res.status(400).json({
      error: 'File Upload Error',
      message: error.message
    });
  }
  
  if (error.message.includes('Unsupported file type')) {
    return res.status(400).json({
      error: 'Unsupported File Type',
      message: error.message
    });
  }
  
  next(error);
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Claude chat service running on port ${PORT}`);
  console.log(`Image upload endpoint: http://localhost:${PORT}/api/chat`);
  console.log(`Test endpoint: http://localhost:${PORT}/api/test-image`);
  
  if (!process.env.CLAUDE_API_KEY) {
    console.warn('⚠️  WARNING: CLAUDE_API_KEY not set - running in demo mode');
  } else {
    console.log('✅ Claude API key configured');
  }
});

export default app;