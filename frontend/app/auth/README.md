# Authentication System Documentation

## Overview
This authentication system provides secure login and registration for both students and teachers, integrating with the backend API as specified in `backend/docs/AUTH.md`.

## Architecture

### Components Structure
```
frontend/app/
├── auth/                           # Authentication components
│   └── README.md                   # This documentation
├── services/
│   └── auth.service.js            # API service layer for auth
├── contexts/
│   └── AuthContext.jsx            # Global auth state management
├── config/
│   └── api.config.js              # API configuration
├── components/
│   └── ProtectedRoute.jsx        # Route protection component
└── routes/
    ├── index.jsx                  # Home page with login options
    ├── auth.student.jsx           # Student login/register
    ├── auth.teacher.jsx           # Teacher login/register
    ├── student.dashboard.jsx      # Protected student dashboard
    └── teacher.dashboard.jsx      # Protected teacher dashboard
```

## Features

### 1. **Dual Authentication System**
- Separate authentication flows for students and teachers
- Different registration requirements for each role
- Role-based dashboard redirection

### 2. **Student Authentication**
- **Registration Fields:**
  - Name (required)
  - Email (required, unique)
  - Password (required, min 6 chars)
  - Student Type (visually_impaired, hearing_impaired, speech_impaired, slow_learner)
  - Class (1-12)
  - Subject
  - School name
  
- **Login:** Email and password only

### 3. **Teacher Authentication**
- **Registration Fields:**
  - Name (required)
  - Email (required, unique)
  - Password (required, min 6 chars)
  - School (optional)
  
- **Login:** Email and password only

### 4. **Security Features**
- JWT token-based authentication
- Tokens stored in localStorage
- Automatic token verification on app load
- Protected routes with role-based access control
- Automatic logout on token expiration

## API Integration

### Endpoints Used
- `POST /api/auth/student/register` - Student registration
- `POST /api/auth/student/login` - Student login
- `POST /api/auth/teacher/register` - Teacher registration
- `POST /api/auth/teacher/login` - Teacher login
- `GET /api/auth/verify` - Token verification

### Configuration
Set the backend API URL in your environment file:
```bash
# Create .env file in frontend directory
cp .env.example .env

# Edit .env and set your backend URL
REACT_APP_API_URL=http://localhost:5000
```

## Usage

### AuthContext API
```javascript
import { useAuth } from '../contexts/AuthContext';

function MyComponent() {
  const {
    user,              // Current user object
    isAuthenticated,   // Boolean auth status
    isLoading,        // Loading state
    error,            // Error message
    registerStudent,  // Function to register student
    loginStudent,     // Function to login student
    registerTeacher,  // Function to register teacher
    loginTeacher,     // Function to login teacher
    logout,           // Function to logout
    clearError,       // Function to clear errors
  } = useAuth();
}
```

### Protected Routes
```javascript
import { ProtectedRoute } from '../components/ProtectedRoute';

// Protect a route for students only
<ProtectedRoute requiredRole="student">
  <StudentDashboard />
</ProtectedRoute>

// Protect a route for teachers only
<ProtectedRoute requiredRole="teacher">
  <TeacherDashboard />
</ProtectedRoute>
```

### Authentication Service
```javascript
import authService from '../services/auth.service';

// Direct API calls (usually handled by AuthContext)
const result = await authService.loginStudent(email, password);
if (result.success) {
  // User logged in successfully
  console.log(result.data.user);
  console.log(result.data.accessToken);
}
```

## User Flow

### Student Registration/Login Flow
1. User clicks "Login" on home page
2. Selects "I'm a Student"
3. Redirected to `/auth/student`
4. Can toggle between login and registration
5. For registration:
   - Fills all required fields including accessibility needs
   - Submits form
   - On success, redirected to `/student/dashboard`
6. For login:
   - Enters email and password
   - On success, redirected to `/student/dashboard`

### Teacher Registration/Login Flow
1. User clicks "Login" on home page
2. Selects "I'm a Teacher"
3. Redirected to `/auth/teacher`
4. Can toggle between login and registration
5. For registration:
   - Fills required fields
   - Submits form
   - On success, redirected to `/teacher/dashboard`
6. For login:
   - Enters email and password
   - On success, redirected to `/teacher/dashboard`

## Error Handling

### Common Error Messages
- "Email already registered" - Email is already in use
- "Invalid email or password" - Login credentials incorrect
- "Email and password are required" - Missing required fields
- "Password must be at least 6 characters" - Password too short
- "Invalid student type" - Invalid accessibility type selected

### Error Display
- Errors are displayed in red alert boxes above the form
- Field-specific errors appear below each input
- Errors clear when user starts typing

## State Management

### Authentication State
The AuthContext maintains:
- `user` - Current user object with role, name, email, etc.
- `isAuthenticated` - Boolean indicating auth status
- `isLoading` - Loading state for async operations
- `error` - Current error message

### Token Management
- Tokens are stored in localStorage
- Tokens are included in API requests via Authorization header
- Token verification happens on app load
- Invalid tokens trigger automatic logout

## Accessibility Features

### For Visually Impaired Students
- TTS welcome popup after login
- Automatic page content reading
- Keyboard navigation support
- High contrast UI options

### Form Accessibility
- Proper label associations
- Error announcements
- Focus management
- Keyboard navigation

## Testing

### Manual Testing Checklist
1. **Student Registration**
   - [ ] All fields validate correctly
   - [ ] Email uniqueness is enforced
   - [ ] Password minimum length works
   - [ ] Successful registration redirects to dashboard
   - [ ] Error messages display correctly

2. **Student Login**
   - [ ] Valid credentials log in successfully
   - [ ] Invalid credentials show error
   - [ ] Empty fields show validation errors
   - [ ] Successful login redirects to dashboard

3. **Teacher Registration/Login**
   - [ ] Same as student but with teacher-specific fields
   - [ ] Redirects to teacher dashboard

4. **Protected Routes**
   - [ ] Unauthenticated users redirect to login
   - [ ] Students can't access teacher dashboard
   - [ ] Teachers can't access student dashboard
   - [ ] Token expiry triggers logout

5. **TTS Integration (Visually Impaired)**
   - [ ] Welcome popup appears after login
   - [ ] TTS controls work correctly
   - [ ] Page content is read automatically

## Troubleshooting

### Common Issues

1. **"Network Error" or Can't Connect to Backend**
   - Check if backend is running on correct port
   - Verify REACT_APP_API_URL in .env file
   - Check CORS settings in backend

2. **Login Successful but Redirects Back to Login**
   - Check if token is being saved to localStorage
   - Verify token format from backend
   - Check browser console for errors

3. **"Invalid token" Errors**
   - Token may be expired
   - Try logging out and back in
   - Check backend JWT configuration

4. **Registration Fails Silently**
   - Check network tab for API response
   - Verify all required fields are filled
   - Check backend logs for errors

## Security Considerations

1. **Never commit .env files** with real API URLs or keys
2. **Use HTTPS in production** for all API calls
3. **Implement token refresh** mechanism for long sessions
4. **Add rate limiting** on backend for auth endpoints
5. **Validate all inputs** on both frontend and backend
6. **Sanitize user inputs** to prevent XSS attacks

## Future Enhancements

- [ ] OAuth integration (Google, Microsoft)
- [ ] Two-factor authentication
- [ ] Password reset functionality
- [ ] Remember me option
- [ ] Session timeout warnings
- [ ] Email verification
- [ ] Admin role support
- [ ] Biometric authentication for mobile
