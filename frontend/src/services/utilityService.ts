/**
 * Utility Service
 * 
 * This service handles utility functions like TTS, STT, and text extraction.
 */

import { apiCall, formDataApiCall } from './api';
import { API_ENDPOINTS, buildApiUrl } from '@/config/api';

export interface TTSResponse {
  // Returns binary MP3 file
}

export interface STTResponse {
  filename: string;
  language: string;
  text: string;
}

export interface ExtractTextResponse {
  filename: string;
  text: string;
}

export interface HealthResponse {
  status: string;
}

/**
 * Convert text to speech
 */
export const textToSpeech = async (
  text: string,
  voice?: string
): Promise<Blob> => {
  const response = await fetch(
    buildApiUrl(API_ENDPOINTS.TTS),
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        voice,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`TTS failed: ${response.statusText}`);
  }

  return response.blob();
};

/**
 * Convert speech to text
 */
export const speechToText = async (
  audioFile: File,
  language: string = 'en-US'
): Promise<STTResponse> => {
  const formData = new FormData();
  formData.append('audio', audioFile);
  formData.append('language', language);

  return formDataApiCall<STTResponse>(
    API_ENDPOINTS.STT,
    formData,
    undefined,
    { method: 'POST' }
  );
};

/**
 * Extract text from document
 */
export const extractTextFromDocument = async (
  file: File
): Promise<ExtractTextResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  return formDataApiCall<ExtractTextResponse>(
    API_ENDPOINTS.EXTRACT_TEXT,
    formData,
    undefined,
    { method: 'POST' }
  );
};

/**
 * Check API health
 */
export const checkHealth = async (): Promise<HealthResponse> => {
  return apiCall<HealthResponse>(API_ENDPOINTS.HEALTH, {
    method: 'GET',
  });
};
