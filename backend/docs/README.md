# Able-D Backend

This backend provides APIs for document text extraction and speech-to-text (Azure Cognitive Services). It is built with Flask using an app-factory and blueprints.

## Endpoints

- GET `/api/health`
  - Returns `{ "status": "ok" }`.

- POST `/api/extract-text`
  - Multipart form-data: `file` (required) — document file (`.pdf`, `.docx`, `.pptx`, `.txt`, etc.)
  - Response:
    { "filename": "file.pdf", "text": "...extracted text..." }

- POST `/api/stt`
  - Multipart form-data: `audio` (required), `language` (optional, default `en-US`)
  - Supported uploads: `.wav`, `.mp3`, `.m4a`, `.ogg`, `.flac`, `.aac`, `.wma`, `.opus` (and more)
  - The server auto-converts to WAV PCM16 mono 16k via ffmpeg for SDK compatibility.
  - Response:
    { "filename": "sample.mp3", "language": "en-US", "text": "transcription" }

## Project Structure

```
backend/
  app/
    __init__.py           # create_app factory, CORS, blueprint registration
    config.py             # Flask configuration (MAX_CONTENT_LENGTH, SECRET_KEY)
    routes/
      health.py           # /api/health
      extract_text.py     # /api/extract-text
      stt.py              # /api/stt
    services/
      extract_text_service.py  # wraps document_extractor.SimpleDocumentExtractor
      stt_service.py           # wraps stt.SimpleMicrosoftSTT
    utils/
      audio.py            # ffmpeg-based conversion to wav pcm16 mono 16k
  run.py                  # dev entrypoint
  requirements.txt        # backend-only dependencies
  Dockerfile              # container build with ffmpeg
  .env                    # local env (not committed)
  docs/
    README.md             # this file
```

## Environment Variables

Create `backend/.env` (local dev only):

```
FLASK_APP=run.py
FLASK_ENV=development
SECRET_KEY=change-this-in-production
AZURE_SPEECH_KEY=YOUR_KEY
AZURE_SPEECH_REGION=centralindia
DEFAULT_VOICE=en-US-JennyNeural
OUTPUT_DIR=./audio_output
```

## Local Development

```powershell
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python run.py
```

Test health:
```powershell
curl.exe -i http://127.0.0.1:5000/api/health
```

Extract text (from repo root file):
```powershell
curl.exe -X POST http://127.0.0.1:5000/api/extract-text -F file=@..\gnotes.pdf
```

Speech-to-Text (MP3):
```powershell
curl.exe -X POST http://127.0.0.1:5000/api/stt -F "audio=@C:\\path\\to\\sample.mp3;type=audio/mpeg" -F language=en-US
```

If uploading `.m4a`, try `audio/mp4` or `audio/x-m4a` for the content type:
```powershell
curl.exe -X POST http://127.0.0.1:5000/api/stt -F "audio=@.\Recording.m4a;type=audio/x-m4a" -F language=en-US
```

## Docker

Build:
```bash
cd backend
docker build -t able-d-backend .
```

Run:
```bash
docker run -p 8080:8080 \
  -e AZURE_SPEECH_KEY=YOUR_KEY \
  -e AZURE_SPEECH_REGION=centralindia \
  able-d-backend
```

Test:
```bash
curl http://127.0.0.1:8080/api/health
```

## Notes
- CORS is enabled; restrict origins for production.
- Upload limit is 16 MB by default; change via `MAX_CONTENT_LENGTH` in config or env.
- ffmpeg is required for non-WAV formats; Dockerfile installs it by default.
