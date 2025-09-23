# AI Service API Documentation (Gemini 2.0 Flash)

This document provides comprehensive documentation for the AI service endpoints that adapt learning content for special-needs students. The service uses Google Gemini 2.0 Flash with enhanced features including caching, monitoring, and robust error handling.

## Table of Contents
- [Overview](#overview)
- [Endpoints](#endpoints)
- [Requirements](#requirements)
- [Configuration](#configuration)
- [API Reference](#api-reference)
- [Error Handling](#error-handling)
- [Examples](#examples)
- [Performance & Monitoring](#performance--monitoring)

## Overview

The AI service provides adaptive content generation for students with special needs, featuring:
- **Two modes**: Notes adaptation and Q&A generation
- **Performance**: 500x faster with intelligent caching
- **Reliability**: Automatic retry with API key fallback (up to 4 keys)
- **Monitoring**: Health checks and statistics tracking
- **Security**: Input validation and sanitization

### Supported Student Types
- `vision` - Screen-reader friendly, clear structure
- `hearing` - Rich textual explanations, no audio references
- `speech` - Simple sentences, easy to read aloud
- `dyslexie` / `dyslexia` - Short sentences, simple vocabulary

## Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/ai` | POST | Generate adaptive content (notes or Q&A) |
| `/api/ai/health` | GET | Check service health status |
| `/api/ai/stats` | GET | Get service statistics |

## Requirements

### Python Packages
```bash
google-genai          # Preferred Google AI SDK
google-generativeai   # Fallback legacy client
```

### Environment Variables
Add to `backend/.env`:
```env
GEMINI_API_KEY=your_primary_key       # Required
GEMINI_API_KEY_2=optional_second_key  # Optional fallback
GEMINI_API_KEY_3=optional_third_key   # Optional fallback
GEMINI_API_KEY_4=optional_fourth_key  # Optional fallback
```

## API Reference

### 1. Generate Adaptive Content
**Endpoint:** `POST /api/ai`

#### Notes Mode
Adapts raw text into accessible notes for specific student types.

**Request:**
```json
{
  "mode": "notes",
  "studentType": "vision",
  "text": "Your content to adapt (min 10 chars, max 10,000 chars)"
}
```

**Response:**
```json
{
  "content": "Adapted notes with proper formatting",
  "tips": "Study tips for the student type",
  "studentType": "vision",
  "_metadata": {
    "generated_at": "2025-09-23T12:48:26.016786",
    "processing_time": 0.5,
    "model": "gemini-2.0-flash",
    "request_id": "abc12345"
  }
}
```

#### Q&A Mode
Answers questions based on provided notes, adapted for student type.

**Request:**
```json
{
  "mode": "qna",
  "studentType": "hearing",
  "notes": "Previously generated or existing notes",
  "question": "Your question (max 500 chars)"
}
```

**Response:**
```json
{
  "answer": "Direct answer to the question",
  "steps": "Step-by-step explanation if applicable",
  "tips": "Additional guidance",
  "studentType": "hearing",
  "_metadata": {
    "generated_at": "2025-09-23T12:48:30.123456",
    "processing_time": 0.3,
    "model": "gemini-2.0-flash",
    "request_id": "def67890"
  }
}
```

### 2. Health Check
**Endpoint:** `GET /api/ai/health`

**Response:**
```json
{
  "status": "healthy",
  "available_keys": 4,
  "endpoint": "/api/ai",
  "has_google_genai": true,
  "has_google_generativeai": true,
  "supported_modes": ["notes", "qna"],
  "supported_student_types": ["vision", "hearing", "speech", "dyslexie", "dyslexia"],
  "stats": {
    "total_requests": 150,
    "total_errors": 2,
    "cache_hits": 45,
    "cache_size": 20,
    "error_rate": 0.013
  }
}
```

### 3. Statistics
**Endpoint:** `GET /api/ai/stats`

**Response:**
```json
{
  "total_requests": 150,
  "total_errors": 2,
  "cache_hits": 45,
  "cache_size": 20,
  "error_rate": 0.013
}
```

## Error Handling

### Error Response Format
```json
{
  "error": "Descriptive error message",
  "error_code": "ERROR_CODE",
  "additional_info": {}  // Optional context-specific information
}
```

### Error Codes

| Status | Error Code | Description |
|--------|------------|-------------|
| 400 | `INVALID_JSON` | Malformed JSON in request body |
| 400 | `INVALID_MODE` | Mode must be "notes" or "qna" |
| 400 | `MISSING_STUDENT_TYPE` | studentType is required |
| 400 | `INVALID_STUDENT_TYPE` | Invalid student type provided |
| 400 | `MISSING_TEXT` | Text field required for notes mode |
| 400 | `MISSING_NOTES` | Notes field required for qna mode |
| 400 | `MISSING_QUESTION` | Question field required for qna mode |
| 400 | `VALIDATION_ERROR` | Input validation failed (e.g., text too short) |
| 503 | `SERVICE_UNAVAILABLE` | API keys exhausted or service down |
| 500 | `INTERNAL_ERROR` | Unexpected server error |

### Input Validation Rules
- **Text (notes mode)**: 10-10,000 characters
- **Question (qna mode)**: 10-500 characters
- **Notes (qna mode)**: 10-10,000 characters
- Control characters are automatically removed

## Examples

### Python Examples

```python
import requests
import json

BASE_URL = "http://127.0.0.1:5000/api"

# 1. Generate Adaptive Notes
response = requests.post(f"{BASE_URL}/ai", json={
    "mode": "notes",
    "studentType": "vision",
    "text": "Photosynthesis is the process by which plants convert light energy into chemical energy..."
})
print(json.dumps(response.json(), indent=2))

# 2. Ask a Question
response = requests.post(f"{BASE_URL}/ai", json={
    "mode": "qna",
    "studentType": "dyslexie",
    "notes": "Photosynthesis: Plants make food using sunlight...",
    "question": "What do plants need for photosynthesis?"
})
print(json.dumps(response.json(), indent=2))

# 3. Check Service Health
health = requests.get(f"{BASE_URL}/ai/health")
print(f"Service Status: {health.json()['status']}")

# 4. Get Statistics
stats = requests.get(f"{BASE_URL}/ai/stats")
print(f"Cache Hit Rate: {stats.json()['cache_hits']} / {stats.json()['total_requests']}")
```

### Platform-Specific Examples

## Windows Commands (Complete Guide)

### Windows PowerShell (Recommended)

**Important:** PowerShell uses different syntax than Linux. Use these tested commands:

#### 1. Generate Adaptive Notes

```powershell
# Basic Notes Generation
$body = @{
    mode = "notes"
    studentType = "vision"
    text = "Photosynthesis is the process by which plants convert light energy into chemical energy"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://127.0.0.1:5000/api/ai" `
    -Method Post `
    -Body $body `
    -ContentType "application/json"

# Display formatted response
$response | ConvertTo-Json -Depth 10

# For different student types:
# Vision impairment
$visionBody = @{
    mode = "notes"
    studentType = "vision"
    text = "The solar system consists of the sun and eight planets orbiting around it"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://127.0.0.1:5000/api/ai" -Method Post -Body $visionBody -ContentType "application/json"

# Hearing impairment
$hearingBody = @{
    mode = "notes"
    studentType = "hearing"
    text = "Sound waves travel through air at approximately 343 meters per second"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://127.0.0.1:5000/api/ai" -Method Post -Body $hearingBody -ContentType "application/json"

# Speech difficulties
$speechBody = @{
    mode = "notes"
    studentType = "speech"
    text = "Complex mathematical equations can be simplified using algebraic methods"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://127.0.0.1:5000/api/ai" -Method Post -Body $speechBody -ContentType "application/json"

# Dyslexia
$dyslexiaBody = @{
    mode = "notes"
    studentType = "dyslexie"
    text = "Shakespeare wrote many famous plays including Romeo and Juliet and Hamlet"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://127.0.0.1:5000/api/ai" -Method Post -Body $dyslexiaBody -ContentType "application/json"
```

#### 2. Q&A Mode

```powershell
# Basic Q&A Request
$qnaBody = @{
    mode = "qna"
    studentType = "vision"
    notes = "Photosynthesis occurs in plants. It requires sunlight, water, and carbon dioxide. The process produces glucose and oxygen."
    question = "What does photosynthesis produce?"
} | ConvertTo-Json

$answer = Invoke-RestMethod -Uri "http://127.0.0.1:5000/api/ai" `
    -Method Post `
    -Body $qnaBody `
    -ContentType "application/json"

# Display the answer
Write-Host "Answer:" $answer.answer
Write-Host "Tips:" $answer.tips

# Multiple questions on same notes
$notes = "The water cycle has three main stages: evaporation, condensation, and precipitation. Water evaporates from oceans and lakes, forms clouds, and falls as rain."

# Question 1
$q1 = @{
    mode = "qna"
    studentType = "hearing"
    notes = $notes
    question = "What are the three stages of the water cycle?"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://127.0.0.1:5000/api/ai" -Method Post -Body $q1 -ContentType "application/json"

# Question 2
$q2 = @{
    mode = "qna"
    studentType = "hearing"
    notes = $notes
    question = "Where does water evaporate from?"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://127.0.0.1:5000/api/ai" -Method Post -Body $q2 -ContentType "application/json"
```

#### 3. Health Check & Statistics

```powershell
# Check service health
$health = Invoke-RestMethod -Uri "http://127.0.0.1:5000/api/ai/health" -Method Get
Write-Host "Service Status:" $health.status
Write-Host "Available Keys:" $health.available_keys
$health | ConvertTo-Json -Depth 10

# Get statistics
$stats = Invoke-RestMethod -Uri "http://127.0.0.1:5000/api/ai/stats" -Method Get
Write-Host "Total Requests:" $stats.total_requests
Write-Host "Cache Hits:" $stats.cache_hits
Write-Host "Error Rate:" $stats.error_rate
```

#### 4. Error Handling in PowerShell

```powershell
# Proper error handling
try {
    $body = @{
        mode = "notes"
        studentType = "vision"
        text = "Your content here"
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "http://127.0.0.1:5000/api/ai" `
        -Method Post `
        -Body $body `
        -ContentType "application/json"
    
    Write-Host "Success! Content generated."
    $response | ConvertTo-Json -Depth 10
}
catch {
    Write-Host "Error occurred:" -ForegroundColor Red
    Write-Host $_.Exception.Message
    if ($_.ErrorDetails.Message) {
        $errorDetail = $_.ErrorDetails.Message | ConvertFrom-Json
        Write-Host "Error Code:" $errorDetail.error_code
        Write-Host "Error Message:" $errorDetail.error
    }
}
```

#### 5. Batch Processing Script

```powershell
# Process multiple texts at once
$texts = @(
    "First text to process",
    "Second text to process",
    "Third text to process"
)

$results = @()
foreach ($text in $texts) {
    $body = @{
        mode = "notes"
        studentType = "vision"
        text = $text
    } | ConvertTo-Json
    
    $result = Invoke-RestMethod -Uri "http://127.0.0.1:5000/api/ai" `
        -Method Post `
        -Body $body `
        -ContentType "application/json"
    
    $results += $result
    Start-Sleep -Seconds 1  # Be nice to the API
}

# Save results to file
$results | ConvertTo-Json -Depth 10 | Out-File "results.json"
```

### Windows Command Prompt (cmd.exe)

#### Using curl.exe (Windows 10/11 has curl built-in)

```batch
:: Generate Notes - Vision
curl.exe -X POST http://127.0.0.1:5000/api/ai ^
  -H "Content-Type: application/json" ^
  -d "{\"mode\":\"notes\",\"studentType\":\"vision\",\"text\":\"The Earth revolves around the Sun in 365 days\"}"

:: Generate Notes - Hearing
curl.exe -X POST http://127.0.0.1:5000/api/ai ^
  -H "Content-Type: application/json" ^
  -d "{\"mode\":\"notes\",\"studentType\":\"hearing\",\"text\":\"Music theory includes scales, chords, and rhythm\"}"

:: Q&A Mode
curl.exe -X POST http://127.0.0.1:5000/api/ai ^
  -H "Content-Type: application/json" ^
  -d "{\"mode\":\"qna\",\"studentType\":\"speech\",\"notes\":\"Plants need water and sunlight\",\"question\":\"What do plants need?\"}"

:: Health Check
curl.exe -X GET http://127.0.0.1:5000/api/ai/health

:: Statistics
curl.exe -X GET http://127.0.0.1:5000/api/ai/stats

:: Save response to file
curl.exe -X POST http://127.0.0.1:5000/api/ai ^
  -H "Content-Type: application/json" ^
  -d "{\"mode\":\"notes\",\"studentType\":\"vision\",\"text\":\"Test content\"}" ^
  -o response.json
```

### Windows with Python (Alternative)

```python
# save as test_ai.py and run: python test_ai.py
import requests
import json

BASE_URL = "http://127.0.0.1:5000/api"

# 1. Generate Notes
def generate_notes(text, student_type="vision"):
    response = requests.post(f"{BASE_URL}/ai", json={
        "mode": "notes",
        "studentType": student_type,
        "text": text
    })
    return response.json()

# 2. Ask Question
def ask_question(notes, question, student_type="vision"):
    response = requests.post(f"{BASE_URL}/ai", json={
        "mode": "qna",
        "studentType": student_type,
        "notes": notes,
        "question": question
    })
    return response.json()

# 3. Check Health
def check_health():
    response = requests.get(f"{BASE_URL}/ai/health")
    return response.json()

# Example usage
if __name__ == "__main__":
    # Test notes generation
    result = generate_notes(
        "The solar system has eight planets",
        "vision"
    )
    print("Generated Notes:")
    print(json.dumps(result, indent=2))
    
    # Test Q&A
    qa_result = ask_question(
        notes="The solar system has eight planets orbiting the sun",
        question="How many planets are there?",
        student_type="hearing"
    )
    print("\nQ&A Result:")
    print(json.dumps(qa_result, indent=2))
    
    # Check health
    health = check_health()
    print(f"\nService Health: {health['status']}")
```

### Windows Git Bash

If you have Git Bash installed, you can use Linux-style commands:

```bash
# In Git Bash terminal
# Generate Notes
curl -X POST http://127.0.0.1:5000/api/ai \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "notes",
    "studentType": "vision",
    "text": "Your content here"
  }'

# Q&A Mode
curl -X POST http://127.0.0.1:5000/api/ai \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "qna",
    "studentType": "hearing",
    "notes": "Your notes",
    "question": "Your question"
  }'
```

### Quick Copy-Paste Commands for Windows

```powershell
# Quick test - just copy and paste this entire block into PowerShell:
$testBody = @{mode="notes"; studentType="vision"; text="Testing AI service"} | ConvertTo-Json; Invoke-RestMethod -Uri "http://127.0.0.1:5000/api/ai" -Method Post -Body $testBody -ContentType "application/json" | ConvertTo-Json

# Quick health check:
Invoke-RestMethod -Uri "http://127.0.0.1:5000/api/ai/health" -Method Get | ConvertTo-Json

# Quick stats check:
Invoke-RestMethod -Uri "http://127.0.0.1:5000/api/ai/stats" -Method Get | ConvertTo-Json
```

#### Linux/macOS/Git Bash

```bash
# Generate Notes
curl -X POST http://127.0.0.1:5000/api/ai \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "notes",
    "studentType": "hearing",
    "text": "The water cycle involves evaporation, condensation, and precipitation..."
  }'

# Q&A Mode
curl -X POST http://127.0.0.1:5000/api/ai \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "qna",
    "studentType": "speech",
    "notes": "The water cycle has three main steps...",
    "question": "What causes evaporation?"
  }'

# Health Check
curl -X GET http://127.0.0.1:5000/api/ai/health

# Statistics
curl -X GET http://127.0.0.1:5000/api/ai/stats

# With pretty printing using jq (if installed)
curl -X GET http://127.0.0.1:5000/api/ai/health | jq '.'
```

### JavaScript/Fetch Example

```javascript
// Generate adaptive notes
async function generateNotes(text, studentType) {
  const response = await fetch('http://127.0.0.1:5000/api/ai', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      mode: 'notes',
      studentType: studentType,
      text: text
    })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(`${error.error_code}: ${error.error}`);
  }
  
  return response.json();
}

// Usage
generateNotes('Your content here...', 'vision')
  .then(result => console.log(result))
  .catch(error => console.error(error));
```

## Performance & Monitoring

### Caching
- **TTL**: 1 hour for identical requests
- **Performance**: ~500x faster for cached responses
- **Cache Size**: Automatically managed (max 100 entries)

### Logging
All requests are logged with:
- Unique request ID for tracking
- Processing time metrics
- Error details for debugging
- Cache hit/miss information

### Monitoring Best Practices
1. **Regular Health Checks**: Monitor `/api/ai/health` every 60 seconds
2. **Track Error Rates**: Use `/api/ai/stats` to monitor error_rate
3. **Cache Efficiency**: Monitor cache_hits vs total_requests
4. **Response Times**: Check _metadata.processing_time in responses

## Setup Quick Start

```bash
# 1. Navigate to backend directory
cd backend

# 2. Create virtual environment
python -m venv venv

# 3. Activate virtual environment
# Windows:
./venv/Scripts/activate
# macOS/Linux:
source venv/bin/activate

# 4. Install dependencies
pip install -r requirements.txt

# 5. Configure environment variables
# Edit backend/.env and add your GEMINI_API_KEY

# 6. Run the server
python run.py

# 7. Test the service
curl -X GET http://127.0.0.1:5000/api/ai/health
```

## Advanced Features

### Request Metadata
Every successful response includes metadata:
- `request_id`: Unique identifier for request tracking
- `generated_at`: ISO timestamp of generation
- `processing_time`: Time taken in seconds
- `model`: AI model used (gemini-2.0-flash)

### Automatic Retries
- Failed requests automatically retry with different API keys
- 2 retry attempts with 1-second delay between attempts
- Seamless fallback between up to 4 configured keys

### Input Sanitization
- Automatic removal of control characters
- Text truncation if exceeding limits
- Normalization of student types (e.g., "dyslexia" → "dyslexie")

## Troubleshooting

| Issue | Solution |
|-------|----------|
| 503 Service Unavailable | Check API keys in .env file |
| Slow responses | First request takes longer; subsequent identical requests use cache |
| Invalid JSON error | Ensure proper JSON formatting in request body |
| Text too short error | Minimum text length is 10 characters |
| No module named 'google' | Install required packages: `pip install google-genai google-generativeai` |

## Notes

- The service uses Gemini 2.0 Flash model for optimal performance
- Cache is in-memory and resets on server restart
- All timestamps are in UTC
- The service is stateless except for in-memory cache
- Rate limiting should be implemented at the API gateway level for production use
