import { API_BASE_URL } from '../config/api';

// API utility with automatic token refresh
export const apiCall = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json',
    },
  });

  // If token expired, try to refresh
  if (response.status === 401) {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      try {
        const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });

        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          localStorage.setItem('token', data.token);
          localStorage.setItem('refreshToken', data.refreshToken);
          
          // Retry original request with new token
          return fetch(url, {
            ...options,
            headers: {
              ...options.headers,
              'Authorization': `Bearer ${data.token}`,
              'Content-Type': 'application/json',
            },
          });
        }
      } catch (error) {
        // Refresh failed, redirect to login
        localStorage.clear();
        window.location.href = '/login';
      }
    }
  }

  return response;
};