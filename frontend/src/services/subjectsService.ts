/**
 * Subjects Service
 * 
 * This service handles fetching available subjects from the backend API.
 */

import { authenticatedApiCall } from './api';
import { API_ENDPOINTS } from '@/config/api';

export interface Subject {
  subjectName: string;
}

export interface SubjectsResponse {
  items: Subject[];
}

/**
 * Fetch available subjects for a specific school and class
 * @param school - The school name
 * @param class - The class name/number
 * @param token - Authentication token
 * @returns Promise<SubjectsResponse>
 */
export const fetchSubjects = async (
  school: string,
  classValue: string,
  token: string
): Promise<SubjectsResponse> => {
  const endpoint = `${API_ENDPOINTS.SUBJECTS}?school=${encodeURIComponent(school)}&class=${encodeURIComponent(classValue)}`;
  
  return authenticatedApiCall<SubjectsResponse>(endpoint, token, {
    method: 'GET',
  });
};

/**
 * Get subject names as a simple string array
 * @param school - The school name
 * @param class - The class name/number
 * @param token - Authentication token
 * @returns Promise<string[]>
 */
export const getSubjectNames = async (
  school: string,
  classValue: string,
  token: string
): Promise<string[]> => {
  try {
    const response = await fetchSubjects(school, classValue, token);
    return response.items.map(item => item.subjectName);
  } catch (error) {
    console.error('Error fetching subjects:', error);
    // Return default subjects as fallback
    return ['English', 'Science', 'Mathematics', 'History', 'Geography'];
  }
};
