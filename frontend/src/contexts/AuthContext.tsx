import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { buildApiUrl, API_ENDPOINTS, getAuthHeaders } from '@/config/api';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'teacher';
  school?: string;
  studentType?: string;
  class?: string;
  subject?: string;
  token?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, role: 'student' | 'teacher') => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: 'student' | 'teacher';
  studentType?: string;
  class?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const isAuthenticated = !!user;

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string, role: 'student' | 'teacher') => {
    try {
      setIsLoading(true);
      
      const endpoint = role === 'student' 
        ? buildApiUrl(API_ENDPOINTS.AUTH.STUDENT_LOGIN)
        : buildApiUrl(API_ENDPOINTS.AUTH.TEACHER_LOGIN);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const data = await response.json();
      
      const userData: User = {
        ...data.user,
        role,
        token: data.accessToken,
      };

      setUser(userData);
      localStorage.setItem('token', data.accessToken);
      localStorage.setItem('user', JSON.stringify(userData));

      toast({
        title: "Login Successful",
        description: `Welcome back, ${userData.name}!`,
      });

      // Navigate to appropriate dashboard
      navigate(role === 'student' ? '/student-dashboard' : '/teacher-dashboard');
      
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Login Failed",
        description: error instanceof Error ? error.message : 'An error occurred during login',
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      setIsLoading(true);
      
      const endpoint = userData.role === 'student' 
        ? buildApiUrl(API_ENDPOINTS.AUTH.STUDENT_REGISTER)
        : buildApiUrl(API_ENDPOINTS.AUTH.TEACHER_REGISTER);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }

      const data = await response.json();
      
      const user: User = {
        ...data.user,
        role: userData.role,
        token: data.accessToken,
      };

      setUser(user);
      localStorage.setItem('token', data.accessToken);
      localStorage.setItem('user', JSON.stringify(user));

      toast({
        title: "Registration Successful",
        description: `Welcome to Able-D, ${user.name}!`,
      });

      // Navigate to appropriate dashboard
      navigate(userData.role === 'student' ? '/student-dashboard' : '/teacher-dashboard');
      
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: "Registration Failed",
        description: error instanceof Error ? error.message : 'An error occurred during registration',
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    
    navigate('/');
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoading,
      login,
      register,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};