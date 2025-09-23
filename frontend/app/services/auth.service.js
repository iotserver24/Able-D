/**
 * Authentication Service
 * Handles all authentication API calls for students and teachers
 * Updated to match backend API specification exactly
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
   * Backend returns: { user: {...}, accessToken: "..." }
   */
  setAuthData(data) {
    if (data.accessToken) {
      this.token = data.accessToken;
      if (isBrowser) {
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('user', JSON.stringify(data.user));
        // Store school separately for easy access
        if (data.user && data.user.school) {
          localStorage.setItem('school', data.user.school);
        }
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
      localStorage.removeItem('school');
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
   * Get current school from localStorage
   */
  getCurrentSchool() {
    if (!isBrowser) return null;
    const user = this.getCurrentUser();
    return user?.school || localStorage.getItem('school');
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return !!this.token;
  }

  /**
   * Get user role from stored user data
   */
  getUserRole() {
    const user = this.getCurrentUser();
    return user?.role || null;
  }

  /**
   * Student Registration
   * Backend expects: { name, email, password, school, studentType }
   */
  async registerStudent(data) {
    try {
      console.log('Sending registration data:', data);
      
      const response = await fetch(`${this.baseURL}/student/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await response.json();
      console.log('Registration response:', response.status, result);
      
      if (!response.ok) {
        throw new Error(result.error || 'Registration failed');
      }

      // Backend returns: { user: {...}, accessToken: "..." }
      this.setAuthData(result);
      return { 
        success: true, 
        data: result,
        user: result.user 
      };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Student Login
   * Backend expects: { email, password }
   */
  async loginStudent(email, password) {
    try {
      const response = await fetch(`${this.baseURL}/student/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Login failed');
      }

      // Backend returns: { user: {...}, accessToken: "..." }
      this.setAuthData(result);
      return { 
        success: true, 
        data: result,
        user: result.user
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Teacher Registration
   * Backend expects: { name, email, password, school }
   * Backend returns: { user: {...}, accessToken: "..." }
   */
  async registerTeacher(data) {
    try {
      // Ensure required fields are present
      const requestData = {
        name: data.name,
        email: data.email,
        password: data.password,
        school: data.school || 'DemoSchool'
      };

      const response = await fetch(`${this.baseURL}/teacher/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      });

      const result = await response.json();
      
      if (!response.ok || response.status !== 201) {
        throw new Error(result.error || result.message || 'Registration failed');
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
      console.error('Teacher registration error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Teacher Login
   * Backend expects: { email, password }
   * Backend returns: { user: {...}, accessToken: "..." }
   */
  async loginTeacher(email, password) {
    try {
      const response = await fetch(`${this.baseURL}/teacher/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || result.message || 'Login failed');
      }

      // Backend returns: { user: {...}, accessToken: "..." }
      // JWT identity is the email string; claims include role and school
      this.setAuthData(result);
      return { 
        success: true, 
        data: result,
        user: result.user
      };
    } catch (error) {
      console.error('Teacher login error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Verify Token
   * GET /api/auth/verify
   * Headers: Authorization: Bearer <JWT>
   * Returns basic JWT validity info
   */
  async verifyToken() {
    if (!this.token) {
      return { success: false, error: 'No token found' };
    }

    try {
      const response = await fetch(`${this.baseURL}/verify`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      });

      const result = await response.json();
      
      if (!response.ok || response.status === 401) {
        this.clearAuthData();
        throw new Error('Token verification failed');
      }

      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Firebase Token Verification (optional, not used by upload flow)
   * GET /api/auth/firebase/verify
   */
  async verifyFirebaseToken(idToken) {
    try {
      const response = await fetch(`${this.baseURL}/firebase/verify`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error('Firebase token verification failed');
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
