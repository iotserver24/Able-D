/**
 * Teacher Service
 * Handles all teacher-related API operations
 */

import { API_BASE_URL, API_ENDPOINTS, handleApiError } from '../config/api.config';

class TeacherService {
  /**
   * Upload a document or audio file for a specific class and subject
   * @param {Object} data - Upload data
   * @param {File} data.file - Document file (PDF, DOCX, PPTX)
   * @param {File} data.audio - Audio file (alternative to document)
   * @param {string} data.school - School name
   * @param {string} data.className - Class level (6-12)
   * @param {string} data.subject - Subject name
   * @param {string} data.topic - Topic/lesson name
   * @param {string} data.language - Language for audio (optional, default: en-US)
   * @returns {Promise<Object>} Upload result
   */
  async uploadContent(data) {
    try {
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        return {
          success: false,
          error: 'Authentication required. Please login first.'
        };
      }

      // Create FormData for multipart upload
      const formData = new FormData();
      
      // Add file or audio
      if (data.file) {
        formData.append('file', data.file);
      } else if (data.audio) {
        formData.append('audio', data.audio);
        if (data.language) {
          formData.append('language', data.language);
        }
      } else {
        return {
          success: false,
          error: 'No file or audio provided'
        };
      }

      // Add required metadata
      formData.append('school', data.school);
      formData.append('class', data.className); // API expects 'class' not 'className'
      formData.append('subject', data.subject);
      formData.append('topic', data.topic);

      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.TEACHER.UPLOAD}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Don't set Content-Type for FormData - browser will set it with boundary
        },
        body: formData
      });

      const result = await response.json();

      if (response.ok) {
        return {
          success: true,
          data: result
        };
      } else {
        return {
          success: false,
          error: result.error || 'Upload failed',
          status: response.status
        };
      }
    } catch (error) {
      console.error('Teacher upload error:', error);
      return handleApiError(error);
    }
  }

  /**
   * Generate audio from uploaded document
   * This combines upload and TTS in one operation
   * @param {Object} data - Same as uploadContent
   * @returns {Promise<Object>} Result with audio URL
   */
  async uploadAndGenerateAudio(data) {
    try {
      // First upload the document
      const uploadResult = await this.uploadContent(data);
      
      if (!uploadResult.success) {
        return uploadResult;
      }

      // If successful, the backend should process and return the note
      // We can then generate audio from the extracted text if needed
      if (uploadResult.data?.note?.text) {
        // Generate audio from the extracted text
        const audioResult = await this.generateAudioFromText(uploadResult.data.note.text);
        
        return {
          success: true,
          data: {
            ...uploadResult.data,
            audioUrl: audioResult.audioUrl
          }
        };
      }

      return uploadResult;
    } catch (error) {
      console.error('Upload and generate audio error:', error);
      return handleApiError(error);
    }
  }

  /**
   * Generate audio from text using TTS
   * @param {string} text - Text to convert to speech
   * @param {string} voice - Voice option (optional)
   * @returns {Promise<Object>} Result with audio URL
   */
  async generateAudioFromText(text, voice = null) {
    try {
      const token = localStorage.getItem('accessToken');
      
      const requestBody = { text };
      if (voice) {
        requestBody.voice = voice;
      }

      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.TTS}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify(requestBody)
      });

      if (response.ok) {
        // TTS returns audio file directly
        const blob = await response.blob();
        const audioUrl = URL.createObjectURL(blob);
        
        return {
          success: true,
          audioUrl
        };
      } else {
        const error = await response.json();
        return {
          success: false,
          error: error.error || 'Audio generation failed'
        };
      }
    } catch (error) {
      console.error('TTS error:', error);
      return handleApiError(error);
    }
  }

  /**
   * Get subjects for a specific class
   * @param {string} className - Class level (6-12)
   * @returns {Promise<Object>} List of subjects
   */
  async getSubjects(className) {
    try {
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        return {
          success: false,
          error: 'Authentication required'
        };
      }

      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.SUBJECTS}?class=${className}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      const result = await response.json();

      if (response.ok) {
        return {
          success: true,
          data: result.items || []
        };
      } else {
        return {
          success: false,
          error: result.error || 'Failed to fetch subjects'
        };
      }
    } catch (error) {
      console.error('Get subjects error:', error);
      return handleApiError(error);
    }
  }
}

// Create singleton instance
const teacherService = new TeacherService();

export default teacherService;
