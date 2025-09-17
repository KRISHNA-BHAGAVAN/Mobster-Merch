import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface VariantOption {
  size?: string;
  material?: string;
  color?: string;
  [key: string]: string | undefined;
}

interface Variant {
  id: string;
  name: string;
  options: VariantOption;
  price: number;
  stock: number;
  is_default?: boolean;
}

interface VariantField {
  name: string;
  label: string;
  type: 'select';
  options: string[];
}

interface VariantConfig {
  variants: Variant[];
  variant_fields: VariantField[];
  default_variant_id?: string;
}

interface VariantConfigurationProps {
  config: VariantConfig | null;
  onChange: (config: VariantConfig | null) => void;
}

export const VariantConfiguration: React.FC<VariantConfigurationProps> = ({
  config,
  onChange
}) => {
  const [showVariants, setShowVariants] = useState(!!config);

  const addVariantField = () => {
    const newField: VariantField = {
      name: '',
      label: '',
      type: 'select',
      options: ['']
    };
    
    const newConfig = config || { variants: [], variant_fields: [] };
    onChange({
      ...newConfig,
      variant_fields: [...newConfig.variant_fields, newField]
    });
  };

  const updateVariantField = (index: number, updates: Partial<VariantField>) => {
    if (!config) return;
    
    const newFields = [...config.variant_fields];
    newFields[index] = { ...newFields[index], ...updates };
    
    onChange({
      ...config,
      variant_fields: newFields
    });
  };

  const removeVariantField = (index: number) => {
    if (!config) return;
    
    const newFields = config.variant_fields.filter((_, i) => i !== index);
    onChange({
      ...config,
      variant_fields: newFields
    });
  };

  const addFieldOption = (fieldIndex: number) => {
    if (!config) return;
    
    const newFields = [...config.variant_fields];
    newFields[fieldIndex].options.push('');
    
    onChange({
      ...config,
      variant_fields: newFields
    });
  };

  const updateFieldOption = (fieldIndex: number, optionIndex: number, value: string) => {
    if (!config) return;
    
    const newFields = [...config.variant_fields];
    newFields[fieldIndex].options[optionIndex] = value;
    
    onChange({
      ...config,
      variant_fields: newFields
    });
  };

  const removeFieldOption = (fieldIndex: number, optionIndex: number) => {
    if (!config) return;
    
    const newFields = [...config.variant_fields];
    newFields[fieldIndex].options = newFields[fieldIndex].options.filter((_, i) => i !== optionIndex);
    
    onChange({
      ...config,
      variant_fields: newFields
    });
  };

  const generateVariants = () => {
    if (!config || config.variant_fields.length === 0) return;

    const combinations = generateCombinations(config.variant_fields);
    const newVariants: Variant[] = combinations.map((combo, index) => ({
      id: `variant_${Date.now()}_${index}`,
      name: Object.values(combo).join(' - '),
      options: combo,
      price: 0,
      stock: 0,
      is_default: index === 0
    }));

    onChange({
      ...config,
      variants: newVariants,
      default_variant_id: newVariants[0]?.id
    });
  };

  const generateCombinations = (fields: VariantField[]): VariantOption[] => {
    if (fields.length === 0) return [];
    
    const result: VariantOption[] = [];
    
    const generate = (index: number, current: VariantOption) => {
      if (index === fields.length) {
        result.push({ ...current });
        return;
      }
      
      const field = fields[index];
      for (const option of field.options.filter(opt => opt.trim())) {
        generate(index + 1, { ...current, [field.name]: option });
      }
    };
    
    generate(0, {});
    return result;
  };

  const updateVariant = (index: number, updates: Partial<Variant>) => {
    if (!config) return;
    
    const newVariants = [...config.variants];
    newVariants[index] = { ...newVariants[index], ...updates };
    
    // If setting as default, unset other defaults
    if (updates.is_default) {
      newVariants.forEach((variant, i) => {
        if (i !== index) variant.is_default = false;
      });
    }
    
    onChange({
      ...config,
      variants: newVariants,
      default_variant_id: updates.is_default ? newVariants[index].id : config.default_variant_id
    });
  };

  const removeVariant = (index: number) => {
    if (!config) return;
    
    const newVariants = config.variants.filter((_, i) => i !== index);
    onChange({
      ...config,
      variants: newVariants
    });
  };

  const toggleVariants = () => {
    if (showVariants) {
      setShowVariants(false);
      onChange(null);
    } else {
      setShowVariants(true);
      onChange({ variants: [], variant_fields: [] });
    }
  };

  return (
    <div className="border-t border-gray-700 pt-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-white">Product Variants</h3>
        <button
          type="button"
          onClick={toggleVariants}
          className={`py-1 px-3 rounded text-sm transition-colors ${
            showVariants 
              ? 'bg-red-600 text-white hover:bg-red-700' 
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {showVariants ? 'Disable Variants' : 'Enable Variants'}
        </button>
      </div>

      <AnimatePresence>
        {showVariants && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-6"
          >
            {/* Variant Fields Configuration */}
            <div className="bg-gray-800 p-4 rounded border border-gray-600">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-md font-semibold text-white">Variant Options</h4>
                <button
                  type="button"
                  onClick={addVariantField}
                  className="py-1 px-3 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                >
                  Add Option Type
                </button>
              </div>

              {config?.variant_fields.map((field, fieldIndex) => (
                <div key={fieldIndex} className="mb-4 p-3 bg-gray-900 rounded border border-gray-700">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                    <input
                      placeholder="Option Name (e.g., size, color)"
                      value={field.name}
                      onChange={(e) => updateVariantField(fieldIndex, { name: e.target.value })}
                      className="p-2 bg-gray-800 border border-gray-600 rounded text-white text-sm"
                    />
                    <input
                      placeholder="Display Label (e.g., Size, Color)"
                      value={field.label}
                      onChange={(e) => updateVariantField(fieldIndex, { label: e.target.value })}
                      className="p-2 bg-gray-800 border border-gray-600 rounded text-white text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-300">Values:</span>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => addFieldOption(fieldIndex)}
                          className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                        >
                          Add Value
                        </button>
                        <button
                          type="button"
                          onClick={() => removeVariantField(fieldIndex)}
                          className="px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                        >
                          Remove Option
                        </button>
                      </div>
                    </div>
                    
                    {field.options.map((option, optionIndex) => (
                      <div key={optionIndex} className="flex gap-2">
                        <input
                          placeholder={`Value ${optionIndex + 1}`}
                          value={option}
                          onChange={(e) => updateFieldOption(fieldIndex, optionIndex, e.target.value)}
                          className="flex-1 p-2 bg-gray-800 border border-gray-600 rounded text-white text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => removeFieldOption(fieldIndex, optionIndex)}
                          className="px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {config && config.variant_fields.length > 0 && (
                <button
                  type="button"
                  onClick={generateVariants}
                  className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Generate All Combinations
                </button>
              )}
            </div>

            {/* Generated Variants */}
            {config && config.variants.length > 0 && (
              <div className="bg-gray-800 p-4 rounded border border-gray-600">
                <h4 className="text-md font-semibold text-white mb-3">Generated Variants</h4>
                <div className="space-y-3">
                  {config.variants.map((variant, index) => (
                    <div key={variant.id} className={`p-3 bg-gray-900 rounded border ${
                      variant.is_default ? 'border-green-500' : 'border-gray-700'
                    }`}>
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                        <input
                          placeholder="Variant Name"
                          value={variant.name}
                          onChange={(e) => updateVariant(index, { name: e.target.value })}
                          className="p-2 bg-gray-800 border border-gray-600 rounded text-white text-sm"
                        />
                        <input
                          placeholder="Price (₹)"
                          type="number"
                          step="0.1"
                          value={variant.price}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value);
                            updateVariant(index, { price: value });
                          }}
                          required
                          className="p-2 bg-gray-800 border border-gray-600 rounded text-white text-sm"
                        />
                        <input
                          placeholder="Stock"
                          type="number"
                          value={variant.stock}
                          onChange={(e) => {
                            const value = parseInt(e.target.value);
                            updateVariant(index, { stock: value });
                          }}
                          required
                          className="p-2 bg-gray-800 border border-gray-600 rounded text-white text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => updateVariant(index, { is_default: !variant.is_default })}
                          className={`px-3 py-2 rounded text-sm transition-colors ${
                            variant.is_default 
                              ? 'bg-green-600 text-white hover:bg-green-700' 
                              : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                          }`}
                        >
                          {variant.is_default ? 'Default' : 'Set Default'}
                        </button>
                        <button
                          type="button"
                          onClick={() => removeVariant(index)}
                          className="px-3 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                        >
                          Remove
                        </button>
                      </div>
                      <div className="mt-2 text-xs text-gray-400">
                        Options: {Object.entries(variant.options).map(([key, value]) => `${key}: ${value}`).join(', ')}
                        {variant.is_default && <span className="ml-2 text-green-400 font-semibold">(Default Variant)</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};