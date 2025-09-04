import { API_BASE_URL } from '../config/api';

// API utility with session-based authentication
export const apiCall = async (url: string, options: RequestInit = {}) => {
  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    credentials: 'include',
    headers: {
      ...options.headers,
      'Content-Type': 'application/json',
    },
  });

  // If session expired, redirect to login
  if (response.status === 401) {
    window.location.href = '/login';
  }

  return response;
};