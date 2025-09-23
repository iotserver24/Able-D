# Firebase Authentication with Microsoft + Cosmos DB

This backend verifies Firebase ID tokens (from Microsoft sign-in via Firebase) and then uses Azure Cosmos DB (Mongo API) for data.

## Prerequisites

- Firebase project with Microsoft provider enabled
- Service account JSON for Firebase Admin
- Cosmos DB (Mongo API) connection string

## Environment (.env)

Add the following to `backend/.env` (do not commit secrets):

```
FIREBASE_PROJECT_ID=your-firebase-project-id
# Option A: file path to service account json
FIREBASE_CREDENTIALS_FILE=C:\\path\\to\\service-account.json
# Option B: base64 of service account json
# FIREBASE_CREDENTIALS_BASE64=eyJ0eXAiOiJKV1QiLCJhbGciOi...
```

Mongo settings are already present via `MONGO_URI` and `MONGO_DB_NAME`.

## Installation

Install backend dependencies:

```
pip install -r backend/requirements.txt
```

## Initialization

- The app initializes Firebase Admin during app startup (`initialize_firebase_admin`). If credentials are missing, startup continues but Firebase verification endpoints will reject tokens.

## Protected Route (Test)

Endpoint: `GET /api/auth/firebase/verify`

Headers:

```
Authorization: Bearer <FIREBASE_ID_TOKEN>
```

Response (200):

```
{
  "ok": true,
  "firebase": { "uid": "...", "email": "...", "provider": "microsoft.com" }
}
```

Response (403):

```
{ "error": "Unauthorized" }
```

## Flow Recap

1. Frontend signs in with Microsoft via Firebase.
2. Frontend sends Firebase ID token in `Authorization: Bearer <token>`.
3. Backend verifies token using Firebase Admin, then proceeds with Cosmos DB operations via standard MongoDB driver.


