import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { productService, API_BASE_URL, Category } from '../../services';
import { Product, ProductFormData, DynamicField } from './types';
import { VariantConfiguration } from './VariantConfiguration';

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
    category: '',
    additional_info: []
  });
  const [variantConfig, setVariantConfig] = useState<any>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [showDynamicFields, setShowDynamicFields] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formDataToSend = new FormData();
    
    // Combine additional_info with variant config
    const combinedAdditionalInfo = {
      ...formData.additional_info,
      ...(variantConfig || {})
    };
    
    // Calculate price and stock based on variants or use direct values
    let finalPrice = formData.price;
    let finalStock = formData.stock;
    
    if (variantConfig && variantConfig.variants && variantConfig.variants.length > 0) {
      const defaultVariant = variantConfig.variants.find(v => v.is_default);
      if (defaultVariant) {
        finalPrice = defaultVariant.price.toString();
        finalStock = '0'; // Stock managed by variants
      }
    }
    
    Object.entries(formData).forEach(([key, value]) => {
      if (key === 'additional_info') {
        formDataToSend.append(key, JSON.stringify(combinedAdditionalInfo));
      } else if (key === 'price') {
        formDataToSend.append(key, finalPrice);
      } else if (key === 'stock') {
        formDataToSend.append(key, finalStock);
      } else {
        formDataToSend.append(key, value);
      }
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
    
    // Extract variant config from additional_info
    const additionalInfo = product.additional_info || {};
    const { variants, variant_fields, ...otherInfo } = additionalInfo;
    
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      stock: product.stock.toString(),
      category: categoryName,
      additional_info: []
    });
    
    // Set variant config if exists
    if (variants || variant_fields) {
      const variantConfig = { 
        variants: variants || [], 
        variant_fields: variant_fields || [],
        default_variant_id: variants?.find(v => v.is_default)?.id
      };
      setVariantConfig(variantConfig);
    } else {
      setVariantConfig(null);
    }
    
    setShowAddForm(true);
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', price: '', stock: '', category: '', additional_info: [] });
    setImageFile(null);
    setEditingProduct(null);
    setShowAddForm(false);
    setShowDynamicFields(false);
    setVariantConfig(null);
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

  const addDynamicField = () => {
    const newField: DynamicField = {
      id: Date.now().toString(),
      name: '',
      type: 'text',
      value: '',
      required: false
    };
    setFormData({
      ...formData,
      additional_info: [...(formData.additional_info || []), newField]
    });
  };

  const updateDynamicField = (id: string, updates: Partial<DynamicField>) => {
    setFormData({
      ...formData,
      additional_info: (formData.additional_info || []).map(field => 
        field.id === id ? { ...field, ...updates } : field
      )
    });
  };

  const removeDynamicField = (id: string) => {
    setFormData({
      ...formData,
      additional_info: (formData.additional_info || []).filter(field => field.id !== id)
    });
  };

  const addSelectOption = (fieldId: string) => {
    const field = (formData.additional_info || []).find(f => f.id === fieldId);
    if (field) {
      updateDynamicField(fieldId, {
        options: [...(field.options || []), '']
      });
    }
  };

  const updateSelectOption = (fieldId: string, optionIndex: number, value: string) => {
    const field = (formData.additional_info || []).find(f => f.id === fieldId);
    if (field && field.options) {
      const newOptions = [...field.options];
      newOptions[optionIndex] = value;
      updateDynamicField(fieldId, { options: newOptions });
    }
  };

  const removeSelectOption = (fieldId: string, optionIndex: number) => {
    const field = (formData.additional_info || []).find(f => f.id === fieldId);
    if (field && field.options) {
      const newOptions = field.options.filter((_, index) => index !== optionIndex);
      updateDynamicField(fieldId, { options: newOptions });
    }
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
                {!variantConfig && (
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
                )}
                {!variantConfig && (
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
                )}
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
              
              <div className="border-t border-gray-700 pt-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-white">Additional Information</h3>
                  <button
                    type="button"
                    onClick={() => setShowDynamicFields(!showDynamicFields)}
                    className="py-1 px-3 rounded bg-blue-600 text-white text-sm hover:bg-blue-700"
                  >
                    {showDynamicFields ? 'Hide' : 'Show'} Custom Fields
                  </button>
                </div>
                
                {showDynamicFields && (
                  <div className="space-y-4">
                    {(formData.additional_info || []).map((field) => (
                      <div key={field.id} className="p-4 bg-gray-800 rounded border border-gray-600">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                          <input
                            placeholder="Field Name"
                            value={field.name}
                            onChange={(e) => updateDynamicField(field.id, { name: e.target.value })}
                            className="p-2 bg-gray-900 border border-gray-600 rounded text-white text-sm"
                          />
                          <select
                            value={field.type}
                            onChange={(e) => updateDynamicField(field.id, { type: e.target.value as any })}
                            className="p-2 bg-gray-900 border border-gray-600 rounded text-white text-sm"
                          >
                            <option value="text">Text</option>
                            <option value="number">Number</option>
                            <option value="textarea">Textarea</option>
                            <option value="select">Dropdown</option>
                          </select>
                          <div className="flex gap-2">
                            <label className="flex items-center text-sm text-white">
                              <input
                                type="checkbox"
                                checked={field.required}
                                onChange={(e) => updateDynamicField(field.id, { required: e.target.checked })}
                                className="mr-1"
                              />
                              Required
                            </label>
                            <button
                              type="button"
                              onClick={() => removeDynamicField(field.id)}
                              className="px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                        
                        {field.type === 'select' && (
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-300">Options:</span>
                              <button
                                type="button"
                                onClick={() => addSelectOption(field.id)}
                                className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                              >
                                Add Option
                              </button>
                            </div>
                            {field.options?.map((option, index) => (
                              <div key={index} className="flex gap-2">
                                <input
                                  placeholder={`Option ${index + 1}`}
                                  value={option}
                                  onChange={(e) => updateSelectOption(field.id, index, e.target.value)}
                                  className="flex-1 p-2 bg-gray-900 border border-gray-600 rounded text-white text-sm"
                                />
                                <button
                                  type="button"
                                  onClick={() => removeSelectOption(field.id, index)}
                                  className="px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        <div className="mt-3">
                          <span className="text-sm text-gray-300">Default Value:</span>
                          {field.type === 'textarea' ? (
                            <textarea
                              placeholder="Default value"
                              value={field.value}
                              onChange={(e) => updateDynamicField(field.id, { value: e.target.value })}
                              className="w-full p-2 bg-gray-900 border border-gray-600 rounded text-white text-sm mt-1"
                              rows={2}
                            />
                          ) : field.type === 'select' ? (
                            <select
                              value={field.value}
                              onChange={(e) => updateDynamicField(field.id, { value: e.target.value })}
                              className="w-full p-2 bg-gray-900 border border-gray-600 rounded text-white text-sm mt-1"
                            >
                              <option value="">Select default</option>
                              {field.options?.map((option, index) => (
                                <option key={index} value={option}>{option}</option>
                              ))}
                            </select>
                          ) : (
                            <input
                              type={field.type}
                              placeholder="Default value"
                              value={field.value}
                              onChange={(e) => updateDynamicField(field.id, { value: e.target.value })}
                              className="w-full p-2 bg-gray-900 border border-gray-600 rounded text-white text-sm mt-1"
                            />
                          )}
                        </div>
                      </div>
                    ))}
                    
                    <button
                      type="button"
                      onClick={addDynamicField}
                      className="w-full py-2 border-2 border-dashed border-gray-600 rounded text-gray-400 hover:border-gray-500 hover:text-gray-300"
                    >
                      + Add Custom Field
                    </button>
                  </div>
                )}
              </div>
              
              <VariantConfiguration
                config={variantConfig}
                onChange={setVariantConfig}
              />
              
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
                  src={`${product.image_url}`}
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
                <span>₹{product.display_price || product.price}</span>
                <span className="text-gray-400">
                  Stock: {product.additional_info?.variants && product.additional_info.variants.length > 0 ? 
                    (product.total_variant_stock || product.stock || 0) : product.stock}
                </span>
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
                  src={`${product.image_url}`}
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
                <span>₹{product.display_price || product.price}</span>
                <span className="text-gray-400">
                  Stock: {product.additional_info?.variants && product.additional_info.variants.length > 0 ? 
                    (product.total_variant_stock || product.stock || 0) : product.stock}
                </span>
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