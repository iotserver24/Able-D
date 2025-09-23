# AI Service Quick Reference Guide

## For Windows Users (PowerShell)

### Generate Adaptive Notes
```powershell
$body = @{
    mode = "notes"
    studentType = "vision"  # Options: vision, hearing, speech, dyslexie
    text = "Your content to adapt here"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://127.0.0.1:5000/api/ai" `
    -Method Post `
    -Body $body `
    -ContentType "application/json"

# Display formatted response
$response | ConvertTo-Json
```

### Ask a Question (Q&A Mode)
```powershell
$body = @{
    mode = "qna"
    studentType = "hearing"
    notes = "Your notes content here"
    question = "Your question here"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://127.0.0.1:5000/api/ai" `
    -Method Post `
    -Body $body `
    -ContentType "application/json"
```

### Check Service Health
```powershell
Invoke-RestMethod -Uri "http://127.0.0.1:5000/api/ai/health" -Method Get
```

### Get Statistics
```powershell
Invoke-RestMethod -Uri "http://127.0.0.1:5000/api/ai/stats" -Method Get
```

## For Linux/macOS Users

### Generate Adaptive Notes
```bash
curl -X POST http://127.0.0.1:5000/api/ai \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "notes",
    "studentType": "vision",
    "text": "Your content to adapt here"
  }'
```

### Ask a Question (Q&A Mode)
```bash
curl -X POST http://127.0.0.1:5000/api/ai \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "qna",
    "studentType": "hearing",
    "notes": "Your notes content here",
    "question": "Your question here"
  }'
```

### Check Service Health
```bash
curl -X GET http://127.0.0.1:5000/api/ai/health
```

### Get Statistics
```bash
curl -X GET http://127.0.0.1:5000/api/ai/stats
```

## Python Quick Example

```python
import requests

# Generate notes
response = requests.post('http://127.0.0.1:5000/api/ai', json={
    'mode': 'notes',
    'studentType': 'vision',
    'text': 'Your content here'
})
print(response.json())

# Check health
health = requests.get('http://127.0.0.1:5000/api/ai/health')
print(f"Status: {health.json()['status']}")
```

## Common Issues & Solutions

| Platform | Issue | Solution |
|----------|-------|----------|
| Windows PowerShell | "Cannot bind parameter 'Headers'" error | Use PowerShell syntax, not Linux curl |
| Windows | curl command not working | Use `curl.exe` or PowerShell's `Invoke-RestMethod` |
| All | Text too short error | Ensure text is at least 10 characters |
| All | 503 Service Unavailable | Check GEMINI_API_KEY in .env file |

## Student Types
- `vision` - Screen-reader optimized
- `hearing` - Text-rich explanations
- `speech` - Simple, readable sentences
- `dyslexie` or `dyslexia` - Simplified vocabulary

## Response Fields
- `content` - The adapted content
- `tips` - Study tips for the student type
- `studentType` - Normalized student type
- `_metadata` - Request tracking info (processing_time, request_id, etc.)
