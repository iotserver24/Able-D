# Student API Guide

This guide explains how students authenticate and fetch subjects, topics, and tailored notes based on their needs (vision/hearing/speech/dyslexie). It also covers how items are saved.

## Overview
- Auth: JWT via student or teacher login. Student flows should use student JWTs.
- Data: Notes in MongoDB `notes` under `school` → `class` → `subject` → `topic` with multiple representations:
  - Base text: `text`
  - Dyslexie text: `variants.dyslexie`
  - Audio (blind): `variants.audioUrl` (Catbox URL)

Supported types: `vision`, `hearing`, `speech`, `dyslexie` (alias `dyslexia`).

## Auth

### POST /api/auth/student/register
```json
{
  "studentType": "vision|hearing|speech|dyslexie",
  "name": "John",
  "class": "10",
  "subject": "Science",
  "school": "DemoSchool",
  "email": "student@example.com",
  "password": "secret123"
}
```
Response: `{ "user": { ... }, "accessToken": "<JWT>" }`

### POST /api/auth/student/login
```json
{ "email": "student@example.com", "password": "secret123" }
```
Response: `{ "user": { ... }, "accessToken": "<JWT>" }`

## Subjects

### GET /api/subjects?class=10
Headers: `Authorization: Bearer <JWT>`
Response:
```json
{ "items": [ { "subjectName": "science" }, { "subjectName": "english" } ] }
```

## Topics

### GET /api/students/topics?school=DemoSchool&class=10&subject=Science
Headers: `Authorization: Bearer <JWT>`
Response:
```json
{ "items": [ "Biology", "Biology-Audio" ] }
```

## Tailored Notes

### GET /api/students/notes?school=DemoSchool&class=10&subject=Science&topic=Biology&studentType=dyslexie
Headers: `Authorization: Bearer <JWT>`
Response:
```json
{
  "note": {
    "school": "DemoSchool",
    "class": "10",
    "subject": "Science",
    "topic": "Biology",
    "studentType": "dyslexie",
    "content": "<dyslexie text or base text>",
    "audioUrl": "https://files.catbox.moe/<id>.mp3",
    "tips": "<optional study tips>",
    "_id": "68d2...",
    "updatedAt": "2025-09-23T...Z"
  }
}
```
Selection rules:
- If `studentType=dyslexie` and variant exists → use it; else fall back to base `text`.
- Always include `audioUrl` when available.

## Data Model (notes)
```json
{
  "school": "DemoSchool",
  "class": "10",
  "subject": "Science",
  "topic": "Biology",
  "text": "<base text>",
  "variants": {
    "dyslexie": "<adapted text>",
    "audioUrl": "https://files.catbox.moe/<id>.mp3",
    "meta": { "dyslexieTips": "<tips>" }
  },
  "uploadedBy": "teacher@example.com",
  "createdAt": "2025-09-23T...Z",
  "updatedAt": "2025-09-23T...Z"
}
```
Indexes: `(school, class, subject, topic)`, `uploadedBy`, `createdAt`.

## Files
- Routes: `app/routes/students.py`, `app/routes/subjects.py`
- Services: `app/services/notes_service.py`, `app/services/subject_service.py`
- Related: `app/routes/teacher_upload.py`, `app/services/ai_service.py`, `app/services/tts_service.py`, `app/services/catbox_service.py`
