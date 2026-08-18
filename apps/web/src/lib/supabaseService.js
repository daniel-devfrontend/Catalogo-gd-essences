import { supabase, supabaseEnabled } from '@/lib/supabaseClient';
import { perfumes as basePerfumes, collections as baseCollections } from '@/data/perfumes.js';

const isEnabled = supabaseEnabled;
const PRODUCT_CACHE_KEY = 'gd-essences-products-cache';
const COLLECTION_CACHE_KEY = 'gd-essences-collections-cache';
const CACHE_TTL_MS = 10 * 60 * 1000;

const readCache = (key) => {
  try {
    const cachedValue = window.localStorage.getItem(key);
    if (!cachedValue) return null;

    const parsed = JSON.parse(cachedValue);
    if (!parsed || typeof parsed !== 'object') return null;
    if (Date.now() - (parsed.savedAt || 0) > CACHE_TTL_MS) {
      window.localStorage.removeItem(key);
      return null;
    }

    return parsed.value;
  } catch (error) {
    return null;
  }
};

const writeCache = (key, value) => {
  try {
    window.localStorage.setItem(key, JSON.stringify({ value, savedAt: Date.now() }));
  } catch (error) {
    // Ignore cache write failures silently.
  }
};

const clearCache = (key) => {
  try {
    window.localStorage.removeItem(key);
  } catch (error) {
    // Ignore cache clear failures silently.
  }
};

const isExpiredDeletedProduct = (product) => {
  if (!product?.deleted_at) return false;
  const deletedAt = new Date(product.deleted_at);
  if (Number.isNaN(deletedAt.getTime())) return false;
  return Date.now() - deletedAt.getTime() > 7 * 24 * 60 * 60 * 1000;
};

const getLocalProductsFallback = () => [...basePerfumes];
const getLocalCollectionsFallback = () => [...baseCollections];

const fallbackWhenRemoteFails = (fallbackValue, error) => {
  console.warn('Fallo al cargar datos remotos. Se usa el catálogo local.', error);
  return fallbackValue;
};

const purgeExpiredDeletedProducts = async (products) => {
  const activeProducts = products.filter((product) => !isExpiredDeletedProduct(product));
  if (activeProducts.length === products.length) {
    return products;
  }

  const expiredIds = products.filter((product) => isExpiredDeletedProduct(product)).map((product) => product.id);
  if (expiredIds.length && supabase) {
    await supabase.from('products').delete().in('id', expiredIds);
  }

  return activeProducts;
};

export const getCollections = async () => {
  const cachedCollections = readCache(COLLECTION_CACHE_KEY);
  if (cachedCollections) {
    return cachedCollections;
  }

  if (!isEnabled || !supabase) {
    const fallback = getLocalCollectionsFallback();
    writeCache(COLLECTION_CACHE_KEY, fallback);
    return fallback;
  }

  try {
    const { data, error } = await supabase.from('collections').select('id,title,description').order('title');
    if (error) throw error;

    const merged = new Map();
    [...baseCollections, ...(data || [])].forEach((collection) => merged.set(collection.id, collection));
    const result = Array.from(merged.values());
    writeCache(COLLECTION_CACHE_KEY, result);
    return result;
  } catch (error) {
    const fallback = getLocalCollectionsFallback();
    writeCache(COLLECTION_CACHE_KEY, fallback);
    return fallbackWhenRemoteFails(fallback, error);
  }
};

export const createCollection = async (collection) => {
  if (!isEnabled || !supabase) {
    throw new Error('Supabase no está configurado.');
  }

  const { error } = await supabase.from('collections').upsert(collection);
  if (error) throw error;
  clearCache(COLLECTION_CACHE_KEY);
  return getCollections();
};

