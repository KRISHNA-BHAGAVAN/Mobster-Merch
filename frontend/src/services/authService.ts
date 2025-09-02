import { apiCall } from './api';

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone: string;
}

export const authService = {
  login: (data: LoginData) => 
    apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  register: (data: RegisterData) => 
    apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  refreshToken: (refreshToken: string) => 
    apiCall('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken })
    }),

  getCurrentUser: () => 
    apiCall('/auth/profile'),

  logout: () => 
    apiCall('/auth/logout', { method: 'POST' })
};