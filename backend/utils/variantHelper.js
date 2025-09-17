// Helper functions for product variants

export const getDefaultVariant = (additionalInfo) => {
  if (!additionalInfo?.variants) return null;
  return additionalInfo.variants.find(v => v.is_default) || additionalInfo.variants[0];
};

export const getProductDisplayPrice = (product) => {
  if (!product.additional_info?.variants || product.additional_info.variants.length === 0) {
    return parseFloat(product.price) || 0;
  }
  
  const defaultVariant = getDefaultVariant(product.additional_info);
  if (defaultVariant) {
    return parseFloat(defaultVariant.price) || 0;
  }
  
  return parseFloat(product.price) || 0;
};

export const getProductOriginalPrice = (product) => {
  return parseFloat(product.price) || 0;
};

export const findVariantById = (additionalInfo, variantId) => {
  if (!additionalInfo?.variants) return null;
  return additionalInfo.variants.find(v => v.id === variantId);
};

export const getVariantStock = (additionalInfo, variantId) => {
  const variant = findVariantById(additionalInfo, variantId);
  return variant?.stock || 0;
};

export const getTotalStock = (additionalInfo, baseStock) => {
  if (!additionalInfo?.variants || additionalInfo.variants.length === 0) return baseStock;
  return additionalInfo.variants.reduce((total, variant) => total + (variant.stock || 0), 0);
};

export const validateVariantSelection = (additionalInfo, variantId) => {
  if (!additionalInfo?.variants) return { valid: true };
  
  const variant = findVariantById(additionalInfo, variantId);
  if (!variant) {
    return { valid: false, error: 'Invalid variant selected' };
  }
  
  if (variant.stock <= 0) {
    return { valid: false, error: 'Selected variant is out of stock' };
  }
  
  return { valid: true, variant };
};

export const getVariantPrice = (basePrice, variant) => {
  if (!variant) return parseFloat(basePrice) || 0;
  return parseFloat(variant.price) || 0;
};

export const getDefaultVariantStock = (additionalInfo) => {
  const defaultVariant = getDefaultVariant(additionalInfo);
  return defaultVariant?.stock || 0;
};