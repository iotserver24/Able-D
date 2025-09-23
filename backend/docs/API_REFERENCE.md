# API Reference (Backend)

This document consolidates endpoints, request/response formats, processing flows, and data persistence for the Able-D backend.

- Auth & Security: JWT (teacher/student). Firebase verify endpoint exists but teacher upload uses JWT.
- Database: MongoDB (CosmosDB-compatible). Main collections: `users`, `notes`, `subjects`.

## Auth

### POST /api/auth/teacher/register
Request (JSON):
```json
{
  "name": "Teacher Name",
  "email": "teacher@example.com",
  "password": "secret123",
  "school": "DemoSchool"
}
```
Response 201:
```json
{ "user": { /* teacher fields */ }, "accessToken": "<JWT>" }
```

### POST /api/auth/teacher/login
Request (JSON):
```json
{ "email": "teacher@example.com", "password": "secret123" }
```
Response 200:
```json
{ "user": { /* teacher fields */ }, "accessToken": "<JWT>" }
```

Notes:
- JWT identity is the email string; claims include `role` and `school`.

### GET /api/auth/verify
Headers: `Authorization: Bearer <JWT>`
Response 200/401: Basic JWT validity info.

### GET /api/auth/firebase/verify
Verifies Firebase ID token; not used by upload flow.

## Teacher Upload

### POST /api/teacher/upload
Headers: `Authorization: Bearer <JWT with role=teacher>`
Content-Type: `multipart/form-data`

Fields:
- `school` (required if not in token)
- `class` or `className` (required)
- `subject` (required)
- `topic` or `name` (required)
- Exactly one of:
  - `file` (document: pdf/docx/pptx/…)
  - `audio` (audio: wav/mp3/m4a/…)
- Optional when audio: `language` (default `en-US`)

Flow:
1. Validate role=teacher via JWT claims
2. Extract (document) or transcribe (audio)
3. Post-process:
   - Generate dyslexie text (AI)
   - Synthesize TTS (MP3) and upload to Catbox → public URL
4. Save to `notes` collection

Response 201:
```json
{
  "note": {
    "_id": "...",
    "school": "DemoSchool",
    "class": "10",
    "subject": "Science",
    "topic": "Biology",
    "text": "<base text>",
    "sourceType": "document|audio",
    "originalFilename": "gnotes.pdf",
    "uploadedBy": "teacher@example.com",
    "variants": {
      "dyslexie": "<adapted text>",
      "audioUrl": "https://files.catbox.moe/<id>.mp3",
      "meta": { "dyslexieTips": "<tips>" },
      "dyslexieError": "<optional>",
      "audioSynthesisError": "<optional>",
      "audioUploadError": "<optional>"
    },
    "meta": { "language": "en-US" },
    "createdAt": "<ISO>",
    "updatedAt": "<ISO>"
  }
}
```

Errors:
- 400: validation/processing error
- 403: forbidden (not a teacher)
- 500: database error

## AI

### POST /api/ai
Notes mode:
```json
{ "mode": "notes", "studentType": "dyslexie", "text": "..." }
```
Q&A mode:
```json
{ "mode": "qna", "studentType": "vision", "notes": "...", "question": "..." }
```
Response 200: JSON with adapted content/answer; includes `_metadata`.

## STT / TTS

### POST /api/stt
Multipart form: `audio` file, optional `language`.

### POST /api/tts
JSON: `{ "text": "...", "voice": "optional" }` → returns MP3 file (binary). The upload flow uses this internally and uploads MP3 to Catbox.

## Subjects

### GET /api/subjects?school=...&class=...
Returns subjects for school/class or defaults.

## Data Model: notes

Document shape:
```json
{
  "school": "<SCHOOL>",
  "class": "<CLASS>",
  "subject": "<SUBJECT>",
  "topic": "<TOPIC>",
  "text": "<BASE_TEXT>",
  "uploadedBy": "<teacher_email>",
  "sourceType": "document|audio",
  "originalFilename": "<original name>",
  "variants": {
    "dyslexie": "<ADAPTED_TEXT>",
    "audioUrl": "https://files.catbox.moe/<id>.mp3",
    "meta": { "dyslexieTips": "<optional tips>" }
  },
  "meta": { "language": "en-US" },
  "createdAt": "<ISO>",
  "updatedAt": "<ISO>"
}
```
Indexes:
- Compound: `(school, class, subject, topic)`
- Single: `uploadedBy`, `createdAt`

## Frontend Consumption

- Fetch notes by `school`, `class`, `subject`, `topic`.
- Choose variant per student:
  - Blind: play `variants.audioUrl`
  - Dyslexie: show `variants.dyslexie` (fallback `text`)
  - Others: show `text`
- Tips: show `variants.meta.dyslexieTips` if present.
- Ignore optional error keys under `variants`.

## Configuration
- `MONGO_URI`, `MONGO_DB_NAME`
- `GEMINI_API_KEY` (and optionally `GEMINI_API_KEY_2..4`)
- `AZURE_SPEECH_KEY`, `AZURE_SPEECH_REGION`, `DEFAULT_VOICE`
- `OUTPUT_DIR` for temporary MP3 path

## Files
- Routes: `app/routes/*.py` (notably `teacher_upload.py`, `ai.py`, `tts.py`, `stt.py`, `auth.py`)
- Services: `app/services/*.py` (`notes_service.py`, `ai_service.py`, `tts_service.py`, `stt_service.py`, `catbox_service.py`)
- Docs: `backend/docs/*.md`
