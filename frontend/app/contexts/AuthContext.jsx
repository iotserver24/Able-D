import { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/auth.service';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check for existing session on mount (only in browser)
  useEffect(() => {
    if (isBrowser) {
      checkAuthStatus();
    } else {
      setIsLoading(false);
    }
  }, []);

  const checkAuthStatus = async () => {
    if (!isBrowser) {
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    try {
      const currentUser = authService.getCurrentUser();
      const token = localStorage.getItem('accessToken');
      
      if (currentUser && token) {
        // For mock authentication, just check if token exists
        // In production, uncomment the verification below
        if (token.startsWith('mock-token-')) {
          // Mock token, accept it
          setUser(currentUser);
          setIsAuthenticated(true);
        } else {
          // Real token, verify with backend
          const result = await authService.verifyToken();
          
          if (result.success) {
            setUser(currentUser);
            setIsAuthenticated(true);
          } else {
            // Token invalid, clear auth data
            authService.clearAuthData();
            setUser(null);
            setIsAuthenticated(false);
          }
        }
      }
    } catch (err) {
      console.error('Auth check failed:', err);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Student Registration
  const registerStudent = async (data) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await authService.registerStudent(data);
      
      if (result.success) {
        setUser(result.data.user);
        setIsAuthenticated(true);
        return { success: true };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMsg = err.message || 'Registration failed';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  };

  // Student Login
  const loginStudent = async (email, password) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await authService.loginStudent(email, password);
      
      if (result.success) {
        setUser(result.data.user);
        setIsAuthenticated(true);
        return { success: true };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMsg = err.message || 'Login failed';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  };

  // Teacher Registration
  const registerTeacher = async (data) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await authService.registerTeacher(data);
      
      if (result.success) {
        setUser(result.data.user);
        setIsAuthenticated(true);
        return { success: true };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMsg = err.message || 'Registration failed';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  };

  // Teacher Login
  const loginTeacher = async (email, password) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await authService.loginTeacher(email, password);
      
      if (result.success) {
        setUser(result.data.user);
        setIsAuthenticated(true);
        return { success: true };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMsg = err.message || 'Login failed';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  };

  // Logout
  const logout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    error,
    registerStudent,
    loginStudent,
    registerTeacher,
    loginTeacher,
    logout,
    clearError,
    checkAuthStatus,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
