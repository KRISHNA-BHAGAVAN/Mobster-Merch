import { API_BASE_URL } from './api';

export interface UserProfile {
  user_id: number;
  name: string;
  email: string;
  phone?: string;
  image_url?: string;
}

export interface UpdateProfileData {
  name?: string;
  phone?: string;
}

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`
  };
};

export const profileService = {
  getProfile: async (): Promise<UserProfile> => {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) throw new Error('Failed to fetch profile');
    return response.json();
  },

  updateProfile: async (data: UpdateProfileData, imageFile?: File): Promise<UserProfile> => {
    const formData = new FormData();
    
    if (data.name) formData.append('name', data.name);
    if (data.phone) formData.append('phone', data.phone);
    if (imageFile) formData.append('image', imageFile);
    
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: formData
    });
    
    if (!response.ok) throw new Error('Failed to update profile');
    const result = await response.json();
    return result.user;
  }
};