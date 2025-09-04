import { apiCall } from './api';
import { API_BASE_URL } from '../config/api';

export const settingsService = {
  getWebsiteStatus: async () => {
    const response = await fetch(`${API_BASE_URL}/settings/status`);
    return response.json();
  },

  toggleWebsiteStatus: async (isOpen: boolean) => {
    return apiCall('/settings/toggle', {
      method: 'POST',
      body: JSON.stringify({ isOpen })
    });
  }
};