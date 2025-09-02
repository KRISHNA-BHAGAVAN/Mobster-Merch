import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services';

interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  image_url?: string;
}

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  isAuthenticated: boolean;
  loading: boolean;
  login: (token: string, refreshToken: string, userData: User, adminStatus: boolean) => void;
  logout: () => void;
  refreshToken: () => Promise<boolean>;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const adminStatus = localStorage.getItem('isAdmin') === 'true';
    
    if (token) {
      setIsAuthenticated(true);
      setIsAdmin(adminStatus);
      fetchUserData(token, adminStatus);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserData = async (token: string, adminStatus: boolean) => {
    try {
      const userData = await authService.getCurrentUser();
      // Map backend user_id to frontend id
      const mappedUser = {
        id: userData.user_id,
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        image_url: userData.image_url
      };
      setUser(mappedUser);
      setIsAdmin(adminStatus);
      setIsAuthenticated(true);
    } catch (error) {
      // Clear invalid token
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('isAdmin');
      setIsAuthenticated(false);
      setIsAdmin(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const refreshTokenFunc = async (): Promise<boolean> => {
    try {
      const storedRefreshToken = localStorage.getItem('refreshToken');
      if (!storedRefreshToken) return false;
      
      const data = await authService.refreshToken(storedRefreshToken);
      localStorage.setItem('token', data.token);
      localStorage.setItem('refreshToken', data.refreshToken);
      
      // Preserve admin status if it exists
      const currentAdminStatus = localStorage.getItem('isAdmin') === 'true';
      if (currentAdminStatus) {
        setIsAdmin(true);
      }
      
      return true;
    } catch (error) {
      return false;
    }
  };

  const login = (token: string, refreshToken: string, userData: User, adminStatus: boolean) => {
    localStorage.setItem('token', token);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('isAdmin', adminStatus.toString());
    setUser(userData);
    setIsAdmin(adminStatus);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('isAdmin');
    setUser(null);
    setIsAdmin(false);
    setIsAuthenticated(false);
  };

  const updateUser = (userData: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...userData } : null);
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, isAuthenticated, loading, login, logout, refreshToken: refreshTokenFunc, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};