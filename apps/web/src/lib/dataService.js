import * as appwriteService from './appwriteService';

export const getCollections = async (...args) => {
  return appwriteService.getCollections(...args);
};

export const createCollection = async (...args) => {
  return appwriteService.createCollection(...args);
};

export const updateCollection = async (...args) => {
  return appwriteService.updateCollection(...args);
};

export const deleteCollection = async (...args) => {
  return appwriteService.deleteCollection(...args);
};

export const getProducts = async (...args) => {
  return appwriteService.getProducts(...args);
};

export const createOrUpdateProduct = async (...args) => {
  return appwriteService.createOrUpdateProduct(...args);
};

export const uploadProductImage = async (...args) => {
  return appwriteService.uploadProductImage(...args);
};

export const removeProductImages = async (...args) => {
  return appwriteService.removeProductImages(...args);
};

export const addImagesToProduct = async (...args) => {
  return appwriteService.addImagesToProduct(...args);
};

export const deleteProduct = async (...args) => {
  return appwriteService.deleteProduct(...args);
};

export const restoreProduct = async (...args) => {
  return appwriteService.restoreProduct(...args);
};

export const deleteProductPermanently = async (...args) => {
  return appwriteService.deleteProductPermanently(...args);
};

export const getProductById = async (...args) => {
  return appwriteService.getProductById(...args);
};
