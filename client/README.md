# ThinkTrove Client

ThinkTrove is an interactive learning platform that allows teachers to create custom lesson plans and students to engage with AI-powered learning experiences.

## Features

- **Teacher Interface**: 
  - Create, edit, and delete scientific inquiry lessons
  - Customize AI behavior and teaching parameters
  - Manage lesson configurations through an intuitive interface

- **Student Interface**: 
  - Select from available lessons
  - Automatic lesson initiation with AI tutor
  - Interactive chat-based learning experience

- **Responsive Design**: 
  - Works across desktop and mobile devices
  - Clean, modern user interface
  - Intuitive navigation and form controls

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Navigate to the client directory:
   ```
   cd client
   ```
3. Install dependencies:
   ```
   npm install
   ```
4. Copy the example environment file:
   ```
   cp .env.example .env
   ```
5. Edit the `.env` file to add your API URL

### Development

Run the development server:

```
npm run dev
```

The application will be available at [http://localhost:5173](http://localhost:5173)

### Building for Production

To create a production build:

```
npm run build
```

The build will be available in the `dist` directory.

## Project Structure

```
src/
├── components/         # React components
│   ├── chat/          # Chat interface components
│   ├── teacher/       # Teacher interface components
│   ├── students/      # Student interface components
│   └── navbar/        # Navigation components
├── services/          # API service functions
├── assets/           # Static assets
├── App.jsx           # Main application component
├── index.css         # Global CSS styles
└── App.css           # Application-specific styles
```

## Components

### Teacher View
- Lesson creation and management interface
- Form-based configuration
- List view of existing lessons
- Edit and delete functionality

### Chat View
- Lesson selector
- Automatic lesson initialization
- Real-time chat interface
- Markdown support for AI responses

### Student View
- Lesson selection
- Interactive chat interface
- Real-time response handling

## Technologies

- React 18+
- Vite
- CSS Modules
- React Markdown
