# ThinkTrove API Server

Backend API for the ThinkTrove educational AI application.

## Features

- Configuration management endpoints for lesson settings
- Chat endpoint with automatic lesson initialization
- Integration with Groq LLaMA 3.3 AI model
- Simple JSON-based storage for lesson configurations
- Robust error handling and input validation

## Setup

1. Install dependencies
   ```
   npm install
   ```

2. Create a `.env` file based on `.env.example`
   ```
   cp .env.example .env
   ```

3. Add your Groq API key to the `.env` file
   ```
   GROQ_API_KEY=your_api_key_here
   ```

## Running the Server

### Development Mode
```
npm run dev
```

### Production Mode
```
npm start
```

## API Endpoints

### Configuration Management

- `GET /api/config` - Get all configurations
- `POST /api/config` - Create a new configuration
- `PUT /api/config/:id` - Update a configuration
- `DELETE /api/config/:id` - Delete a configuration
- `GET /api/config/:id` - Get configuration by ID

### Chat

- `POST /api/chat` - Process a chat message with the AI

  Request body:
  ```json
  {
    "configId": "config-id-here",
    "messages": [
      { "role": "user", "content": "message here" }
    ]
  }
  ```

  Response:
  ```json
  {
    "response": "AI response here"
  }
  ```

  Notes:
  - The first message with content "start lesson" will initialize the lesson
  - Subsequent messages will continue the conversation
  - The AI maintains context throughout the chat session

## Environment Variables

- `PORT` - Server port (default: 5000)
- `GROQ_API_KEY` - Your Groq API key
- `GROQ_MODEL` - Model to use (default: llama-3.3-70b-versatile)
- `TEMPERATURE` - Temperature setting for AI responses (default: 0.7)
- `MAX_TOKENS` - Maximum tokens for AI responses (default: 1000)

## Error Handling

The API implements comprehensive error handling:

- Invalid requests return appropriate HTTP status codes
- Error responses include descriptive messages
- API key validation and request validation
- Rate limiting and timeout handling

## Testing

Run the test suite:
```
npm test
```

Tests cover:
- Configuration CRUD operations
- Chat functionality
- Error handling
- Input validation
- AI integration 