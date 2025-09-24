# Able-D Backend

A Flask-based REST API server that powers the Able-D educational platform, providing AI-powered content generation, document processing, speech services, and user management.

## 🎯 Overview

The backend provides a comprehensive API for:
- **AI-powered content generation** using Google Gemini
- **Document processing** (PDF, DOCX, PPTX)
- **Speech-to-text and text-to-speech** services
- **User authentication** with Firebase
- **Database management** with MongoDB
- **File upload and processing**

## 🛠️ Tech Stack

- **Flask** - Web framework
- **Python 3.8+** - Programming language
- **MongoDB** - Database
- **Firebase Admin SDK** - Authentication
- **Google Gemini AI** - Content generation
- **Azure Cognitive Services** - Speech processing
- **PyMuPDF** - PDF processing
- **python-docx/pptx** - Office document processing

## 📁 Project Structure

```
backend/
├── app/
│   ├── routes/              # API route handlers
│   │   ├── ai.py           # AI content generation
│   │   ├── auth.py         # Authentication endpoints
│   │   ├── students.py     # Student management
│   │   ├── subjects.py     # Subject management
│   │   ├── stt.py          # Speech-to-text
│   │   ├── tts.py          # Text-to-speech
│   │   └── ...
│   ├── services/            # Business logic services
│   │   ├── ai_service.py   # AI service integration
│   │   ├── auth_service.py # Authentication logic
│   │   ├── db.py           # Database operations
│   │   └── ...
│   ├── utils/               # Utility functions
│   └── config.py           # Configuration settings
├── docs/                    # API documentation
├── scripts/                 # Database and utility scripts
├── requirements.txt         # Python dependencies
├── flask_app.py            # Main Flask application
└── run.py                  # Application entry point
```

## 🚀 Getting Started

### Prerequisites

- Python 3.8 or higher
- MongoDB (local or cloud instance)
- Firebase project with Admin SDK
- Azure Speech Services account
- Google AI API key

### Installation

1. **Clone and navigate to backend**
   ```bash
   cd backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Environment setup**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. **Initialize database**
   ```bash
   python scripts/init_database.py
   ```

6. **Run the application**
   ```bash
   python run.py
   ```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the backend directory:

```env
# Flask Configuration
FLASK_ENV=development
FLASK_DEBUG=True
SECRET_KEY=your_secret_key_here

# Database
MONGODB_URI=mongodb://localhost:27017/able-d

# Firebase Authentication
FIREBASE_CREDENTIALS_PATH=path/to/firebase-credentials.json

# Azure Speech Services
AZURE_SPEECH_KEY=your_azure_speech_key
AZURE_SPEECH_REGION=your_azure_region

# Google AI
GEMINI_API_KEY=your_gemini_api_key

# File Upload
MAX_CONTENT_LENGTH=16777216  # 16MB
UPLOAD_FOLDER=uploads

# CORS
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

### Firebase Setup

1. **Download service account key**
   - Go to Firebase Console → Project Settings → Service Accounts
   - Generate new private key
   - Save as `firebase-credentials.json`

2. **Configure environment**
   ```env
   FIREBASE_CREDENTIALS_PATH=./firebase-credentials.json
   ```

## 📚 API Documentation

### Core Endpoints

#### Health Check
```http
GET /api/health
```

#### Authentication
```http
POST /api/auth/login
POST /api/auth/register
POST /api/auth/verify-token
```

#### AI Content Generation
```http
POST /api/ai/generate-notes
POST /api/ai/adapt-content
POST /api/ai/summarize
```

#### Document Processing
```http
POST /api/extract-text
POST /api/process-document
```

#### Speech Services
```http
POST /api/stt
POST /api/tts
```

#### Student Management
```http
GET /api/students
POST /api/students
PUT /api/students/{id}
DELETE /api/students/{id}
```

### Request/Response Examples

#### Generate AI Notes
```http
POST /api/ai/generate-notes
Content-Type: application/json

{
  "text": "Document content here...",
  "student_type": "dyslexia",
  "subject": "mathematics"
}
```

Response:
```json
{
  "notes": "Generated study notes...",
  "metadata": {
    "request_id": "abc123",
    "processing_time": 2.5
  }
}
```

## 🗄️ Database Schema

### Collections

#### Users
```json
{
  "_id": "ObjectId",
  "email": "user@example.com",
  "role": "student|teacher",
  "profile": {
    "name": "User Name",
    "accessibility_needs": ["dyslexia", "vision"]
  },
  "created_at": "2025-01-01T00:00:00Z"
}
```

#### Subjects
```json
{
  "_id": "ObjectId",
  "name": "Mathematics",
  "description": "Basic math concepts",
  "teacher_id": "ObjectId",
  "students": ["ObjectId"],
  "created_at": "2025-01-01T00:00:00Z"
}
```

