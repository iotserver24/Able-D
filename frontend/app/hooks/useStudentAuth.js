// app/auth/students/hooks/useStudentAuth.js
import { useState, useCallback } from "react";
import { useMockAuth } from "../constants/MockAuthContext";

export const useStudentAuth = () => {
  const { user, isAuthenticated, login, logout } = useMockAuth();
  const [studentType, setStudentType] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = useCallback(async () => {
    if (!studentType) {
      setError("Please select your student type");
      return;
    }

    try {
      setError(null);
      setIsLoading(true);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock login
      login(studentType);
      
    } catch (error) {
      console.error("Login failed:", error);
      setError("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [studentType, login]);

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