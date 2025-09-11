import { API_BASE_URL } from '../config/api';

export const wishlistService = {
  getWishlist: async () => {
    const response = await fetch(`${API_BASE_URL}/wishlist`, {
      credentials: 'include'
    });
    if (!response.ok) throw new Error('Failed to fetch wishlist');
    return response.json();
  },

  addToWishlist: async (product_id: number) => {
    const response = await fetch(`${API_BASE_URL}/wishlist/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ product_id })
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to add to wishlist');
    }
    return response.json();
  },

  removeFromWishlist: async (product_id: number) => {
    const response = await fetch(`${API_BASE_URL}/wishlist/remove/${product_id}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to remove from wishlist');
    }
    return response.json();
  },

  checkWishlist: async (product_id: number) => {
    const response = await fetch(`${API_BASE_URL}/wishlist/check/${product_id}`, {
      credentials: 'include'
    });
    if (!response.ok) throw new Error('Failed to check wishlist');
    return response.json();
  }
};