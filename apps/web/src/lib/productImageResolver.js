export const isRealProductImage = (image) => {
  if (!image || typeof image !== 'string') return false;
  const normalized = image.trim();
  if (!normalized) return false;
  if (normalized.includes('placeholder.svg')) return false;
  return true;
};

export const resolveProductImage = (product) => {
  const validImages = Array.isArray(product?.images)
    ? product.images.filter(isRealProductImage)
    : [];

  if (validImages.length > 0) {
    return validImages[0];
  }

  if (isRealProductImage(product?.image)) {
    return product.image;
  }

  return '';
};
