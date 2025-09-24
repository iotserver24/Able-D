/**
 * Student Service
 * 
 * This service handles all student-related API calls including topics, notes, and Q&A.
 */

import { authenticatedApiCall, formDataApiCall } from './api';
import { API_ENDPOINTS } from '@/config/api';

export interface Topic {
  topic: string;
  school: string;
  class: string;
  subject: string;
}

export interface TopicsResponse {
  items: Topic[];
}

export interface Note {
  school: string;
  class: string;
  subject: string;
  topic: string;
  studentType?: string;
  content: string;
  audioUrl?: string;
  tips?: string;
  _id: string;
  updatedAt: string;
}

export interface NoteResponse {
  note: Note;
}

export interface QnAResponse {
  answer: string;
  tips?: string;
  audioUrl?: string;
  question?: string;
  _metadata?: {
    request_id: string;
    total_time: number;
  };
}

/**
 * Get topics for a specific subject
 */
export const getTopics = async (
  school: string,
  classValue: string,
  subject: string,
  token: string
): Promise<TopicsResponse> => {
  const endpoint = `${API_ENDPOINTS.STUDENTS.TOPICS}?school=${encodeURIComponent(school)}&class=${encodeURIComponent(classValue)}&subject=${encodeURIComponent(subject)}`;
  
  console.log('getTopics called with:', {
    school,
    classValue,
    subject,
    endpoint,
    tokenLength: token?.length,
    tokenStart: token?.substring(0, 20) + '...'
  });
  
  return authenticatedApiCall<TopicsResponse>(endpoint, token, {
    method: 'GET',
  });
};

/**
 * Get tailored notes for a specific topic
 */
export const getNotes = async (
  school: string,
  classValue: string,
  subject: string,
  topic: string,
  studentType: string,
  token: string
): Promise<NoteResponse> => {
  const endpoint = `${API_ENDPOINTS.STUDENTS.NOTES}?school=${encodeURIComponent(school)}&class=${encodeURIComponent(classValue)}&subject=${encodeURIComponent(subject)}&topic=${encodeURIComponent(topic)}&studentType=${encodeURIComponent(studentType)}`;
  
  return authenticatedApiCall<NoteResponse>(endpoint, token, {
    method: 'GET',
  });
};

/**
 * Generate Q&A response (text input)
 */
export const generateQnA = async (
  school: string,
  classValue: string,
  subject: string,
  topic: string,
  studentType: string,
  question: string,
  token: string
): Promise<QnAResponse> => {
  const endpoint = API_ENDPOINTS.STUDENTS.QNA;
  
  return authenticatedApiCall<QnAResponse>(endpoint, token, {
    method: 'POST',
    body: JSON.stringify({
      school,
      class: classValue,
      subject,
      topic,
      studentType,
      question,
    }),
  });
};

/**
 * Generate Q&A response (audio input)
 */
export const generateQnAAudio = async (
  school: string,
  classValue: string,
  subject: string,
  topic: string,
  studentType: string,
  audioFile: File,
  language: string = 'en-US',
  token: string
): Promise<QnAResponse> => {
  const formData = new FormData();
  formData.append('school', school);
  formData.append('class', classValue);
  formData.append('subject', subject);
  formData.append('topic', topic);
  formData.append('studentType', studentType);
  formData.append('language', language);
  formData.append('audio', audioFile);
  
  return formDataApiCall<QnAResponse>(
    API_ENDPOINTS.STUDENTS.QNA_AUDIO,
    formData,
    token,
    { method: 'POST' }
  );
};
