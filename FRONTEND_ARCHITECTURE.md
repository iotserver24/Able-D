# Able-D Frontend Architecture & Implementation Guide

## Overview

The Able-D frontend is a React-based adaptive learning platform designed for students with special needs. It provides personalized learning experiences through accessibility features, Text-to-Speech (TTS), and adaptive UI components.

## Technology Stack

- **Framework**: React 19.1.0 with React Router v7
- **Styling**: Tailwind CSS v4
- **Build Tool**: Vite
- **Authentication**: JWT-based with localStorage
- **Audio**: Web Speech API for TTS
- **State Management**: React Context API

## Project Structure

```
frontend/
├── app/
│   ├── components/          # Reusable UI components
│   │   ├── adaptive/       # Accessibility components
│   │   ├── auth/           # Authentication components
│   │   ├── icons/          # Icon components
│   │   ├── tts/            # Text-to-Speech components
│   │   └── ui/             # Basic UI components
│   ├── config/             # Configuration files
│   ├── constants/          # App constants and types
│   ├── contexts/           # React Context providers
│   ├── hooks/              # Custom React hooks
│   ├── routes/             # Page components
│   ├── services/           # API service layers
│   ├── students/           # Student-specific features
│   ├── teacher/            # Teacher-specific features
│   └── utils/              # Utility functions
├── public/                 # Static assets
└── package.json           # Dependencies and scripts
```

## Core Features

### 1. Authentication System

#### Student Types
The platform supports four student types with specific accessibility needs:

```javascript
const STUDENT_TYPES = {
  VISUALLY_IMPAIRED: {
    value: "visually_impaired",
    label: "Visually Impaired",
    features: ["Text-to-Speech", "Audio Descriptions", "Voice Input"],
    primaryColor: "blue"
  },
  HEARING_IMPAIRED: {
    value: "hearing_impaired", 
    label: "Hearing Impaired",
    features: ["Visual Descriptions", "Structured Text", "Sign Language Support"],
    primaryColor: "green"
  },
  SPEECH_IMPAIRED: {
    value: "speech_impaired",
    label: "Speech Impaired", 
    features: ["Text Input", "Alternative Communication", "Written Assessments"],
    primaryColor: "purple"
  },
  SLOW_LEARNER: {
    value: "slow_learner",
    label: "Dyslexia Support",
    features: ["Simplified Content", "Step-by-Step Learning", "Visual Aids"],
    primaryColor: "orange"
  }
};
```

#### Authentication Flow
1. **Role Selection**: Users choose between Student or Teacher
2. **Registration/Login**: Separate flows for each role
3. **JWT Token Management**: Tokens stored in localStorage
4. **Route Protection**: Role-based access control

#### API Integration
```javascript
// Student Registration
POST /api/auth/student/register
{
  "name": "Student Name",
  "email": "student@example.com", 
  "password": "password123",
  "studentType": "visually_impaired",
  "class": "10",
  "subject": "Mathematics",
  "school": "DemoSchool"
}

// Teacher Registration  
POST /api/auth/teacher/register
{
  "name": "Teacher Name",
  "email": "teacher@example.com",
  "password": "secret123", 
  "school": "DemoSchool"
}

// Login (both roles)
POST /api/auth/student/login
POST /api/auth/teacher/login
{
  "email": "user@example.com",
  "password": "password"
}
```

### 2. Text-to-Speech (TTS) System

#### TTS Context Provider
The TTS system is built around a React Context that provides:

- **Auto-detection**: Automatically shows TTS popup for visually impaired students
- **Keyboard Shortcuts**: 
  - `Alt + R`: Read page content
  - `Alt + S`: Stop reading
  - `Alt + P`: Pause/Resume
  - `Alt + F`: Read focused element
  - `Alt + H`: Help (read shortcuts)
  - `Alt + T`: Toggle TTS

