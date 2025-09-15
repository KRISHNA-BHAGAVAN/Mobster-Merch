import { apiCall } from './api';

export interface AddToCartData {
  product_id: number;
  quantity: number;
  variant_id?: string;
}

export const cartService = {
  getCart: async () => {
    try {
      const response = await apiCall('/cart');
      return response;
    } catch (error) {
      return [];
    }
  },

  addToCart: async (data: AddToCartData) => {
    try {
      console.log('Adding to cart:', data);
      const response = await apiCall('/cart', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      return response;
    } catch (error) {
      console.error('Add to cart error:', error);
      throw error;
    }
  },

  updateCartItem: async (cartId: number, quantity: number) => {
    const response = await apiCall(`/cart/${cartId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity })
    });
    return response;
  },

  removeFromCart: async (cartId: number) => {
    const response = await apiCall(`/cart/${cartId}`, { method: 'DELETE' });
    return response;
  },

  updateQuantity: async (productId: number, quantity: number) => {
    const response = await apiCall(`/cart/product/${productId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity })
    });
    return response;
  },

  removeByProductId: async (productId: number) => {
    const response = await apiCall(`/cart/product/${productId}`, { method: 'DELETE' });
    return response;
  }
};