# Complete API Reference for Frontend-Backend Integration

This document provides a comprehensive reference for all backend API endpoints that the frontend can use to connect with the Able-D backend system.

## Base Configuration

- **Base URL**: `https://able-d.onrender.com` (production) or `http://127.0.0.1:5000` (development)
- **API Prefix**: `/api`
- **Authentication**: JWT Bearer tokens for protected endpoints
- **Content-Type**: `application/json` for JSON requests, `multipart/form-data` for file uploads

## Student Types

The system supports 4 student types with adaptive content:

1. **Visually Impaired** (`visually_impaired`)
   - Audio-first learning with Text-to-Speech support
   - Features: Text-to-Speech, Audio Descriptions, Voice Input

2. **Hearing Impaired** (`hearing_impaired`)
   - Visual learning with structured text and descriptions
   - Features: Visual Descriptions, Structured Text, Sign Language Support

3. **Speech Impaired** (`speech_impaired`)
   - Text-based interaction and alternative communication
   - Features: Text Input, Alternative Communication, Written Assessments

4. **Dyslexia Support** (`slow_learner`)
   - Simplified content with step-by-step learning
   - Features: Simplified Content, Step-by-Step Learning, Visual Aids

## Authentication Endpoints

### Student Registration
```http
POST /api/auth/student/register
Content-Type: application/json

{
  "name": "string",
  "email": "string",
  "password": "string",
  "studentType": "visually_impaired|hearing_impaired|speech_impaired|slow_learner",
  "class": "string"
}
```

**Response:**
```json
{
  "user": {
    "role": "student",
    "studentType": "visually_impaired",
    "class": "10",
    "subject": "science",
    "school": "DemoSchool",
    "_id": "string"
  },
  "accessToken": "jwt_token"
}
```

**Note:** School is hardcoded to "DemoSchool" and subject is hardcoded to "science".

### Student Login
```http
POST /api/auth/student/login
Content-Type: application/json

{
  "email": "string",
  "password": "string"
}
```

### Teacher Registration
```http
POST /api/auth/teacher/register
Content-Type: application/json

{
  "name": "string",
  "email": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "user": {
    "role": "teacher",
    "email": "string",
    "school": "DemoSchool",
    "_id": "string"
  },
  "accessToken": "jwt_token"
}
```

**Note:** School is hardcoded to "DemoSchool".

### Teacher Login
```http
POST /api/auth/teacher/login
Content-Type: application/json

{
  "email": "string",
  "password": "string"
}
```

### Token Verification
```http
GET /api/auth/verify
Authorization: Bearer <token>
```

## Subject Management

### Get Available Subjects
```http
GET /api/subjects?school=DemoSchool&class=10
Authorization: Bearer <token>
```

**Response:**
```json
{
  "items": [
    {"subjectName": "english"},
    {"subjectName": "science"},
    {"subjectName": "social"}
  ]
}
```

## Student Endpoints

### Get Topics for Subject
```http
GET /api/students/topics?school=DemoSchool&class=10&subject=science
Authorization: Bearer <token>
```

**Response:**
```json
{
  "items": [
    {
      "topic": "Photosynthesis",
      "school": "DemoSchool",
      "class": "10",
      "subject": "science"
    }
  ]
}
```

### Get Tailored Notes
```http
GET /api/students/notes?school=DemoSchool&class=10&subject=science&topic=Photosynthesis&studentType=visually_impaired
Authorization: Bearer <token>
```

**Response:**
```json
{
  "note": {
    "school": "DemoSchool",
    "class": "10",
    "subject": "science",
    "topic": "Photosynthesis",
    "studentType": "visually_impaired",
    "content": "Adapted content for visually impaired students...",
    "audioUrl": "https://catbox.moe/audio.mp3",
    "tips": "Learning tips for visually impaired students",
    "_id": "note_id",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

### Generate Q&A (Text)
```http
POST /api/students/qna
Authorization: Bearer <token>
Content-Type: application/json

