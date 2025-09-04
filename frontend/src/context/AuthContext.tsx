// src/context/AuthContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { authService } from '../services/authService';

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
  register: (name: string, identifier: string, password: string, phone: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
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
      setLoading(true);
      const data = await authService.login(identifier, password);
      const mappedUser = {
        userId: data.user.id,
        name: data.user.name,
        email: data.user.email,
        phone: data.user.phone,
        image_url: data.user.image_url,
        isAdmin: data.user.isAdmin || data.isAdmin
      };
      setUser(mappedUser);
      setIsAuthenticated(true);
      setLoading(false);
      return data;
    } catch (err) {
      setLoading(false);
      console.error("Login error:", err);
      throw err;
    }
  };

  const register = async (name: string, email: string, password: string, phone: string) => {
    try {
      setLoading(true);
      const data = await authService.register(name, email, password, phone);
      const mappedUser = {
        userId: data.user.id,
        name: data.user.name,
        email: data.user.email,
        phone: data.user.phone,
        image_url: data.user.image_url,
        isAdmin: data.user.isAdmin || data.isAdmin
      };
      setUser(mappedUser);
      setIsAuthenticated(true);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      console.error("Registration error:", err);
      throw err;
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await authService.logout();
      setUser(undefined);
      setIsAuthenticated(false);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      console.error("Logout error:", err);
      throw err;
    }
  };

  const checkAuth = async () => {
    try {
      setLoading(true);
      // Attempt to get user first
      const user = await authService.getCurrentUser();
      
      if (user) {
        const mappedUser = {
          userId: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          image_url: user.image_url,
          isAdmin: user.isAdmin
        };
        setUser(mappedUser);
        setIsAuthenticated(true);
      } else {
        // If no user, try to refresh the token
        const refreshRes = await authService.refreshToken();
        if (refreshRes) {
          // If refresh token is valid, get the new user data
          const refreshedUser = await authService.getCurrentUser();
          if (refreshedUser) {
            const mappedRefreshedUser = {
              userId: refreshedUser.id,
              name: refreshedUser.name,
              email: refreshedUser.email,
              phone: refreshedUser.phone,
              image_url: refreshedUser.image_url,
              isAdmin: refreshedUser.isAdmin
            };
            setUser(mappedRefreshedUser);
            setIsAuthenticated(true);
          } else {
            // Something went wrong after refresh, clear state
            setIsAuthenticated(false);
            setUser(undefined);
          }
        } else {
          // Refresh token is also invalid, clear state
          setIsAuthenticated(false);
          setUser(undefined);
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
    <AuthContext.Provider value={{ isAuthenticated, user, login, register, logout, checkAuth, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
