// src/context/AuthContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { authService } from '../services/authService';
import { API_BASE_URL } from '../config/api';

interface User {
  userId: number | string;
  name: string;
  email?: string;
  phone?: string;
  image_url?: string;
  isAdmin: boolean;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user?: User;
  login: (identifier: string, password: string) => Promise<any>;
  register: (name: string, identifier: string, password: string, phone: string) => Promise<any>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  checkAuthStatus: () => Promise<boolean>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | undefined>();
  const [loading, setLoading] = useState<boolean>(true); // Add a loading state

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (identifier: string, password: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ identifier, password })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        return { success: false, error: data.error || "Login failed", status: res.status };
      }

      const mappedUser = {
        userId: data.user.id,
        name: data.user.name,
        email: data.user.email,
        phone: data.user.phone,
        image_url: data.user.image_url,
        isAdmin: data.user.isAdmin || data.isAdmin
      };
      
      localStorage.setItem('user', JSON.stringify(mappedUser));
      setUser(mappedUser);
      setIsAuthenticated(true);

      return { success: true, user: data.user };
    } catch (err: any) {
      return { success: false, error: err.message || "Network error" };
    }
  };

  const register = async (name: string, email: string, password: string, phone: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, email, password, phone })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        return { success: false, error: data.error || "Registration failed" };
      }

      return { success: true, message: data.message };
    } catch (err: any) {
      return { success: false, error: err.message || "Network error" };
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await authService.logout();
      
      // Clear all auth-related data
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      
      setUser(undefined);
      setIsAuthenticated(false);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      console.error("Logout error:", err);
      
      // Even if logout fails, clear local state
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      setUser(undefined);
      setIsAuthenticated(false);
      
      throw err;
    }
  };

  const checkAuthStatus = async (): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/status`, {
        credentials: 'include'
      });
      const data = await response.json();
      
      if (data.isAuthenticated && data.user) {
        const mappedUser = {
          userId: data.user.id,
          name: data.user.name,
          email: data.user.email,
          phone: data.user.phone,
          image_url: data.user.image_url,
          isAdmin: data.user.isAdmin
        };
        
        
        localStorage.setItem('user', JSON.stringify(mappedUser));
        
        setUser(mappedUser);
        setIsAuthenticated(true);
        return true;
      } else {
        setIsAuthenticated(false);
        setUser(undefined);
        return false;
      }
    } catch (err) {
      console.error("Auth status check error:", err);
      setIsAuthenticated(false);
      setUser(undefined);
      return false;
    }
  };

  const checkAuth = async () => {
    try {
      setLoading(true);
      // First try quick status check
      const isAuth = await checkAuthStatus();
      
      if (!isAuth) {
        // If not authenticated, try to refresh the token
        const refreshRes = await authService.refreshToken();
        if (refreshRes) {
          // If refresh token is valid, check status again
          await checkAuthStatus();
        }
      }
    } catch (err) {
      console.error("Auth check error:", err);
      setIsAuthenticated(false);
      setUser(undefined);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, register, logout, checkAuth, checkAuthStatus, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};