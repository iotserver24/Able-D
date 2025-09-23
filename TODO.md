# AI Endpoint (Gemini 2.0 Flash) Implementation TODO

Plan approved by user: Implement a new /api/ai endpoint with two modes (notes and qna) using Gemini 2.0 Flash and API key fallback (up to 4 keys) loaded from backend/.env.

## Tasks

- [ ] Add service: backend/app/services/ai_service.py
  - [ ] Implement Gemini client using google-genai
  - [ ] Load up to 4 keys: GEMINI_API_KEY, GEMINI_API_KEY_2, GEMINI_API_KEY_3, GEMINI_API_KEY_4
  - [ ] Key rotation/failover on API errors
  - [ ] Methods:
    - [ ] generate_adaptive_notes(text, student_type) - returns { content, tips?, studentType }
    - [ ] generate_adaptive_qna(notes, student_type, question) - returns { answer, steps?, tips?, studentType }
  - [ ] Consistent prompt templates per student type: vision, hearing, speech, dyslexie
  - [ ] Robust JSON parsing from model output with fallback

- [ ] Add route: backend/app/routes/ai.py
  - [ ] Blueprint ai_bp
  - [ ] POST /api/ai
  - [ ] Request JSON:
        - notes: { mode: "notes", studentType, text }
        - qna: { mode: "qna", studentType, notes, question }
  - [ ] Validation and error responses (400 for invalid input)
  - [ ] Call service and return JSON

- [ ] Wire-up
  - [ ] Register ai_bp in backend/app/__init__.py with url_prefix="/api"

- [ ] Dependencies
  - [ ] Update backend/requirements.txt: add google-genai (and python-dotenv already present)

- [ ] Testing
  - [ ] Provide cURL examples:
    - [ ] Notes mode
    - [ ] QnA mode
  - [ ] Document .env keys: GEMINI_API_KEY, GEMINI_API_KEY_2, GEMINI_API_KEY_3, GEMINI_API_KEY_4

## Notes

- The Flask app factory loads env from backend/.env already.
- Student types (allowed): vision, speech, hearing, dyslexie.
- Model: "gemini-2.0-flash" via google-genai.
- If all keys fail, return 503 with clear message.

## After Implementation

- [ ] pip install -r backend/requirements.txt
- [ ] Add keys to backend/.env
- [ ] Run backend and test endpoints
