// Helper functions for product variants

export const calculateVariantPrice = (basePrice, priceModifier) => {
  const base = parseFloat(basePrice) || 0;
  const modifier = parseFloat(priceModifier) || 0;
  return base + modifier;
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
  if (!additionalInfo?.variants) return baseStock;
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