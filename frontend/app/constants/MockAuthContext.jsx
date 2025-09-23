import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const MockAuthContext = createContext();

export const useMockAuth = () => {
  const context = useContext(MockAuthContext);
  if (!context) {
    throw new Error('useMockAuth must be used within MockAuthProvider');
  }
  return context;
};

export const MockAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = useCallback((studentType) => {
    // Mock user data
    const mockUser = {
      id: 'mock-user-123',
      name: 'Test Student',
      email: 'student@test.com',
      studentType: studentType,
      accessToken: 'mock-token-' + Date.now()
    };
    
    setUser(mockUser);
    setIsAuthenticated(true);
    
    // Store in localStorage for persistence (only on client side)
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('mockUser', JSON.stringify(mockUser));
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setIsAuthenticated(false);
    
    // Remove from localStorage (only on client side)
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem('mockUser');
    }
  }, []);

  // Check for existing session on mount (client side only)
  useEffect(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const storedUser = localStorage.getItem('mockUser');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Error parsing stored user:', error);
        }
      }
    }
  }, []);

  return (
    <MockAuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </MockAuthContext.Provider>
  );
};
