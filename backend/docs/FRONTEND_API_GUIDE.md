# Frontend API Integration Guide

This guide explains how the frontend should call the backend APIs. All endpoints are served under the `/api` prefix.

- Base URL (local): `http://localhost:5000/api`
- Content Types: JSON (`application/json`) and uploads via `multipart/form-data`
- Auth: Some routes require a JWT access token in the `Authorization` header: `Bearer <token>`

## Health
- GET `/health`
  - Public. Returns service status.
  - Example:
```bash
curl -s http://localhost:5000/api/health
```

## Auth

### Student Register
- POST `/auth/student/register`
- Body (JSON): `{ name, class | className, subject, school, email, password, studentType }`
- Returns: `{ user, accessToken }`
```bash
curl -s -X POST http://localhost:5000/api/auth/student/register \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Alice",
    "class":"10",
    "subject":"Math",
    "school":"Springfield High",
    "email":"alice@example.com",
    "password":"secret123",
    "studentType":"vision"
  }'
```

### Student Login
- POST `/auth/student/login`
- Body (JSON): `{ email, password }`
- Returns: `{ user, accessToken }`

### Teacher Register
- POST `/auth/teacher/register`
- Body (JSON): `{ name, email, password, school? }`
- Returns: `{ user, accessToken }`

### Teacher Login
- POST `/auth/teacher/login`
- Body (JSON): `{ email, password }`
- Returns: `{ user, accessToken }`

### Verify Firebase Token (optional)
- GET `/auth/firebase/verify`
- Requires header: `Authorization: Bearer <Firebase ID Token>`
- Returns firebase user info if valid.

## Subjects (JWT required)
- GET `/subjects?class=10` (or `className`)
- Requires `Authorization: Bearer <JWT>` from student/teacher login.
- For students: `school` comes from the token; for teachers, you may provide `school` via token or query.
- Returns: `{ items: string[] }`
```bash
curl -s "http://localhost:5000/api/subjects?class=10" \
  -H "Authorization: Bearer $TOKEN"
```

## Extract Text (document -> text)
- POST `/extract-text`
- Multipart form: `file` (document: pdf/docx/pptx)
- Returns: `{ filename, text }`
```bash
curl -s -X POST http://localhost:5000/api/extract-text \
  -F file=@./sample.pdf
```

## STT (audio -> text)
- POST `/stt`
- Multipart form: `audio` (wav/mp3 etc). Optional form field: `language` (default `en-US`)
- Returns: `{ filename, language, text }`
```bash
curl -s -X POST http://localhost:5000/api/stt \
  -F audio=@./sample.wav \
  -F language=en-US
```

## TTS (text -> mp3)
- POST `/tts`
- JSON: `{ text: string, voice?: string }`
- Returns: MP3 file as `application/octet-stream` or `audio/mpeg` attachment `speech.mp3`.
```bash
curl -s -X POST http://localhost:5000/api/tts \
  -H "Content-Type: application/json" \
  -d '{"text":"Hello world"}' \
  -o speech.mp3
```

## Teacher Upload (JWT required)
- POST `/teacher/upload`
- Requires `Authorization: Bearer <JWT>` (teacher role)
- Multipart form fields:
  - One of: `file` (document) OR `audio` (audio file)
  - `school`, `class` | `className`, `subject`, `topic` (a.k.a. `name`)
  - Optional when uploading audio: `language` (default `en-US`)
- Returns: `{ note }`
```bash
curl -s -X POST http://localhost:5000/api/teacher/upload \
  -H "Authorization: Bearer $TEACHER_TOKEN" \
  -F school="Springfield High" \
  -F class=10 \
  -F subject=Science \
  -F topic="Photosynthesis" \
  -F file=@./lesson.pdf
```

## AI (Adaptive Content)

### Health
- GET `/ai/health` (public)
- Returns service status and supported modes/types.

### Generate Adaptive Notes
- POST `/ai`
- JSON: `{ mode: "notes", studentType: "vision" | "hearing" | "speech" | "dyslexie" | "dyslexia", text: string }`
- Returns model output as JSON.
```bash
curl -s -X POST http://localhost:5000/api/ai \
  -H "Content-Type: application/json" \
  -d '{
    "mode":"notes",
    "studentType":"vision",
    "text":"Newton\'s laws of motion ..."
  }'
```

### Q&A over Notes
- POST `/ai`
- JSON: `{ mode: "qna", studentType: <as above>, notes: string, question: string }`
```bash
curl -s -X POST http://localhost:5000/api/ai \
  -H "Content-Type: application/json" \
  -d '{
    "mode":"qna",
    "studentType":"dyslexia",
    "notes":"...",
    "question":"Explain in simple words"
  }'
```

## Headers & Helpers
- JSON requests: `Content-Type: application/json`
- File uploads: `multipart/form-data`
- Auth header (when required): `Authorization: Bearer <token>`

## Error Handling (Common)
- 400: Validation issues (missing fields, wrong mode/type, no file/audio)
- 401/403: Missing/invalid token or forbidden role
- 500/503: Server/service errors (e.g., model keys not configured)
- The error body usually has `{ error: string, error_code?: string }`

## Environment
- Ensure backend `.env` is configured as per `backend/docs/README.md` or `.env.example`.
- For TTS, audio is saved under `OUTPUT_DIR` (default `./audio_output`). Frontend should consume the binary response directly and not assume file paths.

## Notes for Frontend Dev
- Always handle both success and error JSON paths.
- For binary responses (TTS), use `fetch` with `response.blob()` and create object URLs for playback/download.
- For uploads, use `FormData` and do not set `Content-Type` manually (browser sets boundaries).
- For JWT, persist `accessToken` after login and attach it in `Authorization` on protected routes.
