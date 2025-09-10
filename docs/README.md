# Welcome to the Dr. Alex Kisitu Chat Service

This directory provides everything you need to use the intelligent chat assistant on the Dr. Alex Kisitu website. Whether you're a patient, visitor, or simply exploring, our chat service—powered by Claude AI—offers friendly, helpful answers to your questions about eye care and our services. No technical expertise is required; just follow the simple instructions below to get started or learn more.

## How Pages Are Rendered

The Dr. Alex Kisitu website is built as a modern single-page application (SPA). Instead of traditional static HTML pages, all site content is dynamically rendered using JavaScript. The main application loads content from structured JSON files and injects it into the page, allowing for fast navigation and seamless updates without full page reloads. This approach ensures that:
- Navigation between sections is instant and smooth.
- Content updates can be made centrally in JSON, without editing multiple HTML files.
- The user experience is consistent and responsive across devices.

Custom components, such as the chat widget, are loaded and rendered dynamically as well. This architecture makes the site easy to maintain, extend, and personalize for visitors.

## Setup Instructions

### Download the Repository

First, download or clone the repository to your local machine:
```bash
git clone https://github.com/CieloVistaSoftware/DrAlex.git
cd DrAlex
```

### Prerequisites

- Node.js v18 or higher
- A valid Claude API key (from Anthropic)

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up your environment variables:
   - The Claude API key should be set as a system environment variable `CLAUDE_API_KEY`
   - For production, set the environment variable on your hosting platform

### Running the Service

To start the website locally, run one of the following commands:

For development:
```bash
npm run dev
```

For production:
```bash
npm start
```

Once started, open your browser and visit:
```
http://localhost:5000
```
(or the port shown in your terminal) to view and use the Dr. Alex Kisitu website and chat service.

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

- **Never store your Claude API key in the repository.** Always use a system environment variable to keep your API key secure and private.
- The Claude API key is stored as a system environment variable and is never exposed to client-side code
- CORS is configured to only allow requests from the specified origin
- Rate limiting is implemented to prevent API abuse
- Input validation is performed on all incoming requests

## Monitoring and Maintenance

- API usage is logged for debugging and usage tracking. By default, service logs are output to the terminal or command prompt where you start the server (using `npm run dev` or `npm start`).
- To save logs to a file, start the service with:
  ```bash
  npm start > service.log 2>&1
  ```
  This creates a file named `service.log` in your project’s root folder (`DrAlex/`).
- To view the log file, open `service.log` in your project folder with any text editor, or use a command like:
  ```bash
  type service.log
  ```
  (on Windows) or
  ```bash
  cat service.log
  ```
  (on Mac/Linux)
- The service can be monitored through standard Node.js monitoring tools
- Update the Claude model version in the environment variable when new models are released

## Troubleshooting

Common issues:

1. **API Key Issues**: Ensure the `CLAUDE_API_KEY` environment variable is correctly set
2. **CORS Errors**: Check that the `ALLOWED_ORIGIN` matches your frontend domain
3. **Rate Limiting**: If you're seeing 429 errors, you may need to adjust the rate limiting settings

For additional help, check the Anthropic API documentation or contact technical support.
