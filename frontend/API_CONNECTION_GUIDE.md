# Frontend-Backend API Connection Guide

This guide explains how to configure the connection between the frontend and backend.

## Environment Configuration

The frontend uses environment variables to connect to the backend API. The configuration is managed through `.env` files.

### Environment Files

- `.env` - Active configuration (not committed to git)
- `.env.example` - Template for environment variables

### API Base URL Configuration

Set the `VITE_API_BASE_URL` environment variable to point to your backend:

```bash
# For local development
VITE_API_BASE_URL=http://127.0.0.1:5000

# For production (hosted backend)
VITE_API_BASE_URL=https://able-d.onrender.com
```

### Available API Endpoints

The frontend is configured to work with the following backend endpoints:

#### Authentication
- `POST /api/auth/teacher/login` - Teacher login
- `POST /api/auth/teacher/register` - Teacher registration
- `POST /api/auth/student/login` - Student login
- `POST /api/auth/student/register` - Student registration
- `GET /api/auth/verify` - Token verification

#### Teacher Features
- `POST /api/teacher/upload` - Upload educational content

#### AI Services
- `POST /api/ai` - AI-powered content processing

#### Subjects
- `GET /api/subjects?school=...&class=...` - Get available subjects for school/class

## Configuration Files

### API Configuration (`src/config/api.ts`)
- Centralized API configuration
- Environment variable handling
- Endpoint definitions
- Helper functions for API calls

### API Service (`src/services/api.ts`)
- Generic API call functions
- Authentication handling
- Form data support
- Error handling

### Subjects Service (`src/services/subjectsService.ts`)
- Fetch available subjects from backend
- Handle subject data formatting
- Fallback to default subjects

### Subjects Hook (`src/hooks/useSubjects.ts`)
- React hook for managing subjects state
- Automatic fetching when school/class changes
- Loading and error state management

## Usage

### Making API Calls

```typescript
import { apiCall, authenticatedApiCall, formDataApiCall } from '@/services/api';
import { API_ENDPOINTS } from '@/config/api';

// Simple API call
const data = await apiCall(API_ENDPOINTS.AUTH.TEACHER_LOGIN, {
  method: 'POST',
  body: JSON.stringify({ email, password })
});

// Authenticated API call
const userData = await authenticatedApiCall(
  API_ENDPOINTS.AUTH.VERIFY,
  token,
  { method: 'GET' }
);

// Form data API call (for file uploads)
const formData = new FormData();
formData.append('file', file);
const result = await formDataApiCall(
  API_ENDPOINTS.TEACHER.UPLOAD,
  formData,
  token
);
```

### Fetching Subjects

```typescript
import { useSubjects } from '@/hooks/useSubjects';

const MyComponent = () => {
  const { subjects, isLoading, error } = useSubjects({
    school: 'DemoSchool',
    class: '10',
    enabled: true
  });

  return (
    <div>
      {isLoading ? (
        <div>Loading subjects...</div>
      ) : (
        <select>
          {subjects.map(subject => (
            <option key={subject} value={subject}>
              {subject}
            </option>
          ))}
        </select>
      )}
    </div>
  );
};
```

### Authentication Context

The `AuthContext` automatically uses the configured API endpoints:

```typescript
import { useAuth } from '@/contexts/AuthContext';

const { login, register, user, isAuthenticated } = useAuth();

// Login with automatic API endpoint resolution
await login(email, password, 'teacher');
```

## Development vs Production

### Development Setup
1. Copy `.env.example` to `.env`
2. Set `VITE_API_BASE_URL=http://127.0.0.1:5000`
3. Ensure backend is running locally on port 5000

### Production Setup
1. Set `VITE_API_BASE_URL=https://able-d.onrender.com`
2. Deploy frontend with environment variable configured

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure backend has CORS configured for frontend domain
2. **Connection Refused**: Check if backend URL is correct and accessible
3. **Authentication Failures**: Verify token format and backend authentication logic

### Testing Connection

You can test the API connection by:
1. Opening browser developer tools
2. Checking network requests in the Network tab
3. Verifying API calls are going to the correct endpoints

## Security Notes

- Never commit `.env` files to version control
- Use HTTPS in production
- Validate all API responses on the frontend
- Implement proper error handling for network failures