{
  "school": "DemoSchool",
  "class": "10",
  "subject": "science",
  "topic": "Photosynthesis",
  "studentType": "visually_impaired",
  "question": "What is photosynthesis?"
}
```

**Response:**
```json
{
  "answer": "Adapted answer for visually impaired students...",
  "tips": "Additional learning tips",
  "_metadata": {
    "request_id": "abc123",
    "total_time": 2.5
  }
}
```

### Generate Q&A (Audio Input)
```http
POST /api/students/qna-audio
Authorization: Bearer <token>
Content-Type: multipart/form-data

Form Data:
- school: "DemoSchool"
- class: "10"
- subject: "science"
- topic: "Photosynthesis"
- studentType: "visually_impaired"
- language: "en-US"
- audio: <audio_file>
```

**Response:**
```json
{
  "question": "Transcribed question text",
  "answer": "Adapted answer for visually impaired students...",
  "audioUrl": "https://catbox.moe/answer_audio.mp3",
  "tips": "Additional learning tips"
}
```

## Teacher Endpoints

### Upload Content
```http
POST /api/teacher/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

Form Data:
- school: "DemoSchool"
- class: "10"
- subject: "science"
- topic: "Photosynthesis"
- file: <document_file> (OR)
- audio: <audio_file> (OR)
- text: "Direct text content"
- language: "en-US" (for audio)
```

**Response:**
```json
{
  "note": {
    "school": "DemoSchool",
    "class": "10",
    "subject": "science",
    "topic": "Photosynthesis",
    "text": "Extracted or provided text content",
    "variants": {
      "dyslexie": "Simplified content for dyslexia support",
      "audioUrl": "https://catbox.moe/audio.mp3",
      "meta": {
        "dyslexieTips": "Learning tips for dyslexia support"
      }
    },
    "_id": "note_id",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

## AI Service Endpoints

### Generate Adaptive Content
```http
POST /api/ai
Content-Type: application/json

{
  "mode": "notes|qna",
  "studentType": "visually_impaired|hearing_impaired|speech_impaired|dyslexie|dyslexia",
  "text": "Content to adapt (for notes mode)",
  "notes": "Base notes content (for qna mode)",
  "question": "Question to answer (for qna mode)"
}
```

**Response (Notes Mode):**
```json
{
  "content": "Adapted content for specified student type",
  "tips": "Learning tips and strategies",
  "_metadata": {
    "request_id": "abc123",
    "total_time": 3.2
  }
}
```

**Response (QnA Mode):**
```json
{
  "answer": "Adapted answer for specified student type",
  "tips": "Learning tips and strategies",
  "_metadata": {
    "request_id": "abc123",
    "total_time": 2.8
  }
}
```

### AI Health Check
```http
GET /api/ai/health
```

**Response:**
```json
{
  "status": "healthy|unhealthy",
  "available_keys": 3,
  "endpoint": "/api/ai",
  "supported_modes": ["notes", "qna"],
  "supported_student_types": ["vision", "hearing", "speech", "dyslexie", "dyslexia"]
}
```

### AI Statistics
```http
GET /api/ai/stats
```

## Utility Endpoints

### Health Check
```http
GET /api/health
```

**Response:**
```json
{
  "status": "ok"
}
```

### Text-to-Speech
```http
POST /api/tts
Content-Type: application/json

{
  "text": "Text to convert to speech",
  "voice": "en-US-JennyNeural" (optional)
}
```

**Response:** Binary MP3 file

### Speech-to-Text
```http
POST /api/stt
Content-Type: multipart/form-data

Form Data:
- audio: <audio_file>
- language: "en-US"
```

**Response:**
```json
{
  "filename": "audio.wav",
  "language": "en-US",
  "text": "Transcribed text"
}
```

### Extract Text from Document
```http
POST /api/extract-text
Content-Type: multipart/form-data

Form Data:
- file: <document_file>
```

**Response:**
```json
{
  "filename": "document.pdf",
  "text": "Extracted text content"
}
```

## Firebase Authentication (Optional)

### Check Firebase Profile
```http
GET /api/auth/firebase/check-profile
Authorization: Bearer <firebase_token>
```

### Complete Firebase Profile
```http
POST /api/auth/firebase/complete-profile
Authorization: Bearer <firebase_token>
Content-Type: application/json

{
  "role": "student|teacher",
  "name": "string",
  "school": "DemoSchool",
  "email": "string",
  "studentType": "visually_impaired|hearing_impaired|speech_impaired|slow_learner",
  "class": "string",
  "subject": "string"
}
```

### Verify Firebase Token
```http
GET /api/auth/firebase/verify
Authorization: Bearer <firebase_token>
```

### Refresh Firebase Token
```http
POST /api/auth/firebase/refresh
Authorization: Bearer <firebase_token>
```

## Error Handling

All endpoints return consistent error responses:

```json
{
  "error": "Error message",
  "error_code": "ERROR_CODE"
}
```

Common HTTP status codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Internal Server Error
- `503`: Service Unavailable

## Frontend Integration Examples

### Authentication Flow
```typescript
// Register student
const registerStudent = async (userData: {
  name: string;
  email: string;
  password: string;
  studentType: string;
  class: string;
}) => {
  const response = await fetch(`${API_BASE_URL}/api/auth/student/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  });
  return response.json();
};

