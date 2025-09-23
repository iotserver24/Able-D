// API Configuration for backend integration
export const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000/api';

export const API_ENDPOINTS = {
  // Authentication endpoints
  auth: {
    login: '/auth/login',
    logout: '/auth/logout',
    register: '/auth/register',
    refresh: '/auth/refresh',
    verify: '/auth/verify',
    studentLogin: '/auth/student/login',
  },

  // Student endpoints
  students: {
    profile: '/students/profile',
    updateProfile: '/students/profile/update',
    preferences: '/students/preferences',
    updatePreferences: '/students/preferences/update',
    dashboard: '/students/dashboard',
    progress: '/students/progress',
  },

  // Learning content endpoints
  content: {
    upload: '/content/upload',
    list: '/content/list',
    get: '/content/:id',
    delete: '/content/:id',
    process: '/content/process',
    summarize: '/content/summarize',
  },

  // Notes endpoints
  notes: {
    create: '/notes/create',
    list: '/notes/list',
    get: '/notes/:id',
    update: '/notes/:id',
    delete: '/notes/:id',
    search: '/notes/search',
  },

  // Q&A endpoints
  qa: {
    ask: '/qa/ask',
    history: '/qa/history',
    getAnswer: '/qa/answer/:id',
    rate: '/qa/rate/:id',
    suggestions: '/qa/suggestions',
  },

  // Audio/Voice endpoints
  audio: {
    upload: '/audio/upload',
    transcribe: '/audio/transcribe',
    textToSpeech: '/audio/tts',
    speechToText: '/audio/stt',
    voiceCommand: '/audio/command',
  },

  // Accessibility endpoints
  accessibility: {
    settings: '/accessibility/settings',
    updateSettings: '/accessibility/settings/update',
    getPresets: '/accessibility/presets',
    applyPreset: '/accessibility/preset/:type',
  },

  // Analytics endpoints
  analytics: {
    track: '/analytics/track',
    getStats: '/analytics/stats',
    getLearningPath: '/analytics/learning-path',
    getProgress: '/analytics/progress',
  },

  // Teacher endpoints
  teacher: {
    dashboard: '/teacher/dashboard',
    students: '/teacher/students',
    assignments: '/teacher/assignments',
    createAssignment: '/teacher/assignments/create',
    gradeAssignment: '/teacher/assignments/grade/:id',
  },
};

// API helper functions
export const apiClient = {
  get: async (endpoint, params = {}) => {
    const url = new URL(`${API_BASE_URL}${endpoint}`);
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken') || ''}`,
      },
    });
    
    if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
    return response.json();
  },

  post: async (endpoint, data = {}) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken') || ''}`,
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
    return response.json();
  },

  put: async (endpoint, data = {}) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken') || ''}`,
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
    return response.json();
  },

  delete: async (endpoint) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken') || ''}`,
      },
    });
    
    if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
    return response.json();
  },

  upload: async (endpoint, formData) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken') || ''}`,
      },
      body: formData,
    });
    
    if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
    return response.json();
  },
};
