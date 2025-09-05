import { apiCall } from './api';
import { API_BASE_URL } from '../config/api';

export interface Category {
  category_id: number;
  name: string;
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
      credentials: 'include',
      body: formData
    }).then(res => res.json()),

  updateCategory: (categoryId: number, data: CreateCategoryData) => 
    apiCall(`/categories/${categoryId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),

  updateCategoryWithImage: (categoryId: number, formData: FormData) => 
    fetch(`${API_BASE_URL}/categories/${categoryId}`, {
      method: 'PUT',
      credentials: 'include',
      body: formData
    }).then(res => res.json()),

  deleteCategory: (categoryId: number) => 
    apiCall(`/categories/${categoryId}`, { method: 'DELETE' })
};