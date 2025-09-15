import { apiCall } from './api';
import { API_BASE_URL } from '../config/api';

export const productService = {
  getAllProducts: () => 
    apiCall('/products/get-available-products'),

  getProductsByCategory: (category_id: number) => {
    // Validate that category_id is an integer
    if (!Number.isInteger(category_id)) {
      throw new Error("category_id must be an integer");
    }
    return apiCall(`/products/${category_id}`);
  },

  getProduct: (category_id: number) => 
    apiCall(`/products/${category_id}`),

  getProductById: (id: number) => 
    apiCall(`/products/single/${id}`),

  // Admin only
  createProduct: (formData: FormData) => 
    fetch(`${API_BASE_URL}/admin/create-product`, {
      method: 'POST',
      credentials: 'include',
      body: formData
    }).then(res => res.json()),

  updateProduct: (id: number, formData: FormData) => 
    fetch(`${API_BASE_URL}/admin/products/${id}`, {
      method: 'PUT',
      credentials: 'include',
      body: formData
    }).then(res => res.json()),

  deleteProduct: (id: number) => 
    apiCall(`/admin/products/${id}`, { method: 'DELETE' }),

  getAvailableProducts: () => 
    apiCall('/products/get-available-products'),

  getUnavailableProducts: () => 
    apiCall('/products/not-available-products'),

  restoreProduct: (id: number) => 
    apiCall(`/admin/products/${id}/restore`, { method: 'PUT' }),

  permanentDeleteProduct: (id: number) => 
    apiCall(`/admin/products/${id}/permanent`, { method: 'DELETE' })
};