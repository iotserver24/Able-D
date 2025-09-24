/**
 * Teacher Service
 * 
 * This service handles all teacher-related API calls including content upload.
 */

import { formDataApiCall } from './api';
import { API_ENDPOINTS } from '@/config/api';

export interface UploadResponse {
  note: {
    school: string;
    class: string;
    subject: string;
    topic: string;
    text: string;
    variants: {
      dyslexie?: string;
      audioUrl?: string;
      meta?: {
        dyslexieTips?: string;
      };
      dyslexieError?: string;
      audioUploadError?: string;
      audioSynthesisError?: string;
    };
    _id: string;
    updatedAt: string;
  };
}

/**
 * Upload educational content (document, audio, or text)
 */
export const uploadContent = async (
  school: string,
  classValue: string,
  subject: string,
  topic: string,
  content: {
    type: 'file' | 'audio' | 'text';
    file?: File;
    text?: string;
    language?: string;
  },
  token: string
): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append('school', school);
  formData.append('class', classValue);
  formData.append('subject', subject);
  formData.append('topic', topic);
  
  if (content.type === 'file' && content.file) {
    formData.append('file', content.file);
  } else if (content.type === 'audio' && content.file) {
    formData.append('audio', content.file);
    if (content.language) {
      formData.append('language', content.language);
    }
  } else if (content.type === 'text' && content.text) {
    formData.append('text', content.text);
  }
  
  return formDataApiCall<UploadResponse>(
    API_ENDPOINTS.TEACHER.UPLOAD,
    formData,
    token,
    { method: 'POST' }
  );
};
