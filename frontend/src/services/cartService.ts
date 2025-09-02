import { apiCall } from './api';

export interface AddToCartData {
  product_id: number;
  quantity: number;
}

export const cartService = {
  getCart: () => 
    apiCall('/cart'),

  addToCart: (data: AddToCartData) => 
    apiCall('/cart', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  updateCartItem: (cartId: number, quantity: number) => 
    apiCall(`/cart/${cartId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity })
    }),

  removeFromCart: (cartId: number) => 
    apiCall(`/cart/${cartId}`, { method: 'DELETE' }),

  updateQuantity: (productId: number, quantity: number) => 
    apiCall(`/cart/product/${productId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity })
    }),

  removeByProductId: (productId: number) => 
    apiCall(`/cart/product/${productId}`, { method: 'DELETE' })
};