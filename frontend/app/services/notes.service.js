/**
 * Notes Service
 * Handles fetching and managing educational notes/content for students
 */

import { API_BASE_URL, handleApiError } from '../config/api.config';

class NotesService {
  /**
   * Get notes for a specific class and subject
   * @param {Object} params - Query parameters
   * @param {string} params.school - School name
   * @param {string} params.className - Class level (6-12)
   * @param {string} params.subject - Subject name
   * @returns {Promise<Object>} List of notes
   */
  async getNotes({ school, className, subject }) {
    try {
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        return {
          success: false,
          error: 'Authentication required'
        };
      }

      // Build query string
      const queryParams = new URLSearchParams();
      if (school) queryParams.append('school', school);
      if (className) queryParams.append('class', className);
      if (subject) queryParams.append('subject', subject);

      const response = await fetch(`${API_BASE_URL}/api/notes?${queryParams.toString()}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          data: data.notes || []
        };
      } else {
        const error = await response.json();
        return {
          success: false,
          error: error.error || 'Failed to fetch notes'
        };
      }
    } catch (error) {
      console.error('Get notes error:', error);
      return handleApiError(error);
    }
  }

  /**
   * Get a specific note by ID
   * @param {string} noteId - Note ID
   * @returns {Promise<Object>} Note details
   */
  async getNoteById(noteId) {
    try {
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        return {
          success: false,
          error: 'Authentication required'
        };
      }

      const response = await fetch(`${API_BASE_URL}/api/notes/${noteId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          data: data.note
        };
      } else {
        const error = await response.json();
        return {
          success: false,
          error: error.error || 'Failed to fetch note'
        };
      }
    } catch (error) {
      console.error('Get note error:', error);
      return handleApiError(error);
    }
  }

  /**
   * Search notes by keyword
   * @param {string} query - Search query
   * @param {Object} filters - Additional filters
   * @returns {Promise<Object>} Search results
   */
  async searchNotes(query, filters = {}) {
    try {
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        return {
          success: false,
          error: 'Authentication required'
        };
      }

      const queryParams = new URLSearchParams();
      queryParams.append('q', query);
      
      // Add filters
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          queryParams.append(key, filters[key]);
        }
      });

      const response = await fetch(`${API_BASE_URL}/api/notes/search?${queryParams.toString()}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          data: data.results || []
        };
      } else {
        const error = await response.json();
        return {
          success: false,
          error: error.error || 'Search failed'
        };
      }
    } catch (error) {
      console.error('Search notes error:', error);
      return handleApiError(error);
    }
  }

  /**
   * Get available subjects for a class
   * @param {string} className - Class level
   * @returns {Promise<Object>} List of subjects
   */
  async getSubjectsForClass(className) {
    try {
      const token = localStorage.getItem('accessToken');
      
      const response = await fetch(`${API_BASE_URL}/api/subjects?class=${className}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });

      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          data: data.items || []
        };
      } else {
        const error = await response.json();
        return {
          success: false,
          error: error.error || 'Failed to fetch subjects'
        };
      }
    } catch (error) {
      console.error('Get subjects error:', error);
      return handleApiError(error);
    }
  }

  /**
   * Submit a question about a note/topic
   * @param {Object} data - Question data
   * @param {string} data.noteId - Related note ID (optional)
   * @param {string} data.question - The question text
   * @param {string} data.context - Additional context
   * @returns {Promise<Object>} AI response
   */
  async askQuestion(data) {
    try {
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        return {
          success: false,
          error: 'Authentication required'
        };
      }

      const response = await fetch(`${API_BASE_URL}/api/ai`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          prompt: data.question,
          context: data.context || '',
          noteId: data.noteId || null
        })
      });

      if (response.ok) {
        const result = await response.json();
        return {
          success: true,
          data: {
            answer: result.response || result.answer,
            sources: result.sources || []
          }
        };
      } else {
        const error = await response.json();
        return {
          success: false,
          error: error.error || 'Failed to get answer'
        };
      }
    } catch (error) {
      console.error('Ask question error:', error);
      return handleApiError(error);
    }
  }

  /**
   * Generate audio for text content
   * @param {string} text - Text to convert to speech
   * @param {string} voice - Voice option (optional)
   * @returns {Promise<Object>} Audio URL
   */
  async generateAudio(text, voice = null) {
    try {
      const token = localStorage.getItem('accessToken');
      
      const requestBody = { text };
      if (voice) {
        requestBody.voice = voice;
      }

      const response = await fetch(`${API_BASE_URL}/api/tts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify(requestBody)
      });

      if (response.ok) {
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
      console.error('Generate audio error:', error);
      return handleApiError(error);
    }
  }
}

// Create singleton instance
const notesService = new NotesService();

export default notesService;
