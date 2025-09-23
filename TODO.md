# Frontend-Backend Integration TODO

## ✅ Completed
- [x] Create TODO.md file to track progress
- [x] Update frontend/app/config/api.config.js with all backend endpoints
- [x] Create frontend/app/services/ai.service.js for AI operations (fully aligned with backend)
- [x] Create frontend/app/services/teacher.service.js for teacher operations (fully aligned with backend)
- [x] Update frontend/app/services/auth.service.js for proper JWT handling (fully aligned with backend)
- [x] Update frontend/app/teacher/dashboard/UploadContent.jsx
  - [x] Add dynamic subject fetching based on class selection
  - [x] Fix duplicate subjectOptions declaration
  - [x] Add support for audio file uploads
  - [x] Add topic input field to the form UI
  - [x] Integrate real file upload API call
  - [x] Handle success/error responses from backend
- [x] Update frontend/app/contexts/AuthContext.jsx to handle backend response format
- [x] Align all services with backend API specification:
  - [x] Auth endpoints return { user: {...}, accessToken: "..." }
  - [x] Teacher upload accepts multipart/form-data with school, class, subject, topic, file/audio
  - [x] AI service handles notes and Q&A modes with proper response parsing
  - [x] Subject fetching returns { items: [{subjectName: "..."}] }

## ⚠️ Issues to Fix
- [ ] Fix merge conflict in UploadContent.jsx (lines 241, 246, 262)
- [ ] Fix missing closing brace syntax error

## 📋 Pending Tasks

### 1. Teacher Dashboard Integration
- [ ] Test the complete upload flow with backend
- [ ] Add success message display component
  
### 2. Student Features Integration
- [ ] Update frontend/app/students/features/dashboard/QASection.jsx for Q&A
- [ ] Update frontend/app/students/features/notes/NotesList.jsx for notes
- [ ] Update frontend/app/students/features/dashboard/dashboard.jsx

### 3. Testing & Verification
- [ ] Test teacher registration/login
- [ ] Test student registration/login
- [ ] Test file upload functionality
- [ ] Test AI services (notes and Q&A)
- [ ] Test subject fetching

## 📝 Backend API Integration Summary

### Authentication
- **Teacher Register**: POST /api/auth/teacher/register → Returns { user, accessToken }
- **Teacher Login**: POST /api/auth/teacher/login → Returns { user, accessToken }
- **Token Verify**: GET /api/auth/verify → Validates JWT token
- JWT identity is email string with role and school claims

### Teacher Upload
- **Upload**: POST /api/teacher/upload (multipart/form-data)
  - Required: school, class, subject, topic, file OR audio
  - Returns: { note: {...} } with variants (dyslexie text, audioUrl from Catbox)
  
### AI Services
- **Notes Mode**: { mode: "notes", studentType: "dyslexie", text: "..." }
- **Q&A Mode**: { mode: "qna", studentType: "vision", notes: "...", question: "..." }
- Returns adapted content with _metadata

### Subjects
- **Get Subjects**: GET /api/subjects?school=...&class=...
- Returns: { items: [{subjectName: "..."}] }
