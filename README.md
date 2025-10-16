# ThinkTrove

ThinkTrove is an educational AI platform that allows teachers to configure AI-powered learning experiences for students. It leverages the Groq LLaMA 3.3 model to create engaging, personalized educational interactions.

### Project Live at https://ankityande.github.io/ThinkTrove/

```
NOTE: This server is hosted by the Free Tier of Render.
As a result, servers may spin down. Please allow up to 1min for server to start
```

## Features

- **Teacher Interface:**
  - Create lesson configurations with detailed parameters
  - Customize AI behavior (tone, scaffolding level, etc.)
  - Define valid hypotheses, misconceptions, and concepts
  - Manage (create, edit, delete) lesson configurations

- **Student Interface:**
  - Select from available lessons
  - Chat with the AI tutor
  - Receive personalized guidance based on teacher's configuration

- **Backend:**
  - RESTful API for lesson configuration management
  - Integration with Groq's LLaMA 3.3 model
  - System prompt generation from teacher parameters

## Project Structure

```
thinktrove/
├── client/             # Frontend React application
│   ├── src/
│   │   ├── components/ # React components
│   │   ├── services/   # API integration services
│   │   ├── App.jsx     # Main application component
│   │   └── ...         # Other React files
│   ├── .env            # Environment variables
│   └── .env.example    # Example environment variables
├── server/             # Backend Express API
│   ├── src/
│   │   ├── data/       # JSON storage for configurations
│   │   ├── routes/     # API endpoints
│   │   ├── services/   # Groq integration
│   │   ├── tests/      # Server tests
│   │   └── utils/      # Shared utility functions
│   ├── .env            # Environment variables 
│   └── .env.example    # Example environment variables
└── README.md
```

## Code Organization

The project follows these code organization principles:

- **Component-Based Architecture**: UI elements are organized into reusable components
- **Service Layer Pattern**: API calls are abstracted in service modules
- **Utility Functions**: Common functionality is extracted into utility files
- **Environment Configuration**: Environment-specific settings use .env files
- **Error Handling**: Consistent error handling patterns throughout the application
- **Testing**: Unit and integration tests for backend functionality

## Getting Started

### Prerequisites

- Node.js (v16+)
- npm
- Groq API key (for AI integration)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/thinktrove.git
   cd thinktrove
   ```

2. Install dependencies for both client and server:
   ```
   # Install client dependencies
   cd client
   npm install
   
   # Install server dependencies
   cd ../server
   npm install
   ```

3. Set up environment variables:
   - Create `.env` files in both client and server directories based on the `.env.example` files
   - Add your Groq API key to the server's `.env` file

### Running the Application

1. Start the backend server:
   ```
   cd server
   npm run dev
   ```

2. Start the frontend development server:
   ```
   cd client
   npm run dev
   ```

3. Access the application at `http://localhost:5173`

## Usage

### Teacher Flow

1. Navigate to the "Teacher" tab
2. Click "Create Lesson" to create a new lesson or "Manage Lessons" to edit existing ones
3. Fill in the lesson configuration form:
   - Basic information (title, grade level, subject)
   - Learning objectives and phases
   - Valid hypotheses and misconceptions
   - Tone and scaffolding settings
4. Save the configuration
5. Use the manage lessons view to edit or delete existing lessons

### Student Flow

1. Navigate to the "Students" tab
2. Select a lesson from the dropdown
3. The AI will automatically begin the lesson
4. Interact with the AI tutor through the chat interface
5. Receive personalized guidance based on the teacher's configuration

## Testing

### Server Tests

Run the server tests with:
```
cd server
npm test
```

These tests cover:
- Configuration API endpoints
- Chat API functionality
- Groq service and system prompt generation
- Full integration testing

## Best Practices

This project follows these best practices:

- **Clean, Readable Code**: Well-organized and commented for maintainability
- **Environment-Specific Configuration**: Settings for dev, test, and prod environments
- **Comprehensive Error Handling**: Clear error messages and edge case handling
- **Performance Optimization**: Minimized unnecessary rendering and network calls
- **Security**: Input validation, error sanitization, and secure API key storage
- **Component Reusability**: Components designed for maximum reuse
- **Responsive Design**: UI adapts to different screen sizes

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Future Enhancements

- User authentication for teachers and students
- Database to hold user generated lessons
- History of student conversations
- Analytics dashboard for teachers
- Additional AI model options
- Mobile application 
