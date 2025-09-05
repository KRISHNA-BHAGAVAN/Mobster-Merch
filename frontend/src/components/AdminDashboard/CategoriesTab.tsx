import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { categoryService, Category, API_BASE_URL } from '../../services';
import { CategoryFormData } from './types';

interface CategoriesTabProps {
  categories: Category[];
  fetchCategories: () => void;
  showConfirmation: (message: string, action: () => void) => void;
}

export const CategoriesTab: React.FC<CategoriesTabProps> = ({
  categories,
  fetchCategories,
  showConfirmation
}) => {
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryFormData, setCategoryFormData] = useState<CategoryFormData>({
    name: '',
    description: '',
    image_url: ''
  });
  const [categoryImageFile, setCategoryImageFile] = useState<File | null>(null);

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formDataToSend = new FormData();
    
    formDataToSend.append('name', categoryFormData.name);
    formDataToSend.append('description', categoryFormData.description);
    
    if (categoryImageFile) {
      formDataToSend.append('image', categoryImageFile);
    }

    try {
      if (editingCategory) {
        await categoryService.updateCategoryWithImage(editingCategory.category_id, formDataToSend);
      } else {
        await categoryService.createCategoryWithImage(formDataToSend);
      }
      
      fetchCategories();
      resetCategoryForm();
      toast.success(editingCategory ? 'Category updated successfully!' : 'Category created successfully!');
    } catch (error) {
      toast.error(error.message || 'Error saving category');
    }
  };

  const handleCategoryDelete = async (categoryId: number) => {
    showConfirmation(
      'Are you sure you want to delete this category?',
      async () => {
        try {
          await categoryService.deleteCategory(categoryId);
          fetchCategories();
          toast.success('Category deleted successfully!');
        } catch (error) {
          toast.error(error.message || 'Error deleting category');
        }
      }
    );
  };

  const handleCategoryEdit = (category: Category) => {
    setEditingCategory(category);
    setCategoryFormData({
      name: category.name,
      description: category.description || '',
      image_url: category.image_url || ''
    });
    setShowCategoryForm(true);
  };

  const resetCategoryForm = () => {
    setCategoryFormData({ name: '', description: '', image_url: '' });
    setCategoryImageFile(null);
    setEditingCategory(null);
    setShowCategoryForm(false);
  };

  return (
    <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">Categories</h2>
        <button 
          onClick={() => setShowCategoryForm(!showCategoryForm)}
          className="py-2 px-4 rounded-full bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors duration-200"
        >
          Add Category
        </button>
      </div>

      <AnimatePresence>
        {showCategoryForm && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-8 p-6 bg-gray-900 rounded-xl shadow-lg border border-gray-700"
          >
            <h2 className="text-xl font-bold mb-4">{editingCategory ? 'Edit Category' : 'Add New Category'}</h2>
            <form onSubmit={handleCategorySubmit} className="space-y-4">
              <input
                placeholder="Category Name"
                value={categoryFormData.name}
                onChange={(e) => setCategoryFormData({...categoryFormData, name: e.target.value})}
                className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500"
                required
              />
              <textarea
                placeholder="Description (Optional)"
                value={categoryFormData.description}
                onChange={(e) => setCategoryFormData({...categoryFormData, description: e.target.value})}
                className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500"
                rows={3}
              />
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setCategoryImageFile(e.target.files?.[0] || null)}
                className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-500 file:text-white hover:file:bg-red-600"
              />
              <div className="flex gap-4">
                <button type="submit" className="py-2 px-6 rounded-full bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors duration-200">
                  {editingCategory ? 'Update Category' : 'Add Category'}
                </button>
                <button type="button" onClick={resetCategoryForm} className="py-2 px-6 rounded-full border border-gray-600 text-gray-300 font-semibold hover:bg-gray-700 transition-colors duration-200">
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map(category => (
          <div key={category.category_id} className="bg-gray-900 p-4 rounded-xl shadow-md border border-gray-700">
            {category.image_url && (
              <img 
                src={`${API_BASE_URL.replace('/api', '')}/${category.image_url}`}
                alt={category.name}
                className="w-full h-32 object-cover rounded-lg mb-4"
              />
            )}
            <h3 className="text-lg font-bold text-white mb-1">{category.name}</h3>
            <p className="text-sm text-gray-400 mb-4">{category.description || 'No description'}</p>
            <div className="flex gap-2">
              <button 
                onClick={() => handleCategoryEdit(category)}
                className="flex-1 py-2 rounded-full border border-gray-600 text-gray-300 font-semibold hover:bg-gray-700 transition-colors duration-200"
              >
                Edit
              </button>
              <button 
                onClick={() => handleCategoryDelete(category.category_id)}
                className="flex-1 py-2 rounded-full bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors duration-200"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};