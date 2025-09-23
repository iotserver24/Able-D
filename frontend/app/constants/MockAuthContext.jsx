import { createContext, useContext, useState, useCallback } from 'react';

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
    
    // Store in localStorage for persistence
    localStorage.setItem('mockUser', JSON.stringify(mockUser));
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('mockUser');
  }, []);

  // Check for existing session on mount
  useState(() => {
    const storedUser = localStorage.getItem('mockUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }
  }, []);

  return (
    <MockAuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </MockAuthContext.Provider>
  );
};