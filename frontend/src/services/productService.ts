import { apiCall } from './api';

export const productService = {
  getAllProducts: () => 
    apiCall('/products/get-all-products'),

  getProductsByCategory: (category: string) => 
    apiCall(`/products/category/${category}`),

  getProduct: (id: number) => 
    apiCall(`/products/${id}`),

  // Admin only
  createProduct: (formData: FormData) => 
    fetch('http://localhost:5000/api/admin/products', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: formData
    }).then(res => res.json()),

  updateProduct: (id: number, formData: FormData) => 
    fetch(`http://localhost:5000/api/admin/products/${id}`, {
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