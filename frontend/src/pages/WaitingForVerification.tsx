import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';
import { API_BASE_URL } from '../config/api';

export const WaitingForVerification: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || 'your email';
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    const checkVerification = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/check-verification?email=${encodeURIComponent(email)}`);
        const data = await response.json();
        if (data.verified) {
          setIsVerified(true);
          setTimeout(() => navigate('/login'), 2000);
        }
      } catch (error) {
        console.log('Verification check failed:', error);
      }
    };

    const interval = setInterval(checkVerification, 3000);
    return () => clearInterval(interval);
  }, [email, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black relative">
      <video
        autoPlay
        loop
        muted
        className="absolute inset-0 w-full h-full object-cover z-0"
      >
        <source src="/images/boom1.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-black/30 z-10"></div>
      
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-md z-20"
      >
        <div className="bg-gray-900/90 backdrop-blur-sm p-8 rounded-2xl border border-red-500 text-center">
          <div className="mb-6">
            <Icon icon="lucide:mail-check" className="h-16 w-16 text-red-500 mx-auto mb-4" />
          </div>
          
          <h1 className="text-2xl font-bold text-white mb-4">
            {isVerified ? 'Email Verified!' : 'Check Your Email'}
          </h1>
          
          <p className="text-gray-300 mb-6">
            {isVerified ? (
              <>Email verified successfully! Redirecting to login...</>
            ) : (
              <>We've sent a verification link to <span className="text-red-400 font-semibold">{email}</span>. 
              Please click the link in your email to verify your account.</>
            )}
          </p>
          
          <div className="bg-gray-800/50 p-4 rounded-lg mb-6">
            <div className="flex items-center justify-center space-x-2 mb-2">
              {isVerified ? (
                <>
                  <Icon icon="lucide:check-circle" className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-500">Verification complete!</span>
                </>
              ) : (
                <>
                  <Icon icon="lucide:clock" className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm text-yellow-500">Waiting for verification...</span>
                </>
              )}
            </div>
            {!isVerified && (
              <p className="text-xs text-gray-400">
                The verification link will expire in 1 hour
              </p>
            )}
          </div>
          
          <div className="space-y-3">
            <p className="text-sm text-gray-400">
              Didn't receive the email? Check your spam folder or
            </p>
            <button
              onClick={() => navigate('/login')}
              className="text-red-500 hover:text-red-400 underline text-sm"
            >
              Try registering again
            </button>
          </div>
          
          <div className="mt-6 pt-4 border-t border-gray-700">
            <button
              onClick={() => navigate('/login')}
              className="text-gray-400 hover:text-white text-sm transition-colors"
            >
              ← Back to Login
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};