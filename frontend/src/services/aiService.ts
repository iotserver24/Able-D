/**
 * AI Service
 * 
 * This service handles AI-powered content generation and processing.
 */

import { apiCall } from './api';
import { API_ENDPOINTS } from '@/config/api';

export interface AIHealthResponse {
  status: 'healthy' | 'unhealthy';
  available_keys: number;
  endpoint: string;
  supported_modes: string[];
  supported_student_types: string[];
}

export interface AIStatsResponse {
  total_requests: number;
  cache_hits: number;
  error_rate: number;
}

export interface AINotesResponse {
  content: string;
  tips?: string;
  _metadata?: {
    request_id: string;
    total_time: number;
  };
}

export interface AIQnAResponse {
  answer: string;
  tips?: string;
  _metadata?: {
    request_id: string;
    total_time: number;
  };
}

/**
 * Generate adaptive notes
 */
export const generateAdaptiveNotes = async (
  text: string,
  studentType: string
): Promise<AINotesResponse> => {
  return apiCall<AINotesResponse>(API_ENDPOINTS.AI.PROCESS, {
    method: 'POST',
    body: JSON.stringify({
      mode: 'notes',
      studentType,
      text,
    }),
  });
};

/**
 * Generate adaptive Q&A
 */
export const generateAdaptiveQnA = async (
  notes: string,
  question: string,
  studentType: string
): Promise<AIQnAResponse> => {
  return apiCall<AIQnAResponse>(API_ENDPOINTS.AI.PROCESS, {
    method: 'POST',
    body: JSON.stringify({
      mode: 'qna',
      studentType,
      notes,
      question,
    }),
  });
};

/**
 * Check AI service health
 */
export const checkAIHealth = async (): Promise<AIHealthResponse> => {
  return apiCall<AIHealthResponse>(API_ENDPOINTS.AI.HEALTH, {
    method: 'GET',
  });
};

/**
 * Get AI service statistics
 */
export const getAIStats = async (): Promise<AIStatsResponse> => {
  return apiCall<AIStatsResponse>(API_ENDPOINTS.AI.STATS, {
    method: 'GET',
  });
};
