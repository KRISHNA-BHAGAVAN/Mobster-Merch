import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface AuthPageProtectionProps {
  children: React.ReactNode;
}

export const AuthPageProtection: React.FC<AuthPageProtectionProps> = ({ children }) => {
  const { isAuthenticated, user, checkAuthStatus, loading } = useAuth();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAndRedirect = async () => {
      try {
        // If already authenticated from context, redirect immediately
        if (isAuthenticated && user) {
          const redirectPath = user.isAdmin ? '/admin' : '/';
          navigate(redirectPath, { replace: true });
          return;
        }

        // Otherwise, check auth status from server
        const isAuth = await checkAuthStatus();
        if (isAuth) {
          // User data should be set in context by checkAuthStatus
          // Wait a moment for context to update, then redirect
          setTimeout(() => {
            // Get user from context after checkAuthStatus updates it
            if (user?.isAdmin) {
              navigate('/admin', { replace: true });
            } else {
              navigate('/', { replace: true });
            }
          }, 100);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setChecking(false);
      }
    };

    if (!loading) {
      checkAndRedirect();
    }
  }, [isAuthenticated, user, checkAuthStatus, navigate, loading]);

  // Show loading while checking authentication
  if (loading || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
      </div>
    );
  }

  // If not authenticated, show the auth page
  return <>{children}</>;
};