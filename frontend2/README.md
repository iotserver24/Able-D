# Able-D Minimal Frontend (Vanilla HTML/CSS/JS)

This is a lightweight static frontend to exercise the backend API documented in `backend/docs/API_REFERENCE.md`.

## Features
- Student login (email/password)
- Teacher login (email/password)
- Teacher note upload (document or audio) with JWT
- Student type selection for the four supported types: `visually_impaired`, `hearing_impaired`, `speech_impaired`, `slow_learner`

## Run
Serve this folder statically (any HTTP server). Example with Python:

```bash
cd frontend2
python -m http.server 5173
```

Open http://localhost:5173

## Configure
Update `frontend2/config.js` if your backend is not mounted at `/api`:

```js
window.APP_CONFIG = { apiBaseUrl: 'http://localhost:5000/api' };
```

## Notes
- Student login obtains a token using email/password; the selected student type is used by the UI only.
- Teacher upload requires `Authorization: Bearer <token>`.
- Successful uploads render base text, dyslexie variant, and audio if available.


