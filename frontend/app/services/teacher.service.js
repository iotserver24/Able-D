/**
 * Teacher Service
 * Handles teacher-specific API calls including file uploads and subject management
 * Updated to match backend API specification exactly
 */

import { API_BASE_URL } from '../config/api.config';
import authService from './auth.service';

class TeacherService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  /**
   * Get authorization headers with JWT token
   */
  getAuthHeaders() {
    const token = authService.token || localStorage.getItem('accessToken');
    return {
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  /**
   * Upload file (document or audio) for a specific class/subject/topic
   * 
   * POST /api/teacher/upload
   * Headers: Authorization: Bearer <JWT with role=teacher>
   * Content-Type: multipart/form-data
   * 
   * Fields:
   * - school (required if not in token)
   * - class or className (required)
   * - subject (required)
   * - topic or name (required)
   * - file (document: pdf/docx/pptx) OR audio (wav/mp3/m4a)
   * - language (optional, default en-US for audio)
   * 
   * @param {File} file - The file to upload
   * @param {string} school - School name
   * @param {string} className - Class level (6-12)
   * @param {string} subject - Subject name
   * @param {string} topic - Topic/name of the content
   * @param {string} language - Language code (optional, for audio)
   * @returns {Promise} Upload result with note data
   */
  async uploadFile(file, school, className, subject, topic, language = 'en-US') {
    try {
      const formData = new FormData();
      
      // Add required fields
      formData.append('school', school || 'DemoSchool');
      formData.append('class', className); // Backend accepts both 'class' and 'className'
      formData.append('subject', subject);
      formData.append('topic', topic); // Backend accepts both 'topic' and 'name'
      
      // Determine if it's audio or document based on file extension
      const fileExtension = file.name.split('.').pop().toLowerCase();
      const audioExtensions = ['wav', 'mp3', 'm4a', 'ogg', 'flac', 'aac', 'wma', 'opus'];
      const isAudio = audioExtensions.includes(fileExtension);
      
      if (isAudio) {
        formData.append('audio', file);
        formData.append('language', language);
      } else {
        formData.append('file', file);
      }

      const response = await fetch(`${this.baseURL}/api/teacher/upload`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: formData
      });

      const result = await response.json();

      if (!response.ok) {
        // Handle specific error codes
        if (response.status === 403) {
          throw new Error('Forbidden: You must be a teacher to upload files');
        } else if (response.status === 400) {
          throw new Error(result.error || 'Invalid request data');
        } else if (response.status === 500) {
          throw new Error(result.error || 'Server error during upload');
        }
        throw new Error(result.error || 'Upload failed');
      }

      // Backend returns 201 with note data
      // Response includes:
      // - note._id
      // - note.school, class, subject, topic
      // - note.text (base text)
      // - note.sourceType (document|audio)
      // - note.originalFilename
      // - note.uploadedBy (teacher email)
      // - note.variants.dyslexie (adapted text)
      // - note.variants.audioUrl (TTS audio URL from Catbox)
      // - note.variants.meta.dyslexieTips (optional tips)
      // - note.createdAt, updatedAt
      
      return { 
        success: true, 
        data: result.note,
        message: 'File uploaded successfully'
      };
    } catch (error) {
      console.error('Upload error:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to upload file'
      };
    }
  }

  /**
   * Get subjects for a specific school and class
   * 
   * GET /api/subjects?school=...&class=...
   * 
   * @param {string} school - School name
   * @param {string} className - Class level
   * @returns {Promise} List of subjects
   */
  async getSubjects(school, className) {
    try {
      const params = new URLSearchParams({
        school: school || 'DemoSchool',
        class: className
      });

      const response = await fetch(`${this.baseURL}/api/subjects?${params}`, {
        method: 'GET',
        headers: {
          ...this.getAuthHeaders(),
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch subjects');
      }

      // Backend returns: { items: [{subjectName: "..."}, ...] }
      // Transform to format expected by frontend
      const subjects = result.items?.map(item => ({
        value: item.subjectName.toLowerCase(),
        label: item.subjectName.charAt(0).toUpperCase() + item.subjectName.slice(1)
      })) || [];

      return { 
        success: true, 
        data: subjects 
      };
    } catch (error) {
      console.error('Error fetching subjects:', error);
      return { 
        success: false, 
        error: error.message,
        data: [] // Return empty array on error
      };
    }
  }

  /**
   * Get notes for a specific school/class/subject/topic
   * Used by students to fetch content
   * 
   * @param {Object} filters - Filter criteria
   * @returns {Promise} List of notes
   */
  async getNotes(filters) {
    try {
      const params = new URLSearchParams(filters);
      
      const response = await fetch(`${this.baseURL}/api/notes?${params}`, {
        method: 'GET',
        headers: {
          ...this.getAuthHeaders(),
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch notes');
      }

      return { 
        success: true, 
        data: result.notes || []
      };
    } catch (error) {
      console.error('Error fetching notes:', error);
      return { 
        success: false, 
        error: error.message,
        data: []
      };
    }
  }

  /**
   * Get teacher's uploaded content
   * 
   * @returns {Promise} List of teacher's uploads
   */
  async getMyUploads() {
    try {
      const response = await fetch(`${this.baseURL}/api/teacher/uploads`, {
        method: 'GET',
        headers: {
          ...this.getAuthHeaders(),
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch uploads');
      }

      return { 
        success: true, 
        data: result.uploads || []
      };
    } catch (error) {
      console.error('Error fetching uploads:', error);
      return { 
        success: false, 
        error: error.message,
        data: []
      };
    }
  }
}

export const teacherService = new TeacherService();
export default teacherService;
