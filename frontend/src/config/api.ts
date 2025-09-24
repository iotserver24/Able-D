/**
 * API Configuration
 * 
 * This file handles the backend API configuration using environment variables.
 * The VITE_ prefix is required for Vite to expose environment variables to the client.
 */

// Get the API base URL from environment variables
// Fallback to hosted backend if not set
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://able-d.onrender.com';

// API endpoints configuration
export const API_ENDPOINTS = {
  // Authentication endpoints
  AUTH: {
    TEACHER_LOGIN: '/auth/teacher/login',
    TEACHER_REGISTER: '/auth/teacher/register',
    STUDENT_LOGIN: '/auth/student/login',
    STUDENT_REGISTER: '/auth/student/register',
    VERIFY: '/auth/verify',
  },
  
  // Teacher endpoints
  TEACHER: {
    UPLOAD: '/teacher/upload',
  },
  
  // Student endpoints
  STUDENTS: {
    TOPICS: '/students/topics',
    NOTES: '/students/notes',
    QNA: '/students/qna',
    QNA_AUDIO: '/students/qna-audio',
  },
  
  // AI endpoints
  AI: {
    PROCESS: '/ai',
    HEALTH: '/ai/health',
    STATS: '/ai/stats',
  },
  
  // Subject endpoints
  SUBJECTS: '/subjects',
  
  // Utility endpoints
  TTS: '/tts',
  STT: '/stt',
  EXTRACT_TEXT: '/extract-text',
  HEALTH: '/health',
} as const;

// Helper function to build full API URLs
export const buildApiUrl = (endpoint: string): string => {
  return `${API_BASE_URL}/api${endpoint}`;
};

// Helper function to get auth headers
export const getAuthHeaders = (token?: string) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  
  return headers;
};

// Helper function to get form data headers (without Content-Type for multipart)
export const getFormDataHeaders = (token?: string) => {
  const headers: Record<string, string> = {};
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  
  return headers;
};
