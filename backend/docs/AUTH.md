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
  "school": "School name (Required)",
  "email": "student@example.com (Required)",
  "password": "password123 (Required, min 6 chars)"
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
    "email": "john@example.com",
    "anonymousId": "random_hex_string",
    "createdAt": "2025-09-23T10:25:47.329367Z",
    "updatedAt": "2025-09-23T10:25:47.329367Z"
  },
  "accessToken": "JWT"
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
  "error": "Email is required"
}
```
```json
{
  "error": "Password must be at least 6 characters"
}
```
```json
{
  "error": "Invalid email"
}
```
```json
{
  "error": "Email already registered"
}
```
```json
{
  "error": "Invalid student type"
}
```

Notes:
- Creates a new student account with email and password authentication.
- Allowed studentType values: `visually_impaired`, `hearing_impaired`, `speech_impaired`, `slow_learner`.
- Email must be unique across all users (students and teachers).
- Password is hashed using bcrypt before storage.
- JWT identity includes: `role`, `studentType`, `class`, `subject`, `school`, `id`.

## Student Login
POST `/auth/student/login`

Body:
```json
{
  "email": "student@example.com",
  "password": "password123"
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
    "email": "john@example.com",
    "anonymousId": "random_hex_string",
    "createdAt": "2025-09-23T10:25:47.329367Z",
    "updatedAt": "2025-09-23T10:25:47.329367Z"
  },
  "accessToken": "JWT"
}
```

Response 401 (Invalid credentials):
```json
{
  "error": "Invalid email or password"
}
```

Response 400 (Missing fields):
```json
{
  "error": "Email and password are required"
}
```

Notes:
- Authenticates students using email and password.
- Students must be registered first using the `/auth/student/register` endpoint.
- Use the returned JWT in `Authorization: Bearer <token>` for subsequent requests.
- Password verification is done using bcrypt hash comparison.

## Teacher Register
POST `/auth/teacher/register`

Body:
```json
{
  "name": "Alice (Required)",
  "email": "alice@school.edu (Required)",
  "password": "secret123 (Required, min 6 chars)",
  "school": "School name (Optional)"
}
```

Response 201:
```json
{
  "user": { 
    "role": "teacher", 
    "name": "Alice", 
    "email": "alice@school.edu", 
    "school": "School name",
    "_id": "teacher_id_here",
    "createdAt": "2025-09-23T10:25:46.983166Z",
    "updatedAt": "2025-09-23T10:25:46.983166Z"
  },
  "accessToken": "JWT"
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
  "error": "Email is required"
}
```
```json
{
  "error": "Password must be at least 6 characters"
}
```
```json
{
  "error": "Invalid email"
}
```
```json
{
  "error": "Email already registered"
}
```

Notes:
- Creates a new teacher account with email and password authentication.
- Email must be unique across all users (students and teachers).
- Password is hashed using bcrypt before storage.
- JWT identity includes: `role`, `email`, `school`.

## Teacher Login
POST `/auth/teacher/login`

Body:
```json
{ 
  "email": "alice@school.edu (Required)", 
  "password": "secret123 (Required)" 
}
```

Response 200:
```json
{
  "user": { 
    "role": "teacher", 
    "name": "Alice", 
    "email": "alice@school.edu", 
    "school": "School name",
    "_id": "teacher_id_here",
    "createdAt": "2025-09-23T10:25:46.983166Z",
    "updatedAt": "2025-09-23T10:25:46.983166Z"
  },
  "accessToken": "JWT"
}
```

Response 401 (Invalid credentials):
```json
{
  "error": "Invalid email or password"
}
```

Response 400 (Missing fields):
```json
{
  "error": "Email and password are required"
}
```

Notes:
- Authenticates teachers using email and password.
- Teachers must be registered first using the `/auth/teacher/register` endpoint.
- Use the returned JWT in `Authorization: Bearer <token>` for subsequent requests.
- Password verification is done using bcrypt hash comparison.

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