// Login
const login = async (email: string, password: string, role: 'student' | 'teacher') => {
  const endpoint = role === 'student' 
    ? '/api/auth/student/login' 
    : '/api/auth/teacher/login';
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  return response.json();
};
```

### Student Content Access
```typescript
// Get topics for a subject
const getTopics = async (classValue: string, subject: string, token: string) => {
  const response = await fetch(
    `${API_BASE_URL}/api/students/topics?school=DemoSchool&class=${classValue}&subject=${subject}`,
    {
      headers: { 'Authorization': `Bearer ${token}` }
    }
  );
  return response.json();
};

// Get tailored notes
const getNotes = async (classValue: string, subject: string, topic: string, studentType: string, token: string) => {
  const response = await fetch(
    `${API_BASE_URL}/api/students/notes?school=DemoSchool&class=${classValue}&subject=${subject}&topic=${topic}&studentType=${studentType}`,
    {
      headers: { 'Authorization': `Bearer ${token}` }
    }
  );
  return response.json();
};
```

### Teacher Content Upload
```typescript
// Upload document
const uploadDocument = async (file: File, classValue: string, subject: string, topic: string, token: string) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('school', 'DemoSchool');
  formData.append('class', classValue);
  formData.append('subject', subject);
  formData.append('topic', topic);

  const response = await fetch(`${API_BASE_URL}/api/teacher/upload`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData
  });
  return response.json();
};
```

### AI Content Generation
```typescript
// Generate adaptive content
const generateAdaptiveContent = async (mode: 'notes' | 'qna', studentType: string, content: any) => {
  const response = await fetch(`${API_BASE_URL}/api/ai`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      mode,
      studentType,
      ...content
    })
  });
  return response.json();
};
```

## Hardcoded Values

The following values are hardcoded in the backend:

- **School**: `"DemoSchool"` (for all users)
- **Default Subject**: `"science"` (for students)
- **Available Subjects**: `["english", "science", "social"]`

## Notes

1. All student and teacher registrations automatically assign users to "DemoSchool"
2. Students are automatically assigned to "science" subject
3. The AI service adapts content based on student type
4. Audio files are automatically generated and uploaded to Catbox for TTS
5. All protected endpoints require JWT authentication
6. File uploads support documents (PDF, DOC, etc.) and audio files
7. The system provides fallback content when AI services are unavailable
