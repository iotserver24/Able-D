/**
 * Authentication Service
 * Handles all authentication API calls for students and teachers
 */

import { API_BASE_URL } from '../config/api.config';

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

class AuthService {
  constructor() {
    this.baseURL = `${API_BASE_URL}/api/auth`;
    this.token = isBrowser ? localStorage.getItem('accessToken') : null;
  }

  /**
   * Set authorization header with JWT token
   */
  getAuthHeaders() {
    return {
      'Content-Type': 'application/json',
      ...(this.token && { 'Authorization': `Bearer ${this.token}` })
    };
  }

  /**
   * Store authentication data
   */
  setAuthData(data) {
    if (data.accessToken) {
      this.token = data.accessToken;
      if (isBrowser) {
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('user', JSON.stringify(data.user));
      }
    }
  }

  /**
   * Clear authentication data
   */
  clearAuthData() {
    this.token = null;
    if (isBrowser) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
    }
  }

  /**
   * Get current user from localStorage
   */
  getCurrentUser() {
    if (!isBrowser) return null;
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return !!this.token;
  }

  /**
   * Student Registration
   */
  async registerStudent(data) {
    try {
      const response = await fetch(`${this.baseURL}/student/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Registration failed');
      }

      this.setAuthData(result);
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Student Login
   */
  async loginStudent(credentials) {
    try {
      const response = await fetch(`${this.baseURL}/student/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Login failed');
      }

      this.setAuthData(result);
      return { 
        success: true, 
        data: {
          token: result.accessToken,
          user: {
            ...result.user,
            role: 'student'
          }
        }
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Teacher Registration
   */
  async registerTeacher(data) {
    try {
      const response = await fetch(`${this.baseURL}/teacher/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Registration failed');
      }

      // Set auth data with the result
      if (result.accessToken) {
        this.setAuthData(result);
      }
      
      // Return success with user data
      return { 
        success: true, 
        data: {
          user: {
            ...result.user,
            role: 'teacher'
          },
          token: result.accessToken
        }
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Teacher Login
   */
  async loginTeacher(credentials) {
    try {
      const response = await fetch(`${this.baseURL}/teacher/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Login failed');
      }

      this.setAuthData(result);
      return { 
        success: true, 
        data: {
          token: result.accessToken,
          user: {
            ...result.user,
            role: 'teacher'
          }
        }
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Verify Token
   */
  async verifyToken() {
    if (!this.token) {
      return { success: false, error: 'No token found' };
    }

    try {
      const response = await fetch(`${this.baseURL}/verify`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      const result = await response.json();
      
      if (!response.ok) {
        this.clearAuthData();
        throw new Error('Token verification failed');
      }

      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Logout
   */
  logout() {
    this.clearAuthData();
    if (isBrowser) {
      window.location.href = '/';
    }
  }
}

export const authService = new AuthService();
export default authService;
