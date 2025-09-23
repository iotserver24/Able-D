/**
 * API Configuration
 * Central configuration for all API endpoints
 */

// Base URL for the backend API
// In production, this should be your backend server URL
// Vite uses import.meta.env instead of process.env
// Using a simpler approach that works with Vite
export const API_BASE_URL = 'http://localhost:5000';

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    STUDENT_REGISTER: '/api/auth/student/register',
    STUDENT_LOGIN: '/api/auth/student/login',
    TEACHER_REGISTER: '/api/auth/teacher/register',
    TEACHER_LOGIN: '/api/auth/teacher/login',
    VERIFY: '/api/auth/verify',
  },
  
  // Health check
  HEALTH: '/api/health',
  
  // Document processing
  EXTRACT_TEXT: '/api/extract-text',
  
  // Speech services
  STT: '/api/stt',
  TTS: '/api/tts',
  
  // Subjects
  SUBJECTS: '/api/subjects',
};

// Request timeout (in milliseconds)
export const REQUEST_TIMEOUT = 30000;

// File upload limits
export const FILE_UPLOAD_LIMITS = {
  MAX_SIZE: 16 * 1024 * 1024, // 16MB
  ALLOWED_TYPES: {
    DOCUMENTS: ['.pdf', '.docx', '.pptx', '.txt'],
    AUDIO: ['.wav', '.mp3', '.m4a', '.ogg', '.flac', '.aac', '.wma', '.opus'],
  }
};

// Default headers for API requests
export const DEFAULT_HEADERS = {
  'Accept': 'application/json',
};

/**
 * Helper function to build full API URL
 */
export const buildApiUrl = (endpoint) => {
  return `${API_BASE_URL}${endpoint}`;
};

/**
 * Helper function to handle API errors
 */
export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error
    return {
      success: false,
      error: error.response.data?.error || 'Server error occurred',
      status: error.response.status
    };
  } else if (error.request) {
    // Request made but no response
    return {
      success: false,
      error: 'No response from server. Please check your connection.',
      status: 0
    };
  } else {
    // Request setup error
    return {
      success: false,
      error: error.message || 'An unexpected error occurred',
      status: 0
    };
  }
};

export default {
  API_BASE_URL,
  API_ENDPOINTS,
  REQUEST_TIMEOUT,
  FILE_UPLOAD_LIMITS,
  DEFAULT_HEADERS,
  buildApiUrl,
  handleApiError
};
