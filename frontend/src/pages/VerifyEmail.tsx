import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';
import { API_BASE_URL } from '../config/api';

export const VerifyEmail: React.FC = () => {
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('Verifying your email...');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link.');
      return;
    }

    verifyEmail(token);
  }, [searchParams]);

  const verifyEmail = async (token: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify-email?token=${token}`, {
        method: 'GET',
        credentials: 'include'
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage(data.message);
        setTimeout(() => navigate('/login'), 3000);
      } else {
        setStatus('error');
        setMessage(data.error || 'Verification failed');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Network error. Please try again.');
    }
  };

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
            {status === 'verifying' && (
              <Icon icon="lucide:loader-2" className="animate-spin h-12 w-12 text-red-500 mx-auto mb-4" />
            )}
            {status === 'success' && (
              <Icon icon="lucide:check-circle" className="h-12 w-12 text-green-500 mx-auto mb-4" />
            )}
            {status === 'error' && (
              <Icon icon="lucide:x-circle" className="h-12 w-12 text-red-500 mx-auto mb-4" />
            )}
          </div>
          
          <h1 className="text-2xl font-bold text-white mb-4">
            {status === 'verifying' && 'Verifying Email'}
            {status === 'success' && 'Email Verified!'}
            {status === 'error' && 'Verification Failed'}
          </h1>
          
          <p className="text-gray-300 mb-6">{message}</p>
          
          {status === 'success' && (
            <p className="text-sm text-gray-400">
              Redirecting to login page in 3 seconds...
            </p>
          )}
          
          {status === 'error' && (
            <button
              onClick={() => navigate('/login')}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Go to Login
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};