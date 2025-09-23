// app/auth/students/hooks/useStudentAuth.js
import { useState, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";

export const useStudentAuth = () => {
  const { user, isAuthenticated, loginStudent, logout } = useAuth();
  const [studentType, setStudentType] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = useCallback(async () => {
    if (!studentType) {
      setError("Please select your student type");
      return false;
    }

    try {
      setError(null);
      setIsLoading(true);
      
      // For now, we'll use mock authentication
      // In production, this would call the real login API
      // Mock login with student type
      const mockUser = {
        id: 'student-' + Date.now(),
        name: 'Test Student',
        email: 'student@test.com',
        role: 'student',
        studentType: studentType
      };
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For now, directly set the user (in production, use loginStudent)
      // This is a temporary solution until the full auth flow is implemented
      localStorage.setItem('user', JSON.stringify(mockUser));
      localStorage.setItem('accessToken', 'mock-token-' + Date.now());
      
      // Reload to trigger auth check
      window.location.reload();
      
      return true;
    } catch (error) {
      console.error("Login failed:", error);
      setError("Login failed. Please try again.");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [studentType]);

  return {
    studentType,
    setStudentType,
    handleLogin,
    handleLogout: logout,
    isAuthenticated,
    isLoading,
    error,
    setError,
    user
  };
};