#### TTS Features
```javascript
const TTSProvider = ({ children }) => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [showWelcomePopup, setShowWelcomePopup] = useState(false);
  const [autoRead, setAutoRead] = useState(true);
  
  // Core TTS functions
  const readPageContent = useCallback(() => {
    const mainContent = document.querySelector('main');
    if (mainContent) {
      tts.speakElement(mainContent);
    }
  }, [tts]);
  
  const readFocusedElement = useCallback(() => {
    const focusedElement = document.activeElement;
    if (focusedElement) {
      const text = focusedElement.getAttribute('aria-label') || 
                   focusedElement.textContent;
      tts.speak(text);
    }
  }, [tts]);
};
```

### 3. Adaptive UI System

#### AdaptiveUIContext
Provides accessibility settings that adapt the interface:

```javascript
const uiSettings = {
  fontSize: 'normal', // normal, large, extra-large
  contrast: 'normal', // normal, high
  animations: true,
  textToSpeech: false,
  voiceEnabled: false,
  visualAids: false,
  keyboardNavigation: true,
  simplifiedMode: false
};
```

#### Accessibility Features
- **Font Size Control**: Adjustable text sizes
- **High Contrast Mode**: Enhanced visibility
- **Reduced Motion**: Respects user preferences
- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Reader Support**: ARIA labels and semantic HTML

### 4. Teacher Dashboard

#### Content Upload System
Teachers can upload educational content in two formats:

1. **Document Upload**: PDF, DOCX, PPTX files
2. **Audio Upload**: WAV, MP3, M4A files

#### Upload Flow
```javascript
// Teacher upload API call
const uploadContent = async (data) => {
  const formData = new FormData();
  
  if (data.file) {
    formData.append('file', data.file);
  } else if (data.audio) {
    formData.append('audio', data.audio);
  }
  
  formData.append('school', data.school);
  formData.append('class', data.className);
  formData.append('subject', data.subject);
  formData.append('topic', data.topic);
  
  const response = await fetch('/api/teacher/upload', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });
};
```

#### Backend Processing
The backend automatically:
1. Extracts text from documents or transcribes audio
2. Generates dyslexie-adapted text using AI
3. Creates TTS audio and uploads to Catbox
4. Stores in MongoDB with all variants

### 5. Student Dashboard

#### Adaptive Learning Interface
Each student type gets a customized dashboard:

- **Visually Impaired**: Audio-first interface with TTS controls
- **Hearing Impaired**: Visual indicators and structured text
- **Speech Impaired**: Text-based interactions
- **Slow Learners**: Simplified content with visual aids

#### Content Consumption
```javascript
// Fetch notes for student
const getNotes = async ({ school, className, subject }) => {
  const response = await fetch(`/api/notes?school=${school}&class=${className}&subject=${subject}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const data = await response.json();
  return data.notes;
};

// Get adapted content based on student type
const getAdaptedContent = (note, studentType) => {
  switch (studentType) {
    case 'visually_impaired':
      return note.variants?.audioUrl || note.text;
    case 'slow_learner':
      return note.variants?.dyslexie || note.text;
    default:
      return note.text;
  }
};
```

### 6. AI Integration

#### Q&A System
Students can ask questions about content:

```javascript
// Ask question API
POST /api/ai
{
  "mode": "qna",
  "studentType": "vision", 
  "notes": "content text...",
  "question": "What is photosynthesis?"
}
```

#### Content Adaptation
AI adapts content for different student types:

```javascript
// Generate adapted notes
POST /api/ai  
{
  "mode": "notes",
  "studentType": "dyslexie",
  "text": "original content..."
}
```

### 7. Service Layer Architecture

#### AuthService
Handles all authentication operations:
- Registration/Login for students and teachers
- Token management and verification
- User data persistence

#### TeacherService  
Manages teacher-specific operations:
- Content upload and processing
- Subject management
- Audio generation

#### NotesService
Handles student content consumption:
- Fetching notes by class/subject
- Content search and filtering
- Q&A interactions

#### AIService
Manages AI-powered features:
- Content adaptation
- Question answering
- Study tips generation

### 8. Routing System

#### React Router v7 Setup
```javascript
// Route structure
/                           # Home page with login options
/auth/student              # Student authentication
/auth/teacher              # Teacher authentication  
/student/dashboard         # Student dashboard
/teacher/dashboard         # Teacher dashboard
/dashboard                 # Role-based redirect
```

#### Protected Routes
```javascript
const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) return <LoadingSpinner />;
  if (!isAuthenticated) return <Navigate to="/" />;
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/" />;
  }
  
  return children;
};
```

### 9. Configuration

#### API Configuration
```javascript
// api.config.js
export const API_BASE_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:5000';

