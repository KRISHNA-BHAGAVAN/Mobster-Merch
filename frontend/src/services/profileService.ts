import { API_BASE_URL } from '../config/api';

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
  return {};
};

export const profileService = {
  getProfile: async (): Promise<UserProfile> => {
    const response = await fetch(`${API_BASE_URL}/profile`, {
      headers: getAuthHeaders(),
      credentials: 'include'
    });
    
    if (!response.ok) throw new Error('Failed to fetch profile');
    return response.json();
  },

  updateProfile: async (data: UpdateProfileData, imageFile?: File): Promise<UserProfile> => {
    const formData = new FormData();
    
    if (data.name) formData.append('name', data.name);
    if (data.phone) formData.append('phone', data.phone);
    if (imageFile) formData.append('image', imageFile);
    
    const response = await fetch(`${API_BASE_URL}/profile`, {
      method: 'PUT',
      credentials: 'include',
      body: formData
    });
    
    if (!response.ok) throw new Error('Failed to update profile');
    const result = await response.json();
    return result.user;
  }
};