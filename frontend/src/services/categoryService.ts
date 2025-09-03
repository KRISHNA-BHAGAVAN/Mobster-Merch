import { apiCall } from './api';
import { API_BASE_URL } from '../config/api';

export interface Category {
  category_name: string;
  description?: string;
  image_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateCategoryData {
  name: string;
  description?: string;
  image_url?: string;
}

export const categoryService = {
  getAllCategories: () => 
    apiCall('/categories'),

  createCategory: (data: CreateCategoryData) => 
    apiCall('/categories', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  createCategoryWithImage: (formData: FormData) => 
    fetch(`${API_BASE_URL}/categories`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: formData
    }).then(res => res.json()),

  updateCategory: (categoryName: string, data: CreateCategoryData) => 
    apiCall(`/categories/${categoryName}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),

  updateCategoryWithImage: (categoryName: string, formData: FormData) => 
    fetch(`${API_BASE_URL}/categories/${categoryName}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: formData
    }).then(res => res.json()),

  deleteCategory: (categoryName: string) => 
    apiCall(`/categories/${categoryName}`, { method: 'DELETE' })
};