#### Notes
```json
{
  "_id": "ObjectId",
  "subject_id": "ObjectId",
  "student_id": "ObjectId",
  "content": "Note content...",
  "ai_generated": true,
  "accessibility_type": "dyslexia",
  "created_at": "2025-01-01T00:00:00Z"
}
```

## 🔐 Authentication & Authorization

### Firebase Integration

- **Token verification** for all protected routes
- **Role-based access control** (Student/Teacher)
- **Automatic user creation** on first login
- **Session management** with JWT tokens

### Protected Routes

```python
from functools import wraps
from flask_jwt_extended import jwt_required, get_jwt_identity

@jwt_required()
def protected_route():
    current_user = get_jwt_identity()
    # Route logic here
```

## 🤖 AI Services

### Google Gemini Integration

The backend uses Google Gemini for:
- **Content summarization**
- **Note generation**
- **Accessibility adaptations**
- **Educational content enhancement**

### AI Service Usage

```python
from app.services.ai_service import GeminiService

ai_service = GeminiService()
result = ai_service.generate_notes(
    text="Original content",
    student_type="dyslexia",
    subject="mathematics"
)
```

## 🎵 Speech Services

### Azure Cognitive Services

- **Speech-to-Text** for audio processing
- **Text-to-Speech** for audio generation
- **Multiple language support**
- **Custom voice options**

### STT Service

```python
from app.services.stt_service import STTService

stt = STTService(language="en-US")
success, text = stt.transcribe("audio_file.wav")
```

## 📄 Document Processing

### Supported Formats

- **PDF** - PyMuPDF for text extraction
- **DOCX** - python-docx for Word documents
- **PPTX** - python-pptx for PowerPoint files
- **TXT** - Plain text files

### Document Extractor

```python
from app.services.document_extractor import DocumentExtractor

extractor = DocumentExtractor()
results = extractor.extract("document.pdf")
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
python -m pytest

# Run specific test file
python -m pytest test_ai_endpoints.py

# Run with coverage
python -m pytest --cov=app

# Run with verbose output
python -m pytest -v
```

### Test Structure

```
tests/
├── test_ai_endpoints.py
├── test_auth.py
├── test_document_processing.py
└── test_speech_services.py
```

## 🚀 Deployment

### Production Setup

1. **Environment Configuration**
   ```env
   FLASK_ENV=production
   FLASK_DEBUG=False
   ```

2. **Database Setup**
   ```bash
   python scripts/setup_database.py
   ```

3. **Run with Gunicorn**
   ```bash
   gunicorn -w 4 -b 0.0.0.0:5000 flask_app:app
   ```

### Docker Deployment

```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 5000

CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "flask_app:app"]
```

### Environment-Specific Configs

- **Development** - Local MongoDB, debug enabled
- **Staging** - Cloud MongoDB, limited debug
- **Production** - Cloud MongoDB, no debug, SSL

## 📊 Monitoring & Logging

### Logging Configuration

```python
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
```

### Health Monitoring

- **Health check endpoint** for load balancers
- **Database connection monitoring**
- **External service status checks**
- **Performance metrics collection**

## 🔧 Development Tools

### Database Scripts

```bash
# Initialize database
python scripts/init_database.py

# Backup database
python scripts/backup_database.py

# Cleanup old data
python scripts/cleanup_database.py

# Test database connection
python scripts/test_db_connection.py
```

### Code Quality

```bash
# Format code
black app/

# Lint code
flake8 app/

# Type checking
mypy app/
```

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection**
   - Check MongoDB URI
   - Verify network connectivity
   - Check authentication credentials

2. **Firebase Authentication**
   - Verify service account key
   - Check Firebase project configuration
   - Ensure proper permissions

3. **AI Service Errors**
   - Verify API key validity
   - Check rate limits
   - Monitor API quotas

4. **File Upload Issues**
   - Check file size limits
   - Verify file permissions
   - Ensure upload directory exists

### Debug Mode

Enable debug logging:

```env
FLASK_DEBUG=True
LOG_LEVEL=DEBUG
```

## 📚 Additional Resources

- [Flask Documentation](https://flask.palletsprojects.com/)
- [MongoDB Python Driver](https://pymongo.readthedocs.io/)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin)
- [Google AI Python SDK](https://ai.google.dev/docs)
- [Azure Speech Services](https://docs.microsoft.com/en-us/azure/cognitive-services/speech-service/)

## 🤝 Contributing

1. Follow PEP 8 style guidelines
2. Add type hints for new functions
3. Include docstrings for public methods
4. Write tests for new features
5. Update API documentation

---

**Backend Development** - Powering accessible education with AI. 🚀
