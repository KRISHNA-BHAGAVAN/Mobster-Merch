import { API_BASE_URL } from '../config/api';

export const secureAuthService = {
  login: async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }
    
    return response.json();
  },

  register: async (name: string, email: string, password: string, phone: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ name, email, password, phone })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }
    
    return response.json();
  },

  getCurrentUser: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error('Not authenticated');
    }
    
    return response.json();
  },

  logout: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include'
    });
    
    return response.json();
  }
};