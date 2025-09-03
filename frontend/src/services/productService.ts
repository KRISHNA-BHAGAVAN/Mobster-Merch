import { apiCall } from './api';
import { API_BASE_URL } from '../config/api';

export const productService = {
  getAllProducts: () => 
    apiCall('/products/get-all-products'),

  getProductsByCategory: (category: string) => 
    apiCall(`/products/category/${category}`),

  getProduct: (id: number) => 
    apiCall(`/products/${id}`),

  // Admin only
  createProduct: (formData: FormData) => 
    fetch(`${API_BASE_URL}/admin/products`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: formData
    }).then(res => res.json()),

  updateProduct: (id: number, formData: FormData) => 
    fetch(`${API_BASE_URL}/admin/products/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: formData
    }).then(res => res.json()),

  deleteProduct: (id: number) => 
    apiCall(`/admin/products/${id}`, { method: 'DELETE' }),

  getAdminProducts: () => 
    apiCall('/admin/products')
};