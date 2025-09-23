# Auth API (Able-D)

Base URL: `/api`

## Student Registration
POST `/auth/student/register`

Body:
```json
{
  "studentType": "visually_impaired|hearing_impaired|speech_impaired|slow_learner",
  "name": "Student Name (Required)",
  "class": "Class from 1-12 (Required)",
  "subject": "Subject e.g. Mathematics (Required)",
  "school": "School name (Required)"
}
```

Response 201:
```json
{
  "user": {
    "_id": "student_id_here",
    "role": "student",
    "studentType": "visually_impaired",
    "name": "John Doe",
    "class": "Grade 10",
    "subject": "Mathematics",
    "school": "Test High School",
    "anonymousId": "random_hex_string",
    "createdAt": "2025-09-23T10:25:47.329367Z",
    "updatedAt": "2025-09-23T10:25:47.329367Z"
  },
  "accessToken": "JWT"
}
```

Notes:
- Creates a new student account with all required fields validated.
- Allowed studentType values: `visually_impaired`, `hearing_impaired`, `speech_impaired`, `slow_learner`.
- Returns both `_id` and `anonymousId` for login purposes.
- JWT identity includes: `role`, `studentType`, `class`, `subject`, `school`, `id`.

## Student Login
POST `/auth/student/login`

Body (choose one):
```json
{
  "studentId": "student_mongodb_id_here"
}
```
OR
```json
{
  "anonymousId": "anonymous_id_from_registration"
}
```

Response 200:
```json
{
  "user": {
    "_id": "student_id_here",
    "role": "student",
    "studentType": "visually_impaired",
    "name": "John Doe",
    "class": "Grade 10",
    "subject": "Mathematics",
    "school": "Test High School",
    "anonymousId": "random_hex_string",
    "createdAt": "2025-09-23T10:25:47.329367Z",
    "updatedAt": "2025-09-23T10:25:47.329367Z"
  },
  "accessToken": "JWT"
}
```

Response 404 (Student not found):
```json
{
  "error": "Student not found"
}
```

Response 400 (Validation errors):
```json
{
  "error": "Name is required"
}
```
```json
{
  "error": "Class is required"
}
```
```json
{
  "error": "Subject is required"
}
```
```json
{
  "error": "School is required"
}
```
```json
{
  "error": "Invalid student type"
}
```

Notes:
- Authenticates existing students using either their MongoDB `_id` or `anonymousId`.
- Students must be registered first using the `/auth/student/register` endpoint.
- Use the returned JWT in `Authorization: Bearer <token>` for subsequent requests.
- All fields (name, class, subject, school) are required for registration.

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
