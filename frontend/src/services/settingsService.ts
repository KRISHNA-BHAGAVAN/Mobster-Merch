import { API_BASE_URL } from '../config/api';

export const settingsService = {
  async getPaymentMethod(): Promise<{ method: string }> {
    const response = await fetch(`${API_BASE_URL}/settings/payment-method`, {
      credentials: 'include'
    });
    return response.json();
  },

  async updatePaymentMethod(method: 'manual' | 'phonepe'): Promise<{ message: string; method: string }> {
    const response = await fetch(`${API_BASE_URL}/settings/payment-method`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ method })
    });
    return response.json();
  }
};