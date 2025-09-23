/**
 * AI Service
 * Handles AI-related API calls for notes generation and Q&A
 * Updated to match backend API specification exactly
 */

import { API_BASE_URL } from '../config/api.config';
import authService from './auth.service';

class AIService {
  constructor() {
    this.baseURL = `${API_BASE_URL}/api/ai`;
  }

  /**
   * Get authorization headers (optional for AI endpoints)
   */
  getAuthHeaders() {
    const token = authService.token || localStorage.getItem('accessToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  /**
   * Generate adapted notes for a specific student type
   * 
   * POST /api/ai
   * Mode: notes
   * 
   * @param {string} text - The text to adapt
   * @param {string} studentType - Student type (dyslexie, vision, hearing, etc.)
   * @returns {Promise} Adapted content with metadata
   */
  async generateNotes(text, studentType = 'dyslexie') {
    try {
      const requestData = {
        mode: 'notes',
        studentType: studentType,
        text: text
      };

      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(requestData)
      });

      const result = await response.json();

      if (!response.ok) {
        // Handle specific error codes
        if (response.status === 503) {
          throw new Error(result.error || 'AI service unavailable. Please configure Gemini API keys.');
        }
        throw new Error(result.error || 'Failed to generate notes');
      }

      // Backend returns:
      // {
      //   "content": "adapted content or JSON string",
      //   "studentType": "dyslexie",
      //   "tips": "study tips JSON string",
      //   "_metadata": {
      //     "generated_at": "ISO timestamp",
      //     "model": "gemini-2.0-flash",
      //     "processing_time": 3.86
      //   }
      // }

      // Parse content and tips if they're JSON strings
      let parsedContent = result.content;
      let parsedTips = result.tips;

      try {
        if (typeof result.content === 'string' && result.content.startsWith('{')) {
          parsedContent = JSON.parse(result.content);
        }
      } catch (e) {
        // Keep as string if not valid JSON
      }

      try {
        if (typeof result.tips === 'string' && result.tips.startsWith('{')) {
          parsedTips = JSON.parse(result.tips);
        }
      } catch (e) {
        // Keep as string if not valid JSON
      }

      return { 
        success: true, 
        data: {
          content: parsedContent,
          tips: parsedTips,
          studentType: result.studentType,
          metadata: result._metadata
        }
      };
    } catch (error) {
      console.error('Notes generation error:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to generate adapted notes'
      };
    }
  }

  /**
   * Ask a question based on notes context
   * 
   * POST /api/ai
   * Mode: qna
   * 
   * @param {string} notes - The notes/context
   * @param {string} question - The question to ask
   * @param {string} studentType - Student type (vision, hearing, dyslexie, etc.)
   * @returns {Promise} Answer with steps and tips
   */
  async askQuestion(notes, question, studentType = 'vision') {
    try {
      const requestData = {
        mode: 'qna',
        studentType: studentType,
        notes: notes,
        question: question
      };

      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(requestData)
      });

      const result = await response.json();

      if (!response.ok) {
        // Handle specific error codes
        if (response.status === 503) {
          throw new Error(result.error || 'AI service unavailable. Please configure Gemini API keys.');
        }
        throw new Error(result.error || 'Failed to process question');
      }

      // Backend returns:
      // {
      //   "answer": "simplified answer",
      //   "steps": "step-by-step explanation",
      //   "studentType": "vision",
      //   "tips": "helpful tips",
      //   "_metadata": {
      //     "generated_at": "ISO timestamp",
      //     "model": "gemini-2.0-flash",
      //     "processing_time": 2.94
      //   }
      // }

      return { 
        success: true, 
        data: {
          answer: result.answer,
          steps: result.steps,
          tips: result.tips,
          studentType: result.studentType,
          metadata: result._metadata
        }
      };
    } catch (error) {
      console.error('Q&A error:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to process question'
      };
    }
  }

  /**
   * Process content for multiple student types at once
   * Useful for generating all variants during upload
   * 
   * @param {string} text - The text to process
   * @param {Array} studentTypes - Array of student types
   * @returns {Promise} Object with adapted content for each type
   */
  async processForAllTypes(text, studentTypes = ['dyslexie', 'vision', 'hearing']) {
    try {
      const results = {};
      const errors = {};

      // Process for each student type in parallel
      const promises = studentTypes.map(async (type) => {
        try {
          const result = await this.generateNotes(text, type);
          if (result.success) {
            results[type] = result.data;
          } else {
            errors[type] = result.error;
          }
        } catch (error) {
          errors[type] = error.message;
        }
      });

      await Promise.all(promises);

      return {
        success: Object.keys(results).length > 0,
        data: results,
        errors: Object.keys(errors).length > 0 ? errors : null
      };
    } catch (error) {
      console.error('Batch processing error:', error);
      return {
        success: false,
        error: error.message || 'Failed to process content for all types'
      };
    }
  }

  /**
   * Get study tips for a specific student type
   * 
   * @param {string} studentType - Student type
   * @param {string} subject - Optional subject for context-specific tips
   * @returns {Promise} Study tips
   */
  async getStudyTips(studentType, subject = null) {
    try {
      const context = subject 
        ? `Give study tips for ${subject} subject`
        : 'Give general study tips';
      
      const result = await this.generateNotes(context, studentType);
      
      if (result.success && result.data.tips) {
        return {
          success: true,
          data: result.data.tips
        };
      }

      return {
        success: false,
        error: 'No tips available'
      };
    } catch (error) {
      console.error('Study tips error:', error);
      return {
        success: false,
        error: error.message || 'Failed to get study tips'
      };
    }
  }
}

export const aiService = new AIService();
export default aiService;
