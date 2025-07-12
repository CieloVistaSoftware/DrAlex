# Claude AI Chat Backend Service Specification

## Overview

This document outlines the specifications for implementing a backend service that integrates Claude AI for the Dr. Alex Kisitu website. This service will enable visitors to ask questions about eye care services, book appointments, or get general information through an AI assistant powered by Anthropic's Claude.

## Technical Requirements

### API Access and Authentication

- The Claude API key is stored in a system environment variable named `CLAUDE_API_KEY`
- The backend service must securely access this key without exposing it to client-side code
- All API requests must include proper authentication headers
- Rate limiting must be implemented to prevent API overuse

### Backend Implementation

#### Server Requirements

- **Node.js Server**: Express.js based backend
- **Endpoint**: `/api/chat` 
- **Method**: POST
- **Port**: 3000 (configurable via environment variables)
- **CORS**: Enabled for the website domain only

#### Request Format

```json
{
  "message": "User's question about eye care",
  "conversationId": "unique-conversation-id-123",
  "sessionHistory": [
    {"role": "user", "content": "Previous user message"},
    {"role": "assistant", "content": "Previous Claude response"}
  ]
}
```

#### Response Format

```json
{
  "response": "Claude's response text",
  "conversationId": "unique-conversation-id-123",
  "timestamp": "2025-07-11T14:30:00Z"
}
```

### Claude API Integration

#### API Version
- Use Claude API v1.0 or later
- Endpoint: `https://api.anthropic.com/v1/messages`

#### Model Parameters
- **Model**: claude-3-opus-20240229 (preferred) or claude-3-sonnet-20240229 (fallback)
- **Temperature**: 0.7 (configurable)
- **Max Tokens**: 1024 (configurable)
- **Top P**: 0.9
- **System Prompt**: Specialized prompt for eye care assistant (see below)

#### System Prompt Template

```
You are Dr. Alex's AI assistant for the eye care clinic website. Your role is to help visitors with information about eye care services, common eye conditions, scheduling appointments, and answering general questions about the clinic.

Important clinic information:
- Name: Dr. Alex Kisitu Eye Care
- Services: Comprehensive eye exams, contact lens fittings, vision therapy, prescription glasses
- Hours: Monday-Friday 9am-5pm, Saturday 10am-2pm
- Phone: (800) 888-8888
- Email: contact@dralexkisitu.com

Always be helpful, concise, and professional. If asked about specific medical advice, remind users that while you can provide general information, they should consult with Dr. Alex directly for personalized medical guidance.

When users want to book an appointment, guide them to the appointment form on the website or provide the clinic's phone number.
```

## Frontend Integration

### Chat Interface Requirements

- Implement a collapsible chat widget in the bottom-right corner of the website
- Design must match the website's theme and color scheme
- Mobile responsive design
- Loading states and error handling
- Support for markdown formatting in responses
- Character counter to show users their message length
- Session persistence using localStorage

### User Experience Flow

1. User clicks on chat icon in the corner of the website
2. Chat widget expands
3. Initial welcome message from Claude is displayed
4. User types and sends their question
5. Loading indicator appears during API call
6. Claude's response is displayed with proper formatting
7. Conversation continues with message history maintained
8. User can collapse the widget at any time

## Implementation Phases

### Phase 1: Backend Setup (Week 1)
- Set up Express.js server
- Create Claude API integration
- Implement secure environment variable handling
- Create basic API endpoint with error handling
- Test with Postman/cURL

### Phase 2: Frontend Integration (Week 2)
- Design and implement chat widget UI
- Connect to backend API
- Implement conversation state management
- Add loading states and error handling

### Phase 3: Enhancement and Testing (Week 3)
- Add conversation history persistence
- Implement analytics to track common questions
- Optimize Claude system prompt based on common queries
- Cross-browser and mobile testing
- Security review

## Security Considerations

- Never expose the API key in client-side code
- Implement rate limiting to prevent abuse
- Add CORS protection to restrict API access to authorized domains
- Consider implementing user session validation
- Log API usage for monitoring purposes
- Sanitize all user input before sending to API
- Implement proper error handling to avoid information leakage

## Monitoring and Maintenance

- Log all API calls for debugging and usage tracking
- Monitor API usage against rate limits
- Review conversation logs periodically to improve system prompts
- Update the Claude model version when new improvements are available
- Perform regular security reviews

## Cost Considerations

- Claude API usage is billed based on token usage
- Implement token counting and budgeting features
- Set up alerts for unusual usage patterns
- Consider adding user quotas if necessary

## Future Enhancements

- Multi-language support
- Voice input/output options
- Integration with appointment scheduling system
- Custom training for Claude on eye care specific terminology
- Knowledge base integration for more accurate clinic-specific information