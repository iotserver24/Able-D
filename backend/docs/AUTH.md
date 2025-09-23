# Auth API (Able-D)

Base URL: `/api`

## Student Login
POST `/auth/student/login`

Body:
```json
{
  "studentType": "visually_impaired|hearing_impaired|speech_impaired|slow_learner",
  "school": "School name",
  "name": "Optional display name",
  "class": "Class from 1-12",
  "subject": "Optional subject e.g. Science"
}
```

Response 200:
```json
{
  "user": {
    "_id": "...",
    "role": "student",
    "studentType": "blind",
    "name": "Student-...",
    "class": "8A",
    "subject": "Science"
  },
  "accessToken": "JWT"
}
```

Notes:
- Creates a lightweight student session document. Use the returned JWT in `Authorization: Bearer <token>`.
- Allowed studentType input uses normalized set: `visually_impaired`, `hearing_impaired`, `speech_impaired`, `slow_learner` (legacy values are mapped).
- JWT identity includes: `role`, `studentType`, `class`, `subject`, `school` (when provided).

## Teacher Register
POST `/auth/teacher/register`

Body:
```json
{
  "name": "Alice",
  "email": "alice@school.edu",
  "password": "secret123",
  "school": "School name"
}
```

Response 201:
```json
{
  "user": { "role": "teacher", "name": "Alice", "email": "alice@school.edu", "school": "School name" },
  "accessToken": "JWT"
}
```

## Teacher Login
POST `/auth/teacher/login`

Body:
```json
{ "email": "alice@school.edu", "password": "secret123" }
```

Response 200:
```json
{
  "user": { "role": "teacher", "name": "Alice", "email": "alice@school.edu", "school": "School name" },
  "accessToken": "JWT"
}
```

## Verify Token
GET `/auth/verify`

Headers:
```
Authorization: Bearer <JWT>
```

Response 200:
```json
{
  "ok": true,
  "identity": {
    "role": "student|teacher",
    "studentType": "...",
    "class": "...",
    "subject": "...",
    "school": "..."
  }
}
```

## Subjects
GET `/subjects?class=<class>`

Headers:
```
Authorization: Bearer <JWT>
```

Behavior:
- Students: `school` enforced from token; `class` taken from query or falls back to token.
- Teachers: `school` enforced from token; `class` must be supplied in query.

Response 200:
```json
{
  "items": [
    { "subjectName": "English", "addedBy": "teacherId", "class": "10", "school": "School name" }
  ]
}
```

## Frontend Integration Tips
- Set API base URL in `frontend/app/config/api.config.js` to point to backend `/api`.
- Store `accessToken` securely and attach via `Authorization: Bearer <token>`.

## Environment Variables
Define in `backend/.env`:
```
SECRET_KEY=...
JWT_SECRET_KEY=...
MONGO_URI=<Cosmos Mongo connection string>
MONGO_DB_NAME=abled
```

## Cosmos DB (Mongo API)
- Using Azure Cosmos DB for MongoDB API per Microsoft docs: `https://learn.microsoft.com/en-us/azure/cosmos-db/`.
- Collections used:
  - `users`: student and teacher documents.
  - `subjects`: subjects created by teachers. Indexed by `(school, class)`.

## Security Best Practices
- Use Microsoft Entra ID (Azure AD) for centralized auth if integrating enterprise RBAC.
- Restrict Cosmos DB by IP firewall/VNet, enable Defender and diagnostic logs.
- Keep secrets in Azure Key Vault; never commit connection strings.
- JWT school is authoritative; never accept `school` from clients for subjects queries.
