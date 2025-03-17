
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService, LoginRequest, AuthResponse } from '@/services/authService';
import { toast } from 'sonner';

interface User {
  id: number;
  username: string;
  userType: number;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check if user is already logged in
    const authStatus = localStorage.getItem('isAuthenticated');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
      
      // Get user info from localStorage
      const userInfo = localStorage.getItem('userInfo');
      if (userInfo) {
        try {
          setUser(JSON.parse(userInfo));
        } catch (error) {
          console.error('Failed to parse user info:', error);
        }
      }
    }
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      // Use the new authService instead of hardcoded credentials
      const credentials: LoginRequest = { username, password };
      const response: AuthResponse = await authService.login(credentials);
      
      if (response.isSuccess) {
        setIsAuthenticated(true);
        setUser({
          id: response.userID,
          username: response.username,
          userType: response.userType
        });
        
        toast.success('Login successful');
        return true;
      } else {
        toast.error(response.message || 'Login failed');
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please try again.');
      return false;
    }
  };

  const logout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
