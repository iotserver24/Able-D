# Notes Pipeline and Frontend Integration

This document explains how the teacher upload pipeline produces three note types (base text, dyslexie text, audio URL) and how the frontend should fetch and render them for different students.

## Backend Flow Overview

1) Teacher uploads a document or audio to `POST /api/teacher/upload` with fields:
   - `school`, `class` (or `className`), `subject`, `topic`
   - Exactly one of: `file` (document) or `audio` (audio file)
   - Optional when audio: `language` (default `en-US`)

2) Extraction / Transcription
   - Document → Extract text via `extract_text_service.get_extractor()`
   - Audio → Normalize via `ensure_wav_pcm16_mono_16k()` and transcribe via `stt_service.get_stt_client()`

3) Post-processing
   - Dyslexie text: AI (`GeminiService.generate_adaptive_notes(text, 'dyslexie')`)
   - Audio MP3: TTS (`synthesize_text_to_mp3`) → Upload to Catbox (`upload_file_to_catbox`) → URL

4) Persistence (MongoDB `notes` collection)
   - One document per upload under the provided hierarchy
   - Variants stored under `variants`

## MongoDB Document Shape

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

Indexes (created automatically):
- Compound: `(school, class, subject, topic)`
- Single: `uploadedBy`, `createdAt`

## Endpoints Used
- Upload: `POST /api/teacher/upload`
- TTS (if needed directly): `POST /api/tts` (normally not called by frontend; pipeline handles it)
- AI: `POST /api/ai` (not required for fetch; pipeline already generated dyslexie variant)

## Frontend Integration

Frontends should fetch notes (via your existing API for listing notes by `school`, `class`, `subject`, `topic`) and choose what to render per student type.

Recommended logic:
- For blind/vision-impaired users: prefer `note.variants.audioUrl` to stream/play
- For dyslexie: show `note.variants.dyslexie` if present; fallback to `note.text`
- For others: show base `note.text`

If the dyslexie variant is structured (JSON-like string), you can:
- Render as paragraphs by parsing JSON if it is valid; otherwise display as plain text
- Optionally show `variants.meta.dyslexieTips` under a "Study Tips" section

## Error Handling in Variants
The pipeline is resilient. If AI or TTS fails, the upload still succeeds. You may see keys like:
- `variants.dyslexieError`
- `variants.audioSynthesisError`
- `variants.audioUploadError`

Frontend should gracefully ignore error keys and render available content.

## Configuration
- Mongo: `MONGO_URI`, `MONGO_DB_NAME`
- AI: `GEMINI_API_KEY` (and optional: `GEMINI_API_KEY_2..4`)
- TTS: `AZURE_SPEECH_KEY`, `AZURE_SPEECH_REGION`, optional `DEFAULT_VOICE`
- Catbox: no key required (anonymous upload)
- Temp audio output: `OUTPUT_DIR` (default `./audio_output`), files are deleted after upload

## Security & Auth
- Teacher authorization uses JWT; uploads require role `teacher`
- Notes are linked by `uploadedBy` (teacher email)

## Files & Code References
- Route: `backend/app/routes/teacher_upload.py`
- Notes: `backend/app/services/notes_service.py`
- AI: `backend/app/services/ai_service.py`
- TTS: `backend/app/services/tts_service.py`
- Catbox: `backend/app/services/catbox_service.py`
- Docs: `backend/docs/TEACHER_UPLOAD.md`

## Frontend Display Summary
- Show title from `topic`
- Base content: `text`
- Dyslexie content (if present): `variants.dyslexie`
- Audio: play from `variants.audioUrl`
- Tips: `variants.meta.dyslexieTips` (optional)
