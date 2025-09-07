import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { productService, API_BASE_URL, Category } from '../../services';
import { Product, ProductFormData } from './types';

interface ProductsTabProps {
  products: Product[];
  unavailableProducts: Product[];
  categories: Category[];
  fetchProducts: () => void;
  showConfirmation: (message: string, action: () => void) => void;
}

export const ProductsTab: React.FC<ProductsTabProps> = ({
  products,
  unavailableProducts,
  categories,
  fetchProducts,
  showConfirmation
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productSubTab, setProductSubTab] = useState('available');
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: ''
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formDataToSend = new FormData();
    
    Object.entries(formData).forEach(([key, value]) => {
      formDataToSend.append(key, value);
    });
    
    const categoryObject = categories.find(cat => cat.name === formData.category);
    if (categoryObject) {
      formDataToSend.append('category_id', categoryObject.category_id.toString());
    } else {
      toast.error('Invalid category selected');
      return;
    }

    if (imageFile) {
      formDataToSend.append('image', imageFile);
    }

    try {
      if (editingProduct) {
        await productService.updateProduct(editingProduct.product_id, formDataToSend);
      } else {
        await productService.createProduct(formDataToSend);
      }
      
      fetchProducts();
      resetForm();
      toast.success(editingProduct ? 'Product updated successfully!' : 'Product added successfully!');
    } catch (error) {
      toast.error('Error saving product');
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    // Find the category name from the product's category field or category_name
    const categoryName = product.category_name || '';
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      stock: product.stock.toString(),
      category: categoryName
    });
    setShowAddForm(true);
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', price: '', stock: '', category: '' });
    setImageFile(null);
    setEditingProduct(null);
    setShowAddForm(false);
  };

  const handleSoftDelete = async (id: number) => {
    showConfirmation(
      'Are you sure you want to stop displaying this product?',
      async () => {
        try {
          await productService.deleteProduct(id);
          fetchProducts();
          toast.success('Product soft-deleted successfully!');
        } catch (error) {
          toast.error('Error soft-deleting product');
        }
      }
    );
  };

  const handleRestoreProduct = async (id: number) => {
    showConfirmation(
      'Are you sure you want to restore this product?',
      async () => {
        try {
          await productService.restoreProduct(id);
          fetchProducts();
          toast.success('Product restored successfully!');
        } catch (error) {
          toast.error('Error restoring product');
        }
      }
    );
  };

  const handlePermanentDelete = async (id: number) => {
    showConfirmation(
      'Are you sure you want to permanently delete this product? This action cannot be undone.',
      async () => {
        try {
          await productService.permanentDeleteProduct(id);
          fetchProducts();
          toast.success('Product permanently deleted!');
        } catch (error) {
          toast.error('Error permanently deleting product');
        }
      }
    );
  };

  return (
    <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
      <div className="flex justify-between items-center mb-6">
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => setProductSubTab("available")}
            className={`py-2 px-4 rounded-full font-semibold transition-colors duration-200 ${
              productSubTab === "available"
                ? "bg-red-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            Available Products
          </button>
          <button
            onClick={() => setProductSubTab("unavailable")}
            className={`py-2 px-4 rounded-full font-semibold transition-colors duration-200 ${
              productSubTab === "unavailable"
                ? "bg-red-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            Not Available Products
          </button>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="py-2 px-4 rounded-full bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors duration-200"
        >
          Add Product
        </button>
      </div>

      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-8 p-6 bg-gray-900 rounded-xl shadow-lg border border-gray-700"
          >
            <h2 className="text-xl font-bold mb-4">
              {editingProduct ? "Edit Product" : "Add New Product"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  placeholder="Product Name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500"
                  required
                />
                <input
                  placeholder="Price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500"
                  required
                />
                <input
                  placeholder="Stock"
                  type="number"
                  value={formData.stock}
                  onChange={(e) =>
                    setFormData({ ...formData, stock: e.target.value })
                  }
                  className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500"
                  required
                />
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat.category_id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <textarea
                placeholder="Description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500"
                rows={3}
              />
              <div>
                <label htmlFor="img">Front side</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-500 file:text-white hover:file:bg-red-600"
                />
              </div>
              <div>
                <label htmlFor="img">Back side</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-500 file:text-white hover:file:bg-red-600"
                />
              </div>
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="py-2 px-6 rounded-full bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors duration-200"
                >
                  {editingProduct ? "Update Product" : "Add Product"}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="py-2 px-6 rounded-full border border-gray-600 text-gray-300 font-semibold hover:bg-gray-700 transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {productSubTab === "available" &&
          products.map((product) => (
            <motion.div
              key={product.product_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-gray-900 p-4 rounded-xl shadow-md border border-gray-700"
            >
              {product.image_url && (
                <img
                  src={`${API_BASE_URL.replace("api", "")}${product.image_url}`}
                  alt={product.name}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
              )}
              <h3 className="text-lg font-bold text-white mb-1">
                {product.name}
              </h3>
              <p className="text-sm text-gray-400 mb-2 truncate">
                {product.description}
              </p>
              <div className="flex justify-between items-center mb-4 text-sm font-mono text-red-400">
                <span>₹{product.price}</span>
                <span className="text-gray-400">Stock: {product.stock}</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(product)}
                  className="flex-1 py-2 rounded-full border border-gray-600 text-gray-300 font-semibold hover:bg-gray-700 transition-colors duration-200"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleSoftDelete(product.product_id)}
                  className="flex-1 py-2 rounded-full bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors duration-200"
                >
                  Stop
                </button>
              </div>
            </motion.div>
          ))}
        {productSubTab === "unavailable" &&
          unavailableProducts.map((product) => (
            <motion.div
              key={product.product_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-gray-900 p-4 rounded-xl shadow-md border border-gray-700 opacity-70"
            >
              {product.image_url && (
                <img
                  src={`${API_BASE_URL.replace("api", "")}${product.image_url}`}
                  alt={product.name}
                  className="w-full h-48 object-cover rounded-lg mb-4 opacity-50"
                />
              )}
              <h3 className="text-lg font-bold text-white mb-1 line-through">
                {product.name}
              </h3>
              <p className="text-sm text-gray-400 mb-2 truncate">
                {product.description}
              </p>
              <div className="flex justify-between items-center mb-4 text-sm font-mono text-red-400">
                <span>₹{product.price}</span>
                <span className="text-gray-400">Stock: {product.stock}</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleRestoreProduct(product.product_id)}
                  className="flex-1 py-2 rounded-full bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors duration-200"
                >
                  Restore
                </button>
                <button
                  onClick={() => handlePermanentDelete(product.product_id)}
                  className="flex-1 py-2 rounded-full bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors duration-200"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          ))}
      </div>
    </div>
  );
};