export const API_ENDPOINTS = {
  AUTH: {
    STUDENT_REGISTER: '/api/auth/student/register',
    STUDENT_LOGIN: '/api/auth/student/login',
    TEACHER_REGISTER: '/api/auth/teacher/register', 
    TEACHER_LOGIN: '/api/auth/teacher/login',
    VERIFY: '/api/auth/verify'
  },
  TEACHER: {
    UPLOAD: '/api/teacher/upload'
  },
  AI: '/api/ai',
  TTS: '/api/tts',
  STT: '/api/stt',
  SUBJECTS: '/api/subjects'
};
```

### 10. Accessibility Implementation

#### Keyboard Navigation
- Full keyboard accessibility with Tab navigation
- Custom keyboard shortcuts for TTS
- Focus management and visual indicators

#### Screen Reader Support
- Semantic HTML structure
- ARIA labels and descriptions
- Live regions for dynamic content

#### Visual Accessibility
- High contrast mode
- Adjustable font sizes
- Reduced motion support
- Color-blind friendly design

#### Audio Accessibility
- Text-to-Speech for all content
- Audio descriptions for visual elements
- Voice input support
- Audio controls with keyboard shortcuts

## Development Setup

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation
```bash
cd frontend
npm install
```

### Environment Variables
Create `.env` file:
```bash
VITE_BACKEND_API_URL=https://your-api-url.com
```

### Development Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
npm start
```

## API Integration Points

### Authentication Endpoints
- `POST /api/auth/student/register` - Student registration
- `POST /api/auth/student/login` - Student login
- `POST /api/auth/teacher/register` - Teacher registration  
- `POST /api/auth/teacher/login` - Teacher login
- `GET /api/auth/verify` - Token verification

### Content Management
- `POST /api/teacher/upload` - Upload documents/audio
- `GET /api/notes` - Fetch student notes
- `GET /api/subjects` - Get available subjects

### AI Services
- `POST /api/ai` - Content adaptation and Q&A
- `POST /api/tts` - Text-to-speech generation
- `POST /api/stt` - Speech-to-text conversion

## Key Components

### AuthContext
Central authentication state management with JWT token handling.

### TTSContext  
Text-to-Speech system with keyboard shortcuts and auto-detection.

### AdaptiveUIContext
Accessibility settings and UI adaptations based on student type.

### StudentTypeSelector
Interactive component for selecting learning profile during registration.

### TTSController
Floating TTS controls with play/pause, speed, and volume controls.

### ProtectedRoute
Route protection component with role-based access control.

## Best Practices

1. **Accessibility First**: All components are built with accessibility in mind
2. **Progressive Enhancement**: Core functionality works without JavaScript
3. **Responsive Design**: Mobile-first approach with adaptive layouts
4. **Error Handling**: Comprehensive error boundaries and user feedback
5. **Performance**: Lazy loading and code splitting for optimal performance
6. **Security**: JWT token management with automatic refresh
7. **User Experience**: Intuitive navigation with clear visual feedback

## Future Enhancements

- OAuth integration (Google, Microsoft)
- Two-factor authentication
- Offline support with service workers
- Advanced AI features
- Real-time collaboration
- Mobile app development
- Advanced analytics and reporting

This architecture provides a solid foundation for building an inclusive, accessible learning platform that adapts to each student's unique needs while maintaining a clean, maintainable codebase.
