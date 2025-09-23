# Frontend Database Service Integration

This document provides a complete guide for integrating the backend database services with the frontend, including ready-to-use code examples and best practices.

## Table of Contents
1. [Database Service Setup](#database-service-setup)
2. [React Hooks](#react-hooks)
3. [API Integration Examples](#api-integration-examples)
4. [Error Handling](#error-handling)
5. [Authentication Integration](#authentication-integration)
6. [Real-time Updates](#real-time-updates)

## Database Service Setup

### 1. Create Database Service

Create `frontend/app/services/database.service.js`:

```javascript
/**
 * Database Service - Complete integration with Able-D backend
 * Handles all database operations including authentication, CRUD operations, and real-time updates
 */

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class DatabaseService {
  constructor() {
    this.token = localStorage.getItem('accessToken');
    this.refreshToken = localStorage.getItem('refreshToken');
    this.baseURL = API_BASE;
  }

  /**
   * Set authentication token
   */
  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('accessToken', token);
    } else {
      localStorage.removeItem('accessToken');
    }
  }

  /**
   * Clear authentication tokens
   */
  clearTokens() {
    this.token = null;
    this.refreshToken = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  /**
   * Make authenticated request to API
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers
      },
      ...options
    };

    try {
      const response = await fetch(url, config);
      
      // Handle token expiration
      if (response.status === 401) {
        this.clearTokens();
        window.location.href = '/login';
        throw new Error('Authentication expired');
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Request failed: ${response.statusText}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('Database request failed:', error);
      throw error;
    }
  }

  // ============================================================================
  // AUTHENTICATION METHODS
  // ============================================================================

  /**
   * Register a new student
   */
  async registerStudent(studentData) {
    return this.request('/auth/student/register', {
      method: 'POST',
      body: JSON.stringify(studentData)
    });
  }

  /**
   * Login student
   */
  async loginStudent(credentials) {
    const response = await this.request('/auth/student/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
    
    if (response.accessToken) {
      this.setToken(response.accessToken);
    }
    
    return response;
  }

  /**
   * Register a new teacher
   */
  async registerTeacher(teacherData) {
    return this.request('/auth/teacher/register', {
      method: 'POST',
      body: JSON.stringify(teacherData)
    });
  }

  /**
   * Login teacher
   */
  async loginTeacher(credentials) {
    const response = await this.request('/auth/teacher/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
    
    if (response.accessToken) {
      this.setToken(response.accessToken);
    }
    
    return response;
  }

  /**
   * Logout user
   */
  logout() {
    this.clearTokens();
  }

  // ============================================================================
  // USER MANAGEMENT METHODS
  // ============================================================================

  /**
   * Get current user profile
   */
  async getCurrentUser() {
    return this.request('/users/profile');
  }

  /**
   * Update user profile
   */
  async updateUserProfile(profileData) {
    return this.request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
  }

  /**
   * Get user statistics
   */
  async getUserStats() {
    return this.request('/users/stats');
  }

  // ============================================================================
  // SUBJECT MANAGEMENT METHODS
  // ============================================================================

  /**
   * Get subjects for a specific school and class
   */
  async getSubjects(school, className) {
    const params = new URLSearchParams({ school, class: className });
    return this.request(`/subjects?${params}`);
  }

  /**
   * Add a new subject
   */
  async addSubject(subjectData) {
    return this.request('/subjects', {
      method: 'POST',
      body: JSON.stringify(subjectData)
    });
  }

  /**
   * Update subject
   */
  async updateSubject(subjectId, subjectData) {
    return this.request(`/subjects/${subjectId}`, {
      method: 'PUT',
      body: JSON.stringify(subjectData)
    });
  }

  /**
   * Delete subject
   */
  async deleteSubject(subjectId) {
    return this.request(`/subjects/${subjectId}`, {
      method: 'DELETE'
    });
  }

  // ============================================================================
  // NOTES MANAGEMENT METHODS
  // ============================================================================

  /**
   * Get notes with optional filters
   */
  async getNotes(filters = {}) {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        params.append(key, value);
      }
    });
    
    const queryString = params.toString();
    return this.request(`/notes${queryString ? `?${queryString}` : ''}`);
  }

  /**
   * Get a specific note by ID
   */
  async getNote(noteId) {
    return this.request(`/notes/${noteId}`);
  }

  /**
   * Save a new note
   */
  async saveNote(noteData) {
    return this.request('/notes', {
      method: 'POST',
      body: JSON.stringify(noteData)
    });
  }

  /**
   * Update an existing note
   */
  async updateNote(noteId, noteData) {
    return this.request(`/notes/${noteId}`, {
      method: 'PUT',
      body: JSON.stringify(noteData)
    });
  }

  /**
   * Delete a note
   */
  async deleteNote(noteId) {
    return this.request(`/notes/${noteId}`, {
      method: 'DELETE'
    });
  }

  /**
   * Search notes
   */
  async searchNotes(query, filters = {}) {
    const params = new URLSearchParams({ q: query });
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        params.append(key, value);
      }
    });
    
    return this.request(`/notes/search?${params}`);
  }

  // ============================================================================
  // AI SERVICE METHODS
  // ============================================================================

  /**
   * Generate adaptive notes using AI
   */
  async generateAdaptiveNotes(text, studentType) {
    return this.request('/ai', {
      method: 'POST',
      body: JSON.stringify({
        mode: 'notes',
        studentType,
        text
      })
    });
  }

  /**
   * Generate Q&A using AI
   */
  async generateQnA(notes, studentType, question) {
    return this.request('/ai', {
      method: 'POST',
      body: JSON.stringify({
        mode: 'qna',
        studentType,
        notes,
        question
      })
    });
  }

  /**
   * Get AI service health
   */
  async getAIHealth() {
    return this.request('/ai/health');
  }

  /**
   * Get AI service statistics
   */
  async getAIStats() {
    return this.request('/ai/stats');
  }

  // ============================================================================
  // DOCUMENT PROCESSING METHODS
  // ============================================================================

  /**
   * Extract text from uploaded document
   */
  async extractTextFromDocument(file) {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${this.baseURL}/extract-text`, {
      method: 'POST',
      headers: {
        ...(this.token && { Authorization: `Bearer ${this.token}` })
      },
      body: formData
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Document extraction failed');
    }
    
    return response.json();
  }

  /**
   * Convert speech to text
   */
  async speechToText(audioFile, language = 'en-US') {
    const formData = new FormData();
    formData.append('audio', audioFile);
    formData.append('language', language);
    
    const response = await fetch(`${this.baseURL}/stt`, {
      method: 'POST',
      headers: {
        ...(this.token && { Authorization: `Bearer ${this.token}` })
      },
      body: formData
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Speech-to-text conversion failed');
    }
    
    return response.json();
  }

  /**
   * Convert text to speech
   */
  async textToSpeech(text, voice = null) {
    return this.request('/tts', {
      method: 'POST',
      body: JSON.stringify({ text, voice })
    });
  }

  // ============================================================================
  // DATABASE MANAGEMENT METHODS (Admin/Teacher only)
  // ============================================================================

  /**
   * Get database health status
   */
  async getDatabaseHealth() {
    return this.request('/db/health');
  }

  /**
   * Get database statistics
   */
  async getDatabaseStats() {
    return this.request('/db/stats');
  }

  /**
   * Get database performance metrics
   */
  async getDatabasePerformance() {
    return this.request('/db/performance');
  }

  /**
   * List all database collections
   */
  async listCollections() {
    return this.request('/db/collections');
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return !!this.token;
  }

  /**
   * Get current user role
   */
  getCurrentUserRole() {
    try {
      const token = this.token;
      if (!token) return null;
      
      // Decode JWT token (basic implementation)
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.role;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  /**
   * Check if user has specific role
   */
  hasRole(role) {
    const userRole = this.getCurrentUserRole();
    return userRole === role;
  }

  /**
   * Check if user is admin
   */
  isAdmin() {
    return this.hasRole('admin');
  }

  /**
   * Check if user is teacher
   */
  isTeacher() {
    return this.hasRole('teacher');
  }

  /**
   * Check if user is student
   */
  isStudent() {
    return this.hasRole('student');
  }
}

// Create and export singleton instance
const databaseService = new DatabaseService();
export default databaseService;
```

## React Hooks

### 1. Database Hook

Create `frontend/app/hooks/useDatabase.js`:

```javascript
import { useState, useEffect, useCallback } from 'react';
import databaseService from '../services/database.service';

/**
 * Custom hook for database operations
 */
export const useDatabase = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (operation) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await operation();
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return { 
    execute, 
    loading, 
    error, 
    clearError,
    isAuthenticated: databaseService.isAuthenticated(),
    currentUserRole: databaseService.getCurrentUserRole()
  };
};
```

### 2. Authentication Hook

Create `frontend/app/hooks/useAuth.js`:

```javascript
import { useState, useEffect, useCallback } from 'react';
import databaseService from '../services/database.service';

/**
 * Custom hook for authentication
 */
export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user on mount
  useEffect(() => {
    loadCurrentUser();
  }, []);

  const loadCurrentUser = useCallback(async () => {
    if (!databaseService.isAuthenticated()) {
      setLoading(false);
      return;
    }

    try {
      const userData = await databaseService.getCurrentUser();
      setUser(userData);
    } catch (error) {
      console.error('Failed to load current user:', error);
      databaseService.logout();
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (credentials, userType) => {
    try {
      const response = userType === 'student' 
        ? await databaseService.loginStudent(credentials)
        : await databaseService.loginTeacher(credentials);
      
      setUser(response.user);
      return response;
    } catch (error) {
      throw error;
    }
  }, []);

  const register = useCallback(async (userData, userType) => {
    try {
      const response = userType === 'student'
        ? await databaseService.registerStudent(userData)
        : await databaseService.registerTeacher(userData);
      
      setUser(response.user);
      return response;
    } catch (error) {
      throw error;
    }
  }, []);

  const logout = useCallback(() => {
    databaseService.logout();
    setUser(null);
  }, []);

  return {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isTeacher: user?.role === 'teacher',
    isStudent: user?.role === 'student'
  };
};
```

### 3. Data Fetching Hooks

Create `frontend/app/hooks/useData.js`:

```javascript
import { useState, useEffect, useCallback } from 'react';
import databaseService from '../services/database.service';

/**
 * Hook for fetching subjects
 */
export const useSubjects = (school, className) => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSubjects = useCallback(async () => {
    if (!school || !className) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await databaseService.getSubjects(school, className);
      setSubjects(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [school, className]);

  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  return { subjects, loading, error, refetch: fetchSubjects };
};

/**
 * Hook for fetching notes
 */
export const useNotes = (filters = {}) => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await databaseService.getNotes(filters);
      setNotes(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const addNote = useCallback(async (noteData) => {
    try {
      const newNote = await databaseService.saveNote(noteData);
      setNotes(prev => [newNote, ...prev]);
      return newNote;
    } catch (error) {
      throw error;
    }
  }, []);

  const updateNote = useCallback(async (noteId, noteData) => {
    try {
      const updatedNote = await databaseService.updateNote(noteId, noteData);
      setNotes(prev => prev.map(note => 
        note._id === noteId ? updatedNote : note
      ));
      return updatedNote;
    } catch (error) {
      throw error;
    }
  }, []);

  const deleteNote = useCallback(async (noteId) => {
    try {
      await databaseService.deleteNote(noteId);
      setNotes(prev => prev.filter(note => note._id !== noteId));
    } catch (error) {
      throw error;
    }
  }, []);

  return { 
    notes, 
    loading, 
    error, 
    refetch: fetchNotes,
    addNote,
    updateNote,
    deleteNote
  };
};
```

## API Integration Examples

### 1. Student Dashboard Component

```javascript
import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useSubjects } from '../hooks/useSubjects';
import { useNotes } from '../hooks/useNotes';
import databaseService from '../services/database.service';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [selectedSubject, setSelectedSubject] = useState('');
  const [aiGeneratedContent, setAiGeneratedContent] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch subjects for the student's school and class
  const { subjects, loading: subjectsLoading } = useSubjects(
    user?.school, 
    user?.class
  );

  // Fetch notes for the selected subject
  const { notes, loading: notesLoading } = useNotes({
    school: user?.school,
    class: user?.class,
    subject: selectedSubject
  });

  // Generate adaptive content using AI
  const generateAdaptiveContent = async (text) => {
    if (!text || !user?.studentType) return;
    
    setLoading(true);
    try {
      const content = await databaseService.generateAdaptiveNotes(
        text, 
        user.studentType
      );
      setAiGeneratedContent(content);
    } catch (error) {
      console.error('Failed to generate adaptive content:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle document upload
  const handleDocumentUpload = async (file) => {
    try {
      const result = await databaseService.extractTextFromDocument(file);
      await generateAdaptiveContent(result.text);
    } catch (error) {
      console.error('Document upload failed:', error);
    }
  };

  return (
    <div className="student-dashboard">
      <h1>Welcome, {user?.name}</h1>
      
      {/* Subject Selection */}
      <div className="subject-selector">
        <label>Select Subject:</label>
        <select 
          value={selectedSubject} 
          onChange={(e) => setSelectedSubject(e.target.value)}
        >
          <option value="">Choose a subject</option>
          {subjects.map(subject => (
            <option key={subject._id} value={subject.subjectName}>
              {subject.subjectName}
            </option>
          ))}
        </select>
      </div>

      {/* Notes Display */}
      <div className="notes-section">
        <h2>Notes</h2>
        {notesLoading ? (
          <div>Loading notes...</div>
        ) : (
          <div className="notes-list">
            {notes.map(note => (
              <div key={note._id} className="note-card">
                <h3>{note.topic}</h3>
                <p>{note.text}</p>
                <button onClick={() => generateAdaptiveContent(note.text)}>
                  Generate Adaptive Version
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* AI Generated Content */}
      {aiGeneratedContent && (
        <div className="ai-content">
          <h2>Adaptive Content</h2>
          <div className="content">
            {aiGeneratedContent.content}
          </div>
          <div className="tips">
            <h3>Study Tips:</h3>
            <p>{aiGeneratedContent.tips}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
```

### 2. Teacher Dashboard Component

```javascript
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNotes } from '../hooks/useNotes';
import databaseService from '../services/database.service';

const TeacherDashboard = () => {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [newNote, setNewNote] = useState({
    topic: '',
    text: '',
    subject: '',
    class: ''
  });

  // Fetch all notes for the teacher's school
  const { notes, addNote, loading } = useNotes({
    school: user?.school
  });

  // Handle note creation
  const handleCreateNote = async (e) => {
    e.preventDefault();
    
    try {
      await addNote({
        ...newNote,
        school: user.school,
        uploadedBy: user._id,
        sourceType: 'manual'
      });
      
      setNewNote({
        topic: '',
        text: '',
        subject: '',
        class: ''
      });
    } catch (error) {
      console.error('Failed to create note:', error);
    }
  };

  // Handle file upload
  const handleFileUpload = async (file) => {
    setUploading(true);
    
    try {
      const result = await databaseService.extractTextFromDocument(file);
      
      // Create note from extracted text
      await addNote({
        topic: file.name,
        text: result.text,
        subject: 'General',
        class: 'All Classes',
        school: user.school,
        uploadedBy: user._id,
        sourceType: 'document',
        originalFilename: file.name
      });
    } catch (error) {
      console.error('File upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="teacher-dashboard">
      <h1>Teacher Dashboard - {user?.name}</h1>
      
      {/* Create New Note */}
      <div className="create-note">
        <h2>Create New Note</h2>
        <form onSubmit={handleCreateNote}>
          <input
            type="text"
            placeholder="Topic"
            value={newNote.topic}
            onChange={(e) => setNewNote({...newNote, topic: e.target.value})}
            required
          />
          <input
            type="text"
            placeholder="Subject"
            value={newNote.subject}
            onChange={(e) => setNewNote({...newNote, subject: e.target.value})}
            required
          />
          <input
            type="text"
            placeholder="Class"
            value={newNote.class}
            onChange={(e) => setNewNote({...newNote, class: e.target.value})}
            required
          />
          <textarea
            placeholder="Note content"
            value={newNote.text}
            onChange={(e) => setNewNote({...newNote, text: e.target.value})}
            required
          />
          <button type="submit">Create Note</button>
        </form>
      </div>

      {/* File Upload */}
      <div className="file-upload">
        <h2>Upload Document</h2>
        <input
          type="file"
          accept=".pdf,.docx,.pptx,.txt"
          onChange={(e) => {
            if (e.target.files[0]) {
              handleFileUpload(e.target.files[0]);
            }
          }}
          disabled={uploading}
        />
        {uploading && <div>Uploading and processing...</div>}
      </div>

      {/* Notes List */}
      <div className="notes-list">
        <h2>All Notes ({notes.length})</h2>
        {loading ? (
          <div>Loading notes...</div>
        ) : (
          <div className="notes-grid">
            {notes.map(note => (
              <div key={note._id} className="note-card">
                <h3>{note.topic}</h3>
                <p><strong>Subject:</strong> {note.subject}</p>
                <p><strong>Class:</strong> {note.class}</p>
                <p>{note.text.substring(0, 200)}...</p>
                <p><strong>Created:</strong> {new Date(note.createdAt).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;
```

## Error Handling

### 1. Error Boundary Component

```javascript
import React from 'react';

class DatabaseErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Database error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Something went wrong with the database connection.</h2>
          <p>Please refresh the page or try again later.</p>
          <button onClick={() => window.location.reload()}>
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default DatabaseErrorBoundary;
```

### 2. Error Toast Component

```javascript
import React, { useState, useEffect } from 'react';

const ErrorToast = ({ error, onClose }) => {
  const [visible, setVisible] = useState(!!error);

  useEffect(() => {
    setVisible(!!error);
    if (error) {
      const timer = setTimeout(() => {
        setVisible(false);
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, onClose]);

  if (!visible) return null;

  return (
    <div className="error-toast">
      <div className="error-content">
        <strong>Database Error:</strong>
        <p>{error}</p>
      </div>
      <button onClick={() => {
        setVisible(false);
        onClose();
      }}>
        ×
      </button>
    </div>
  );
};

export default ErrorToast;
```

## Authentication Integration

### 1. Protected Route Component

```javascript
import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
```

### 2. Login Component

```javascript
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import databaseService from '../services/database.service';

const Login = () => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
    userType: 'student'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await login(credentials, credentials.userType);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-form">
      <h2>Login</h2>
      
      <form onSubmit={handleSubmit}>
        <div>
          <label>User Type:</label>
          <select
            value={credentials.userType}
            onChange={(e) => setCredentials({
              ...credentials,
              userType: e.target.value
            })}
          >
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
          </select>
        </div>

        <div>
          <label>Email:</label>
          <input
            type="email"
            value={credentials.email}
            onChange={(e) => setCredentials({
              ...credentials,
              email: e.target.value
            })}
            required
          />
        </div>

        <div>
          <label>Password:</label>
          <input
            type="password"
            value={credentials.password}
            onChange={(e) => setCredentials({
              ...credentials,
              password: e.target.value
            })}
            required
          />
        </div>

        {error && <div className="error">{error}</div>}

        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
};

export default Login;
```

## Real-time Updates

### 1. WebSocket Integration

```javascript
import { useEffect, useRef } from 'react';

export const useWebSocket = (url, onMessage) => {
  const wsRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const wsUrl = `${url}?token=${token}`;
    
    wsRef.current = new WebSocket(wsUrl);

    wsRef.current.onopen = () => {
      console.log('WebSocket connected');
    };

    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      onMessage(data);
    };

    wsRef.current.onclose = () => {
      console.log('WebSocket disconnected');
    };

    wsRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [url, onMessage]);

  const sendMessage = (message) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  };

  return { sendMessage };
};
```

### 2. Real-time Notes Component

```javascript
import React, { useState, useEffect } from 'react';
import { useNotes } from '../hooks/useNotes';
import { useWebSocket } from '../hooks/useWebSocket';

const RealTimeNotes = () => {
  const [filters, setFilters] = useState({});
  const { notes, addNote, updateNote, deleteNote } = useNotes(filters);

  // WebSocket for real-time updates
  useWebSocket('ws://localhost:5000/ws/notes', (data) => {
    switch (data.type) {
      case 'note_created':
        addNote(data.note);
        break;
      case 'note_updated':
        updateNote(data.note._id, data.note);
        break;
      case 'note_deleted':
        deleteNote(data.noteId);
        break;
      default:
        break;
    }
  });

  return (
    <div className="real-time-notes">
      <h2>Real-time Notes</h2>
      <div className="notes-list">
        {notes.map(note => (
          <div key={note._id} className="note-card">
            <h3>{note.topic}</h3>
            <p>{note.text}</p>
            <small>Updated: {new Date(note.updatedAt).toLocaleString()}</small>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RealTimeNotes;
```

This comprehensive guide provides everything needed to integrate the backend database services with the frontend, including authentication, CRUD operations, real-time updates, and error handling. The code examples are ready to use and follow React best practices.
