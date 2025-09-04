import { API_BASE_URL } from '../config/api';

// API Configuration is now imported from config

// Generic API call function with session-based auth
export const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Only set Content-Type if body is not FormData
  const headers: HeadersInit = options.body instanceof FormData
    ? { ...options.headers }
    : { 'Content-Type': 'application/json', ...options.headers };

  const config = {
    ...options,
    credentials: 'include' as RequestCredentials,
    headers,
  };

  const response = await fetch(url, config);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
    console.error('API Error:', errorData);
    throw new Error(errorData.message || errorData.error || `API Error: ${response.status}`);
  }
  
  return response.json();
};