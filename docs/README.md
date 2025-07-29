# Dr. Alex Kisitu - Claude AI Chat Service

This directory contains the backend service that powers the Claude AI chat functionality for the Dr. Alex Kisitu website. The service integrates with Anthropic's Claude AI to provide an intelligent chat assistant for website visitors.

## Setup Instructions

### Prerequisites

- Node.js v18 or higher
- A valid Claude API key (from Anthropic)

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file based on the `.env.template` file:
   ```bash
   cp .env.template .env
   ```

3. Set up your environment variables:
   - The Claude API key should be set as a system environment variable `CLAUDE_API_KEY`
   - For development, you can add it to your `.env` file, but ensure this file is not committed to version control
   - For production, set the environment variable on your hosting platform

### Running the Service

For development:
```bash
npm run dev
```

For production:
```bash
npm start
```

## API Endpoints

### POST /api/chat

Creates a new chat message and gets a response from Claude.

**Request Body:**
```json
{
  "message": "User's question about eye care",
  "conversationId": "unique-conversation-id-123", // Optional for new conversations
  "sessionHistory": [] // Optional for new conversations
}
```

**Response:**
```json
{
  "response": "Claude's response text",
  "conversationId": "unique-conversation-id-123",
  "timestamp": "2025-07-11T14:30:00Z"
}
```

### GET /api/health

Health check endpoint to verify the service is running.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-07-11T14:30:00Z"
}
```

## Integration with Frontend

The `chat-widget.js` file in the main project directory provides a complete implementation of a chat widget that integrates with this backend service.

To include the chat widget in your website, add the following script tag to your HTML:

```html
<script src="js/chat-widget.js"></script>
```

## Security Considerations

- The Claude API key is stored as a system environment variable and is never exposed to client-side code
- CORS is configured to only allow requests from the specified origin
- Rate limiting is implemented to prevent API abuse
- Input validation is performed on all incoming requests

## Monitoring and Maintenance

- API usage is logged for debugging and usage tracking
- The service can be monitored through standard Node.js monitoring tools
- Update the Claude model version in the `.env` file when new models are released

## Troubleshooting

Common issues:

1. **API Key Issues**: Ensure the `CLAUDE_API_KEY` environment variable is correctly set
2. **CORS Errors**: Check that the `ALLOWED_ORIGIN` matches your frontend domain
3. **Rate Limiting**: If you're seeing 429 errors, you may need to adjust the rate limiting settings

For additional help, check the Anthropic API documentation or contact technical support.
