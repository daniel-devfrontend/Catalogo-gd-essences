import * as supabaseService from './supabaseService';

export const getCollections = async (...args) => {
  return supabaseService.getCollections(...args);
};

export const createCollection = async (...args) => {
  return supabaseService.createCollection(...args);
};

export const updateCollection = async (...args) => {
  return supabaseService.updateCollection(...args);
};

export const deleteCollection = async (...args) => {
  return supabaseService.deleteCollection(...args);
};

export const getProducts = async (...args) => {
  return supabaseService.getProducts(...args);
};

export const createOrUpdateProduct = async (...args) => {
  return supabaseService.createOrUpdateProduct(...args);
};

export const uploadProductImage = async (...args) => {
  return supabaseService.uploadProductImage(...args);
};

export const removeProductImages = async (...args) => {
  return supabaseService.removeProductImages(...args);
};

export const addImagesToProduct = async (...args) => {
  return supabaseService.addImagesToProduct(...args);
};

export const deleteProduct = async (...args) => {
  return supabaseService.deleteProduct(...args);
};

export const restoreProduct = async (...args) => {
  return supabaseService.restoreProduct(...args);
};

export const deleteProductPermanently = async (...args) => {
  return supabaseService.deleteProductPermanently(...args);
};

export const getProductById = async (...args) => {
  return supabaseService.getProductById(...args);
};
