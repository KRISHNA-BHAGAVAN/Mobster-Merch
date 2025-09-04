import { apiCall } from './api';

export interface AddToCartData {
  product_id: number;
  quantity: number;
}

export const cartService = {
  getCart: async () => {
    try {
      const response = await apiCall('/cart');
      return response.json();
    } catch (error) {
      return [];
    }
  },

  addToCart: async (data: AddToCartData) => {
    const response = await apiCall('/cart', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return response.json();
  },

  updateCartItem: async (cartId: number, quantity: number) => {
    const response = await apiCall(`/cart/${cartId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity })
    });
    return response.json();
  },

  removeFromCart: async (cartId: number) => {
    const response = await apiCall(`/cart/${cartId}`, { method: 'DELETE' });
    return response.json();
  },

  updateQuantity: async (productId: number, quantity: number) => {
    const response = await apiCall(`/cart/product/${productId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity })
    });
    return response.json();
  },

  removeByProductId: async (productId: number) => {
    const response = await apiCall(`/cart/product/${productId}`, { method: 'DELETE' });
    return response.json();
  }
};