export const getProducts = async () => {
  const cachedProducts = readCache(PRODUCT_CACHE_KEY);
  if (cachedProducts) {
    return cachedProducts;
  }

  if (!isEnabled || !supabase) {
    const fallback = getLocalProductsFallback();
    writeCache(PRODUCT_CACHE_KEY, fallback);
    return fallback;
  }

  try {
    const { data, error } = await supabase.from('products').select('*');
    if (error) throw error;

    const merged = new Map();
    basePerfumes.forEach((product) => merged.set(product.id, { ...product, status: 'published' }));
    (data || []).forEach((product) => {
      const existing = merged.get(product.id) || {};
      merged.set(product.id, {
        ...existing,
        ...product,
        originalPrice: product.original_price ?? product.originalPrice,
        videoUrl: product.video_url || product.videoUrl,
        deletedAt: product.deleted_at ?? product.deletedAt ?? null,
        status: product.status || (product.deleted_at ? 'draft' : existing.status || 'published'),
      });
    });

    const result = await purgeExpiredDeletedProducts(Array.from(merged.values()));
    writeCache(PRODUCT_CACHE_KEY, result);
    return result;
  } catch (error) {
    const fallback = getLocalProductsFallback();
    writeCache(PRODUCT_CACHE_KEY, fallback);
    return fallbackWhenRemoteFails(fallback, error);
  }
};

export const createOrUpdateProduct = async (product) => {
  if (!isEnabled || !supabase) {
    throw new Error('Supabase no está configurado.');
  }

  const {
    originalPrice,
    videoUrl,
    deletedAt,
    deleted_at,
    original_price,
    video_url,
    ...rest
  } = product;

  const productWithStatus = {
    ...rest,
    original_price: originalPrice ?? original_price ?? null,
    video_url: video_url || videoUrl || null,
    deleted_at: deleted_at ?? deletedAt ?? null,
    status: product.status ?? 'published',
  };
  // Only send known columns to avoid schema errors if some columns (eg. deleted_at) don't exist
  const allowedCols = ['id', 'name', 'price', 'original_price', 'description', 'collection', 'image', 'images', 'video_url', 'status', 'deleted_at'];
  const payload = {};
  allowedCols.forEach((col) => {
    if (Object.prototype.hasOwnProperty.call(productWithStatus, col)) {
      // avoid sending undefined
      const v = productWithStatus[col];
      if (v !== undefined) payload[col] = v;
    }
  });

  const { data, error } = await supabase.from('products').upsert(payload, { onConflict: 'id' }).select('*');
  if (error) throw error;
  clearCache(PRODUCT_CACHE_KEY);
  return data;
};

const readFileAsDataUrl = (file) => new Promise((resolve, reject) => {
  if (typeof file === 'string') {
    resolve(file);
    return;
  }

  const reader = new FileReader();
  reader.onload = () => resolve(reader.result);
  reader.onerror = () => reject(new Error('No se pudo leer la imagen.'));
  reader.readAsDataURL(file);
});

export const uploadProductImage = async (file) => {
  if (!isEnabled || !supabase) {
    throw new Error('Supabase no está configurado.');
  }

  return await readFileAsDataUrl(file);
};

export const addImagesToProduct = async (productId, imageUrls) => {
  if (!isEnabled || !supabase) {
    throw new Error('Supabase no está configurado.');
  }

  const { data: existing, error: fetchError } = await supabase.from('products').select('images').eq('id', productId).single();
  if (fetchError) throw fetchError;

  const images = Array.isArray(existing?.images) ? [...existing.images, ...imageUrls] : [...imageUrls];
  // Only update images column to avoid sending unknown columns
  const { data, error } = await supabase.from('products').upsert({ id: productId, images }, { onConflict: 'id' }).select('*');
  if (error) throw error;
  clearCache(PRODUCT_CACHE_KEY);
  return data;
};

export const deleteProduct = async (productId) => {
  if (!isEnabled || !supabase) {
    throw new Error('Supabase no está configurado.');
  }

  const deletedAt = new Date().toISOString();
  const { data, error } = await supabase.from('products').upsert({ id: productId, status: 'draft', deleted_at: deletedAt }, { onConflict: 'id' }).select('*');
  if (error) throw error;
  clearCache(PRODUCT_CACHE_KEY);
  return data;
};

export const deleteProductPermanently = async (productId) => {
  if (!isEnabled || !supabase) {
    throw new Error('Supabase no está configurado.');
  }

  const { error } = await supabase.from('products').delete().eq('id', productId);
  if (error) throw error;
  clearCache(PRODUCT_CACHE_KEY);
  return getProducts();
};

export const getProductById = async (productId) => {
  const products = await getProducts();
  return products.find((product) => product.id === productId) || null;
};
