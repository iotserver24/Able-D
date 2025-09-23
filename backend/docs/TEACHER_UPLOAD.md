# Teacher Upload API

Endpoint to allow teachers to upload notes via a document or audio file. The backend extracts/transcribes text and stores it in MongoDB under the school/class/subject/topic hierarchy and links the uploader.

## Auth
- JWT required
- Only users with role `teacher` may access

## Route
- POST `/api/teacher/upload`

## Multipart form fields
- `school` (string) – optional if present in teacher token; otherwise required
- `class` or `className` (string) – required
- `subject` (string) – required
- `topic` or `name` (string) – required (topic title)
- `file` (file) – document upload (PDF/DOCX/PPTX/etc.)
- OR `audio` (file) – audio upload (WAV/MP3 etc.)
- Optional when audio: `language` (string, default `en-US`)

Only one of `file` or `audio` must be provided.

## Behavior
- If `file` is provided: process via existing extractor (same as `/api/extract-text`)
- If `audio` is provided: process via existing STT (same as `/api/stt`), converting to WAV PCM16 mono 16k if needed
- Store resulting base `text` with metadata in `notes` collection
- Post-processing (automatic):
  - Generate a Dyslexie-adapted text variant using AI (`studentType = dyslexie`)
  - Synthesize TTS (MP3) from the base text and upload to Catbox; store returned URL
  - Save these under `variants`

## MongoDB document shape (notes)
```json
{
  "school": "ABC",
  "class": "10",
  "subject": "Math",
  "topic": "Algebra",
  "text": "...extracted/transcribed text...",
  "uploadedBy": "t1@example.com",
  "sourceType": "document",
  "originalFilename": "file.pdf",
  "variants": {
    "dyslexie": "...AI-adapted text for dyslexie...",
    "audioUrl": "https://files.catbox.moe/xxxxxx.mp3",
    "meta": { "dyslexieTips": "..." }
  },
  "meta": { "language": "en-US" },
  "createdAt": "2025-09-23T12:34:56Z",
  "updatedAt": "2025-09-23T12:34:56Z"
}
```

Indexes created on `notes`:
- compound: `(school, class, subject, topic)`
- single: `uploadedBy`, `createdAt`

## Responses
- 201 Created
```json
{ "note": { /* note document as stored */ } }
```
- 400 Bad Request on validation or processing error
- 403 Forbidden if non-teacher
- 500 Internal Server Error on database insertion failure (returns `{ "error": "Database error: ..." }`)

## Examples

cURL (document):
```bash
curl -X POST "http://localhost:5000/api/teacher/upload" \
  -H "Authorization: Bearer $TOKEN" \
  -F school=ABC \
  -F class=10 \
  -F subject=Math \
  -F topic=Algebra \
  -F file=@/path/to/file.pdf
```

cURL (audio):
```bash
curl -X POST "http://localhost:5000/api/teacher/upload" \
  -H "Authorization: Bearer $TOKEN" \
  -F school=ABC \
  -F class=10 \
  -F subject=Science \
  -F topic=Biology \
  -F language=en-US \
  -F audio=@/path/to/audio.wav
```

## Implementation Notes
- Route: `app/routes/teacher_upload.py`
- Service: `app/services/notes_service.py`
- Reuses: `extract_text_service.get_extractor()`, `stt_service.get_stt_client()` and `utils.audio.ensure_wav_pcm16_mono_16k`
- AI: `app/services/ai_service.py` generates dyslexie variant
- TTS: `app/services/tts_service.py` creates MP3
- Catbox: `app/services/catbox_service.py` uploads MP3 and returns URL


