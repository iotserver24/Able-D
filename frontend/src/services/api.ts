/**
 * API Service
 * 
 * This file contains utility functions for making API calls to the backend.
 * It uses the configuration from @/config/api for consistent API handling.
 */

import { buildApiUrl, API_ENDPOINTS, getAuthHeaders, getFormDataHeaders } from '@/config/api';

// Generic API call function
export const apiCall = async <T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const url = buildApiUrl(endpoint);
  
  const response = await fetch(url, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// Authenticated API call function
export const authenticatedApiCall = async <T = any>(
  endpoint: string,
  token: string,
  options: RequestInit = {}
): Promise<T> => {
  const url = buildApiUrl(endpoint);
  
  const response = await fetch(url, {
    ...options,
    headers: {
      ...getAuthHeaders(token),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// Form data API call function (for file uploads)
export const formDataApiCall = async <T = any>(
  endpoint: string,
  formData: FormData,
  token?: string,
  options: RequestInit = {}
): Promise<T> => {
  const url = buildApiUrl(endpoint);
  
  const response = await fetch(url, {
    method: 'POST',
    ...options,
    headers: {
      ...getFormDataHeaders(token),
      ...options.headers,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// Health check function
export const checkApiHealth = async (): Promise<boolean> => {
  try {
    const response = await fetch(buildApiUrl('/api/health'));
    return response.ok;
  } catch (error) {
    console.error('API health check failed:', error);
    return false;
  }
};

// Verify token function
export const verifyToken = async (token: string): Promise<{ user: string; valid: boolean }> => {
  return authenticatedApiCall(API_ENDPOINTS.AUTH.VERIFY, token);
};
